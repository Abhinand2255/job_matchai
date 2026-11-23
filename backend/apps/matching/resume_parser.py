import pymupdf  # Modern PyMuPDF API
import re
import logging

logger = logging.getLogger(__name__)


def extract_text_from_pdf(pdf_source):
    """
    Extracts plain text from a PDF file using PyMuPDF.
    Accepts a file path string or Django's InMemoryUploadedFile / TemporaryUploadedFile (bytes/stream).
    """
    text_content = []
    try:
        if hasattr(pdf_source, 'read'):
            # It's an in-memory or file-like stream
            stream = pdf_source.read()
            if hasattr(pdf_source, 'seek'):
                pdf_source.seek(0)
            doc = pymupdf.open(stream=stream, filetype="pdf")
        else:
            # File system path
            doc = pymupdf.open(pdf_source)

        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text("text")
            if text:
                text_content.append(text)

        doc.close()
        full_text = "\n".join(text_content)
        normalized_text = re.sub(r'[ \t]+', ' ', full_text)
        return normalized_text.strip()
    except Exception as e:
        logger.error(f"Error extracting text with PyMuPDF: {e}")
        return ""


def extract_skills_from_text(text, available_skills):
    """
    Finds skills mentioned in the resume text by matching skill names and aliases.
    available_skills: list of dicts or Skill model instances with 'name' and 'aliases'.
    Returns list of matched skill dicts: [{'id': ..., 'name': ..., 'category': ...}]
    """
    if not text:
        return []

    lowered_text = f" {text.lower()} "
    # Normalize punctuation commonly surrounding technical terms
    cleaned_text = re.sub(r'[,/\\|;:()\r\n]', ' ', lowered_text)

    matched_skills = []
    seen_ids = set()

    for skill in available_skills:
        if isinstance(skill, dict):
            skill_id = skill.get('id')
            name = skill.get('name')
            category = skill.get('category', 'OTHER')
            aliases_str = skill.get('aliases') or ''
        else:
            skill_id = getattr(skill, 'id', None)
            name = getattr(skill, 'name', '')
            category = getattr(skill, 'category', 'OTHER')
            aliases_str = getattr(skill, 'aliases', '') or ''

        if not name or skill_id in seen_ids:
            continue

        # Build list of search patterns for this skill
        patterns = [name.strip().lower()]
        if aliases_str:
            aliases = [a.strip().lower() for a in aliases_str.split(',') if a.strip()]
            patterns.extend(aliases)

        is_matched = False
        for p in patterns:
            # Handle special symbols like C++, C#, .NET
            escaped = re.escape(p)
            # Use word boundaries or space boundaries for symbols
            if re.match(r'^\w+$', p):
                regex = rf'\b{escaped}\b'
            else:
                regex = rf'(?:^|\s){escaped}(?:\s|$|[.,])'

            if re.search(regex, cleaned_text, re.IGNORECASE):
                is_matched = True
                break

        if is_matched:
            seen_ids.add(skill_id)
            matched_skills.append({
                'id': skill_id,
                'name': name,
                'category': category,
            })

    return matched_skills
