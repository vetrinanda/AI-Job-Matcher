"""API routes for the AI Job Matcher."""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.resume_parser import parse_resume
from app.ats_scorer import calculate_ats_score
from app.agents import generate_suggestions, rewrite_resume
from app.models import ATSResult, RewriteResult

router = APIRouter(prefix="/api")


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "AI Job Matcher"}


@router.post("/analyze", response_model=ATSResult)
async def analyze_resume(
    resume: UploadFile = File(..., description="Resume file (PDF or DOCX)"),
    job_description: str = Form(..., description="Job description text"),
):
    """Analyze a resume against a job description and return ATS score with suggestions.

    - Accepts PDF or DOCX resume files
    - Calculates ATS compatibility score (0-100)
    - If score < 75, generates AI-powered improvement suggestions for each section
    """
    # Validate file type
    if not resume.filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    allowed_extensions = (".pdf", ".docx")
    if not resume.filename.lower().endswith(allowed_extensions):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format. Please upload a PDF or DOCX file. Got: {resume.filename}",
        )

    # Validate job description
    if not job_description or len(job_description.strip()) < 20:
        raise HTTPException(
            status_code=400,
            detail="Job description is too short. Please provide a meaningful job description (at least 20 characters).",
        )

    try:
        # 1. Parse resume
        print(f"[INFO] Parsing resume: {resume.filename}")
        file_bytes = await resume.read()
        resume_text = parse_resume(file_bytes, resume.filename)

        if not resume_text or len(resume_text.strip()) < 20:
            raise HTTPException(
                status_code=400,
                detail="Could not extract meaningful text from the resume. Please check the file.",
            )
        print(f"[INFO] Extracted {len(resume_text)} chars from resume")

        # 2. Calculate ATS score
        overall_score, status, section_scores = calculate_ats_score(
            resume_text, job_description.strip()
        )
        print(f"[INFO] ATS Score: {overall_score} — {status}")

        # 3. Generate suggestions if score < 75
        suggestions = []
        if overall_score < 75:
            print("[INFO] Score < 75, generating AI suggestions...")
            suggestions = await generate_suggestions(
                resume_text, job_description.strip(), overall_score, section_scores
            )
            print(f"[INFO] Generated {len(suggestions)} suggestions")

        # 4. Build summary
        if overall_score >= 80:
            summary = (
                f"Great job! Your resume is well-aligned with this job description "
                f"with a score of {overall_score}/100. Minor tweaks could help further."
            )
        elif overall_score >= 65:
            summary = (
                f"Your resume is a decent match ({overall_score}/100) but has room for improvement. "
                f"Review the suggestions below to boost your ATS score."
            )
        elif overall_score >= 45:
            summary = (
                f"Your resume needs significant improvement ({overall_score}/100). "
                f"There are several important keywords and sections missing. "
                f"Follow the suggestions below carefully."
            )
        else:
            summary = (
                f"Your resume has a low ATS score ({overall_score}/100). "
                f"It appears to be a poor match for this job description. "
                f"Consider a major rewrite tailored to this specific role."
            )

        return ATSResult(
            overall_score=overall_score,
            status=status,
            section_scores=section_scores,
            summary=summary,
            suggestions=suggestions,
            resume_text=resume_text[:2000],  # Cap for response size
            job_description=job_description.strip()[:2000],
        )

    except HTTPException:
        raise  # Re-raise HTTP exceptions as-is (don't wrap 400s as 500s)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred during analysis: {str(e)}",
        )


@router.post("/rewrite", response_model=RewriteResult)
async def rewrite_resume_endpoint(
    resume: UploadFile = File(..., description="Resume file (PDF or DOCX)"),
    job_description: str = Form(..., description="Job description text"),
):
    """Rewrite a resume to maximize ATS compatibility with a job description.

    Generates a fully rewritten resume with all sections tailored to the JD.
    """
    if not resume.filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    allowed_extensions = (".pdf", ".docx")
    if not resume.filename.lower().endswith(allowed_extensions):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format. Got: {resume.filename}",
        )

    if not job_description or len(job_description.strip()) < 20:
        raise HTTPException(
            status_code=400,
            detail="Job description is too short (min 20 characters).",
        )

    try:
        # 1. Parse resume
        file_bytes = await resume.read()
        resume_text = parse_resume(file_bytes, resume.filename)

        if not resume_text or len(resume_text.strip()) < 20:
            raise HTTPException(
                status_code=400,
                detail="Could not extract meaningful text from the resume.",
            )

        # 2. Get the ATS score first
        overall_score, status, _ = calculate_ats_score(
            resume_text, job_description.strip()
        )
        print(f"[INFO] Rewrite requested — current ATS score: {overall_score}")

        # 3. Rewrite the resume
        rewritten = await rewrite_resume(
            resume_text, job_description.strip(), overall_score
        )
        print("[INFO] Resume rewrite completed")

        return RewriteResult(
            rewritten_resume=rewritten,
            original_score=overall_score,
            message=f"Your resume has been rewritten to better match this job description. Original ATS score was {overall_score}/100.",
        )

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred during rewrite: {str(e)}",
        )
