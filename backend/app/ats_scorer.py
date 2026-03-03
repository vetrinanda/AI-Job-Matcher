"""ATS Scoring Engine — keyword-based resume scoring against job descriptions."""

import re
from collections import Counter
from app.models import SectionScore


# Common stop words to filter out
STOP_WORDS = {
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of",
    "with", "by", "from", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could", "should",
    "may", "might", "shall", "can", "need", "must", "it", "its", "this", "that",
    "these", "those", "i", "me", "my", "we", "our", "you", "your", "he", "she",
    "they", "them", "their", "what", "which", "who", "whom", "how", "when",
    "where", "why", "all", "each", "every", "both", "few", "more", "most",
    "other", "some", "such", "no", "not", "only", "same", "so", "than", "too",
    "very", "just", "about", "above", "after", "again", "also", "as", "any",
    "because", "before", "between", "during", "if", "into", "through", "under",
    "up", "out", "over", "then", "once", "here", "there", "already", "able",
    "work", "working", "experience", "strong", "using", "etc", "eg", "ie",
    "well", "good", "new", "years", "year", "including", "like", "ensure",
    "across", "within", "ability", "looking", "role", "team", "join", "company",
    "responsibilities", "requirements", "qualifications", "preferred", "required",
    "minimum", "plus", "ideal", "candidate", "position", "job", "description",
}

# Section header patterns for detecting resume sections (no inline flags — use re.IGNORECASE)
SECTION_PATTERNS = {
    "summary": r"(summary|objective|profile|about\s*me|personal\s*statement|professional\s*summary)",
    "skills": r"(skills|technical\s*skills|core\s*competencies|technologies|tech\s*stack|proficiencies)",
    "experience": r"(experience|work\s*experience|employment|professional\s*experience|work\s*history)",
    "education": r"(education|academic|degree|university|college|certification|certifications)",
    "projects": r"(projects|personal\s*projects|key\s*projects|portfolio|academic\s*projects)",
}


def extract_keywords(text: str) -> list[str]:
    """Extract meaningful keywords from text, filtering out stop words."""
    # Tokenize: split on non-alphanumeric characters
    words = re.findall(r"[a-zA-Z][a-zA-Z0-9+#.]*(?:\s[a-zA-Z][a-zA-Z0-9+#.]*)?", text.lower())
    # Filter stop words and very short words
    keywords = [w.strip() for w in words if w.strip() not in STOP_WORDS and len(w.strip()) > 1]
    return keywords


def extract_bigrams(text: str) -> list[str]:
    """Extract meaningful two-word phrases from text."""
    words = re.findall(r"[a-zA-Z][a-zA-Z0-9+#.]*", text.lower())
    filtered = [w for w in words if w not in STOP_WORDS and len(w) > 1]
    bigrams = [f"{filtered[i]} {filtered[i+1]}" for i in range(len(filtered) - 1)]
    return bigrams


def extract_section_text(resume_text: str, section_name: str) -> str:
    """Try to extract text belonging to a specific section of the resume."""
    pattern = SECTION_PATTERNS.get(section_name, "")
    if not pattern:
        return resume_text

    lines = resume_text.split("\n")
    section_start = -1
    section_end = len(lines)

    # Find the start of the target section
    for i, line in enumerate(lines):
        if re.search(pattern, line, re.IGNORECASE):
            section_start = i
            break

    if section_start == -1:
        return ""  # Section not found

    # Find the start of the next section (end of current section)
    all_patterns = "|".join(
        p for name, p in SECTION_PATTERNS.items() if name != section_name
    )
    for i in range(section_start + 1, len(lines)):
        if re.search(all_patterns, lines[i], re.IGNORECASE):
            section_end = i
            break

    return "\n".join(lines[section_start:section_end])


