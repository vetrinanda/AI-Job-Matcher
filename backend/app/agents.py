"""AI Suggestion Agent — uses Google Gemini to generate resume improvement suggestions."""

import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
from app.models import SectionScore, SectionSuggestion

load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))


def build_prompt(
    resume_text: str,
    job_description: str,
    overall_score: float,
    section_scores: list[SectionScore],
) -> str:
    """Build the prompt for Gemini to generate improvement suggestions."""

    section_details = "\n".join(
        f"  - {s.section_name}: {s.score}/100 (weight: {s.max_weight}%)\n"
        f"    Matched keywords: {', '.join(s.matched_keywords) if s.matched_keywords else 'None'}\n"
        f"    Missing keywords: {', '.join(s.missing_keywords) if s.missing_keywords else 'None'}"
        for s in section_scores
    )

    return f"""You are an expert ATS (Applicant Tracking System) resume consultant. Analyze the following resume against the job description and provide detailed, actionable improvement suggestions.

## Job Description:
{job_description}

## Resume Text:
{resume_text}

## Current ATS Score: {overall_score}/100

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

## IMPORTANT:
Respond ONLY with a valid JSON array of objects. No markdown, no explanations outside the JSON.
Example format:
[
  {{
    "section_name": "Summary",
    "current_assessment": "...",
    "suggestion": "...",
    "keywords_to_add": ["keyword1", "keyword2"],
    "example_text": "..."
  }}
]
"""


async def generate_suggestions(
    resume_text: str,
    job_description: str,
    overall_score: float,
    section_scores: list[SectionScore],
) -> list[SectionSuggestion]:
    """Generate AI-powered improvement suggestions using Google Gemini.

    Only called when ATS score < 75.

    Args:
        resume_text: Extracted text from the resume
        job_description: The job description text
        overall_score: Current ATS score
        section_scores: Per-section score breakdowns

    Returns:
        List of SectionSuggestion objects
    """
    prompt = build_prompt(resume_text, job_description, overall_score, section_scores)

    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt)

        # Parse the JSON response
        response_text = response.text.strip()

        # Clean up response — remove markdown code fences if present
        if response_text.startswith("```"):
            lines = response_text.split("\n")
            # Remove first and last lines (code fences)
            lines = [l for l in lines if not l.strip().startswith("```")]
            response_text = "\n".join(lines)

        suggestions_data = json.loads(response_text)

        suggestions = []
        for item in suggestions_data:
            suggestions.append(SectionSuggestion(
                section_name=item.get("section_name", "Unknown"),
                current_assessment=item.get("current_assessment", ""),
                suggestion=item.get("suggestion", ""),
                keywords_to_add=item.get("keywords_to_add", []),
                example_text=item.get("example_text", ""),
            ))

        return suggestions

    except json.JSONDecodeError:
        # If Gemini returns non-JSON, create a generic suggestion
        return [SectionSuggestion(
            section_name="General",
            current_assessment="Unable to parse detailed analysis.",
            suggestion=response.text if 'response' in dir() else "Please try again.",
            keywords_to_add=[],
            example_text="",
        )]
    except Exception as e:
        return [SectionSuggestion(
            section_name="Error",
            current_assessment=f"An error occurred: {str(e)}",
            suggestion="Please check your GOOGLE_API_KEY in .env and try again.",
            keywords_to_add=[],
            example_text="",
        )]
