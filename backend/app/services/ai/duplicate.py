from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def find_duplicate(
    new_challenge: str,
    existing_challenges: list[str],
    threshold: float = 0.65,
) -> tuple[bool, float, int | None]:
    # nothing to compare against
    if not existing_challenges:
        return False, 0.0, None

    # turn all challenge descriptions into numbers
    vectorizer = TfidfVectorizer(
        lowercase=True,
        stop_words="english",
    )

    all_texts = existing_challenges + [new_challenge]
    vectors = vectorizer.fit_transform(all_texts)

    # compare the new challenge against all existing ones
    similarities = cosine_similarity(
        vectors[-1],
        vectors[:-1],
    )[0]

    # find the most similar existing challenge
    best_index = similarities.argmax()
    best_score = float(similarities[best_index])

    # decide whether it's a duplicate
    is_duplicate = best_score >= threshold

    if is_duplicate:
        return True, round(best_score, 4), best_index

    return False, round(best_score, 4), None