def calculate_keyword_match(jd_keywords: list[str], resume_keywords: list[str]) -> tuple[float, list[str], list[str]]:
    """Calculate keyword match percentage between JD and resume.

    Returns:
        (match_percentage, matched_keywords, missing_keywords)
    """
    jd_counter = Counter(jd_keywords)
    resume_set = set(resume_keywords)

    # Get unique JD keywords by frequency (more frequent = more important)
    important_jd_keywords = [kw for kw, _ in jd_counter.most_common()]

    if not important_jd_keywords:
        return 100.0, [], []

    matched = [kw for kw in important_jd_keywords if kw in resume_set]
    missing = [kw for kw in important_jd_keywords if kw not in resume_set]

    match_pct = (len(matched) / len(important_jd_keywords)) * 100
    return match_pct, matched[:20], missing[:20]  # Cap lists for readability


def score_section(
    section_name: str,
    resume_text: str,
    jd_text: str,
    weight: float,
) -> SectionScore:
    """Score a single resume section against the job description."""
    section_text = extract_section_text(resume_text, section_name)

    # Extract keywords from both
    jd_keywords = extract_keywords(jd_text)
    jd_bigrams = extract_bigrams(jd_text)

    if section_text:
        resume_keywords = extract_keywords(section_text)
        resume_bigrams = extract_bigrams(section_text)
    else:
        resume_keywords = []
        resume_bigrams = []

    # Calculate unigram and bigram match
    uni_pct, uni_matched, uni_missing = calculate_keyword_match(jd_keywords, resume_keywords)
    bi_pct, bi_matched, bi_missing = calculate_keyword_match(jd_bigrams, resume_bigrams)

    # Weighted combination: bigrams matter more for context
    score = (uni_pct * 0.5 + bi_pct * 0.5)

    # Boost score a bit if section exists at all (having the section is good)
    if section_text:
        score = min(100, score + 5)
    else:
        # Penalize missing sections more
        score = max(0, score - 15)

    # Combine matched/missing from both
    all_matched = list(set(uni_matched + bi_matched))
    all_missing = list(set(uni_missing + bi_missing))

    return SectionScore(
        section_name=section_name.replace("_", " ").title(),
        score=round(min(100, max(0, score)), 1),
        max_weight=weight,
        matched_keywords=all_matched[:15],
        missing_keywords=all_missing[:15],
    )


def calculate_ats_score(resume_text: str, job_description: str) -> tuple[float, str, list[SectionScore]]:
    """Calculate the overall ATS score for a resume against a job description.

    Args:
        resume_text: Extracted text from the resume
        job_description: The job description text

    Returns:
        (overall_score, status, section_scores)
    """
    # Section weights (must sum to 100)
    sections = {
        "skills": 30.0,
        "experience": 25.0,
        "projects": 15.0,
        "summary": 10.0,
        "education": 10.0,
    }

    section_scores: list[SectionScore] = []
    weighted_total = 0.0

    for section_name, weight in sections.items():
        section_score = score_section(section_name, resume_text, job_description, weight)
        section_scores.append(section_score)
        weighted_total += section_score.score * (weight / 100.0)

    # Also compute an overall keyword match (not section-specific) for remaining weight
    overall_jd_kw = extract_keywords(job_description)
    overall_resume_kw = extract_keywords(resume_text)
    overall_pct, overall_matched, overall_missing = calculate_keyword_match(overall_jd_kw, overall_resume_kw)

    keyword_section = SectionScore(
        section_name="Overall Keywords",
        score=round(overall_pct, 1),
        max_weight=10.0,
        matched_keywords=overall_matched,
        missing_keywords=overall_missing,
    )
    section_scores.append(keyword_section)
    weighted_total += overall_pct * 0.10

    overall_score = round(min(100, max(0, weighted_total)), 1)

    # Determine status
    if overall_score >= 80:
        status = "Excellent"
    elif overall_score >= 65:
        status = "Good"
    elif overall_score >= 45:
        status = "Needs Improvement"
    else:
        status = "Poor"

    return overall_score, status, section_scores
