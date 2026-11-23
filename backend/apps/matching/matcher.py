import logging
from decimal import Decimal

logger = logging.getLogger(__name__)


def calculate_job_match(candidate_profile, job_post, nlp_weight=0.15):
    """
    Calculates a transparent, weighted AI matching score between a candidate and a job posting.
    
    1. Weighted Skill Matching:
       - Evaluates mandatory vs optional skills based on recruiter-defined weights (1-5).
       - Compares against candidate's profile skills.
    2. Missing Skills Analysis:
       - Pinpoints exactly which skills the candidate lacks to assist upskilling.
    3. NLP Content Matching (Pluggable):
       - If enabled and resume text exists, blends cosine similarity between resume and job description.
    """
    required_skills = list(job_post.required_skills.select_related('skill').all())
    
    if not required_skills:
        # If no specific skills required, default to 100% baseline match
        return {
            'match_score': 100.0,
            'skill_score': 100.0,
            'nlp_score': 0.0,
            'matched_skills': [],
            'missing_skills': [],
            'mandatory_met': True,
        }

    # Set of skill IDs possessed by candidate
    candidate_skill_ids = set(candidate_profile.skills.values_list('skill_id', flat=True))

    total_weight = sum(rs.weight for rs in required_skills)
    matched_weight = 0
    matched_skills = []
    missing_skills = []
    mandatory_failed = False

    for rs in required_skills:
        skill_name = rs.skill.name
        if rs.skill_id in candidate_skill_ids:
            matched_weight += rs.weight
            matched_skills.append(skill_name)
        else:
            missing_skills.append({
                'name': skill_name,
                'weight': rs.weight,
                'is_mandatory': rs.is_mandatory
            })
            if rs.is_mandatory:
                mandatory_failed = True

    # Base skill percentage
    skill_pct = (matched_weight / total_weight) * 100.0 if total_weight > 0 else 0.0

    # If mandatory skills are missed, cap the max achievable skill score to 60%
    if mandatory_failed and skill_pct > 60.0:
        skill_score = 60.0 * (skill_pct / 100.0)
    else:
        skill_score = skill_pct

    # Optional NLP similarity layer using Scikit-Learn
    nlp_score = 0.0
    try:
        from .nlp_matcher import compute_text_similarity
        
        # Combine candidate text (bio + headline + resume text)
        primary_resume = candidate_profile.resumes.filter(is_primary=True).first()
        resume_text = primary_resume.extracted_text if primary_resume else ""
        candidate_corpus = f"{candidate_profile.headline} {candidate_profile.bio} {resume_text}".strip()
        job_corpus = f"{job_post.title} {job_post.description}".strip()

        if candidate_corpus and job_corpus:
            nlp_score = compute_text_similarity(candidate_corpus, job_corpus)
    except Exception as e:
        logger.warning(f"NLP similarity calculation skipped: {e}")
        nlp_score = 0.0

    # Weighted blend: Skill score + NLP similarity score
    if nlp_score > 0:
        final_score = ((1.0 - nlp_weight) * skill_score) + (nlp_weight * nlp_score)
    else:
        final_score = skill_score

    final_score = max(0.0, min(100.0, final_score))

    return {
        'match_score': round(final_score, 2),
        'skill_score': round(skill_score, 2),
        'nlp_score': round(nlp_score, 2),
        'matched_skills': matched_skills,
        'missing_skills': [s['name'] for s in missing_skills],
        'missing_skills_details': missing_skills,
        'mandatory_met': not mandatory_failed,
    }
