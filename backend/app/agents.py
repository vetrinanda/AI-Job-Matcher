"""AI Suggestion Agent — uses Pydantic AI with Google Gemini to generate resume improvement suggestions. and updates it"""

import os
from dataclasses import dataclass

from dotenv import load_dotenv
from pydantic import BaseModel, Field
from pydantic_ai import Agent, RunContext

from app.models import SectionScore, SectionSuggestion

load_dotenv()

#Protect your api keys dont push it to github
# ── Dependencies passed to the agent at runtime ──────────────────────────────
@dataclass
class AnalysisDeps:
    """Dependencies injected into the agent at runtime."""
    resume_text: str
    job_description: str
    overall_score: float
    section_scores: list[SectionScore]


# ── Structured output model ──────────────────────────────────────────────────
class SuggestionsOutput(BaseModel):
    """Structured output: a list of per-section improvement suggestions."""
    suggestions: list[SectionSuggestion] = Field(
        description="List of improvement suggestions, one per resume section"
    )


# ── Build the Pydantic AI Agent ──────────────────────────────────────────────
suggestion_agent = Agent(
    "google-gla:gemini-3-flash-preview",
    deps_type=AnalysisDeps,
    output_type=SuggestionsOutput,
    instructions=(
        "You are an expert ATS (Applicant Tracking System) resume consultant. "
        "Analyze the resume against the job description and provide detailed, "
        "actionable improvement suggestions for each section."
    ),
)


@suggestion_agent.instructions
def dynamic_instructions(ctx: RunContext[AnalysisDeps]) -> str:
    """Inject the resume, JD, scores, and section details into the prompt."""
    deps = ctx.deps

    section_details = "\n".join(
        f"  - {s.section_name}: {s.score}/100 (weight: {s.max_weight}%)\n"
        f"    Matched keywords: {', '.join(s.matched_keywords) if s.matched_keywords else 'None'}\n"
        f"    Missing keywords: {', '.join(s.missing_keywords) if s.missing_keywords else 'None'}"
        for s in deps.section_scores
    )

    return f"""
## Job Description:
{deps.job_description}

## Resume Text:
{deps.resume_text}

## Current ATS Score: {deps.overall_score}/100

## Section Breakdown:
{section_details}

## Your Task:
Provide detailed improvement suggestions for EACH of these sections:
1. **Summary** — How to write a compelling professional summary that matches the JD
2. **Skills** — Which skills to add, remove, or emphasize
3. **Experience** — How to rewrite experience bullets to match JD keywords
4. **Projects** — How to present projects to align with the role
5. **Education** — Any certifications or education highlights to emphasize
6. **Keywords** — Critical keywords/phrases missing from the resume

For EACH section, provide:
- `section_name`: Name of the section
- `current_assessment`: A brief assessment of what's currently wrong or missing
- `suggestion`: A detailed, actionable suggestion (2-4 sentences)
- `keywords_to_add`: A list of specific keywords/phrases to incorporate
- `example_text`: An example rewritten snippet for that section
"""


# ── Public API ───────────────────────────────────────────────────────────────
async def generate_suggestions(
    resume_text: str,
    job_description: str,
    overall_score: float,
    section_scores: list[SectionScore],
) -> list[SectionSuggestion]:
    """Generate AI-powered improvement suggestions using Pydantic AI + Google Gemini.

    Only called when ATS score < 75.

    Args:
        resume_text: Extracted text from the resume
        job_description: The job description text
        overall_score: Current ATS score
        section_scores: Per-section score breakdowns

    Returns:
        List of SectionSuggestion objects
    """
    deps = AnalysisDeps(
        resume_text=resume_text,
        job_description=job_description,
        overall_score=overall_score,
        section_scores=section_scores,
    )

    try:
        result = await suggestion_agent.run(
            "Analyze this resume against the job description and provide improvement suggestions for each section.",
            deps=deps,
        )
        return result.output.suggestions

    except Exception as e:
        # Fallback: return a generic error suggestion
        return [SectionSuggestion(
            section_name="Error",
            current_assessment=f"An error occurred during AI analysis: {str(e)}",
            suggestion="Please check your GOOGLE_API_KEY in the .env file and try again.",
            keywords_to_add=[],
            example_text="",
        )]


# ══════════════════════════════════════════════════════════════════════════════
#  Resume Rewrite Agent
# ══════════════════════════════════════════════════════════════════════════════

from app.models import RewrittenResume


@dataclass
class RewriteDeps:
    """Dependencies injected into the rewrite agent."""
    resume_text: str
    job_description: str
    overall_score: float


rewrite_agent = Agent(
    "google-gla:gemini-3-flash-preview",
    deps_type=RewriteDeps,
    output_type=RewrittenResume,
    instructions=(
        "You are an expert resume writer and ATS optimization specialist. "
        "Your job is to completely rewrite the candidate's resume to maximize "
        "ATS compatibility with the target job description while preserving "
        "the candidate's actual experience and qualifications. "
        "Do NOT fabricate experience or skills the candidate doesn't have — "
        "instead, reframe and emphasize existing experience using the right keywords."
    ),
)


@rewrite_agent.instructions
def rewrite_dynamic_instructions(ctx: RunContext[RewriteDeps]) -> str:
    """Inject the resume, JD, and score into the rewrite prompt."""
    deps = ctx.deps
    return f"""
## Original Resume:
{deps.resume_text}

## Target Job Description:
{deps.job_description}

## Current ATS Score: {deps.overall_score}/100

## Your Task:
Completely rewrite each section of this resume to maximize ATS compatibility with the job description above.

**Rules:**
- Preserve the candidate's REAL experience, projects, and education — do NOT invent anything
- Reframe bullet points to use keywords and phrases from the job description
- Use strong action verbs and quantify achievements where possible
- Ensure the professional summary is tailored specifically to this role
- Highlight the most relevant skills from the JD that the candidate actually has
- Format each section as clean, professional text ready to copy-paste into a resume

**For each section, write the full content** (not just tips — write the actual resume text):
- `professional_summary`: A compelling 3-4 sentence professional summary
- `skills`: A well-organized skills list matching the JD
- `experience`: Full rewritten work experience bullets
- `projects`: Rewritten project descriptions aligned to the role
- `education`: Education section with relevant highlights
- `additional_tips`: Any extra advice for the candidate
"""


async def rewrite_resume(
    resume_text: str,
    job_description: str,
    overall_score: float,
) -> RewrittenResume:
    """Generate a fully rewritten resume tailored to the job description.

    Args:
        resume_text: Original extracted resume text
        job_description: Target job description
        overall_score: Current ATS score

    Returns:
        RewrittenResume with all sections rewritten
    """
    deps = RewriteDeps(
        resume_text=resume_text,
        job_description=job_description,
        overall_score=overall_score,
    )

    try:
        result = await rewrite_agent.run(
            "Rewrite this entire resume to maximize ATS compatibility with the target job description.",
            deps=deps,
        )
        return result.output

    except Exception as e:
        # Return a fallback with the error
        return RewrittenResume(
            professional_summary=f"Error generating rewrite: {str(e)}",
            skills="Please check your GOOGLE_API_KEY and try again.",
            experience="",
            projects="",
            education="",
            additional_tips="",
        )

