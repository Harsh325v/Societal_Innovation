# calculate the final HEI matching score
def calculate_hei_match(
    domain_score: float,
    expertise_score: float,
    faculty_score: float,
    infrastructure_score: float,
    location_score: float,
) -> float:
    # our matching weights
    score = (
        domain_score * 0.40
        + expertise_score * 0.25
        + faculty_score * 0.15
        + infrastructure_score * 0.10
        + location_score * 0.10
    )

    # keep the final score between 0 and 100
    return round(score, 2)