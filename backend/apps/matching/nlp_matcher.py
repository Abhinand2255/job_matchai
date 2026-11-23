from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import logging

logger = logging.getLogger(__name__)


def compute_text_similarity(candidate_text, job_text):
    """
    Computes semantic cosine similarity between candidate profile/resume text
    and job post description using Scikit-Learn TF-IDF vectorization.
    Returns float score between 0.0 and 100.0
    """
    if not candidate_text or not job_text:
        return 0.0

    try:
        documents = [candidate_text, job_text]
        vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),  # unigrams and bigrams
            max_features=2500
        )
        tfidf_matrix = vectorizer.fit_transform(documents)
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        # Scale to 0-100 percentage
        return float(round(similarity * 100.0, 2))
    except Exception as e:
        logger.error(f"Error computing TF-IDF cosine similarity: {e}")
        return 0.0
