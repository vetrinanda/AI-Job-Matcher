"""Pydantic models for ATS analysis request/response."""

from pydantic import BaseModel, Field


class SectionScore(BaseModel):
    """Score breakdown for a single resume section."""
    section_name: str = Field(description="Name of the resume section")
    score: float = Field(ge=0, le=100, description="Score for this section (0-100)")
    max_weight: float = Field(description="Weight of this section in overall score (%)")
    matched_keywords: list[str] = Field(default_factory=list, description="Keywords found in this section")
    missing_keywords: list[str] = Field(default_factory=list, description="Important keywords missing from this section")


class SectionSuggestion(BaseModel):
    """AI-generated improvement suggestion for a resume section."""
    section_name: str = Field(description="Name of the resume section")
    current_assessment: str = Field(description="What the section currently looks like / issues found")
    suggestion: str = Field(description="Detailed suggestion on how to improve this section")
    keywords_to_add: list[str] = Field(default_factory=list, description="Specific keywords/phrases to incorporate")
    example_text: str = Field(default="", description="Example rewritten text for this section")


class ATSResult(BaseModel):
    """Complete ATS analysis result."""
    overall_score: float = Field(ge=0, le=100, description="Overall ATS compatibility score (0-100)")
    status: str = Field(description="Score status: 'Excellent', 'Good', 'Needs Improvement', 'Poor'")
    section_scores: list[SectionScore] = Field(default_factory=list, description="Per-section score breakdown")
    summary: str = Field(description="Brief overall assessment of the resume")
    suggestions: list[SectionSuggestion] = Field(default_factory=list, description="Improvement suggestions (populated when score < 75)")
    resume_text: str = Field(default="", description="Extracted resume text")
    job_description: str = Field(default="", description="Original job description")


class RewrittenResume(BaseModel):
    """AI-rewritten resume sections tailored to a job description."""
    professional_summary: str = Field(description="Rewritten professional summary/objective")
    skills: str = Field(description="Rewritten skills section with relevant skills highlighted")
    experience: str = Field(description="Rewritten work experience with JD-aligned bullet points")
    projects: str = Field(description="Rewritten projects section aligned to the role")
    education: str = Field(description="Rewritten education section with relevant highlights")
    additional_tips: str = Field(default="", description="Any additional tips or notes for the candidate")


class RewriteResult(BaseModel):
    """Response for the resume rewrite endpoint."""
    rewritten_resume: RewrittenResume = Field(description="The fully rewritten resume sections")
    original_score: float = Field(description="Original ATS score before rewrite")
    message: str = Field(description="Message to the user about the rewrite")

