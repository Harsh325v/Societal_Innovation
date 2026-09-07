def calculate_priority(
    severity: int,
    urgency: int,
    people_affected: int,
    geographic_impact: int,
) -> float:
    # each factor is rated from 1 to 5
    # bigger impact = bigger priority

    score = (
        severity * 0.35
        + urgency * 0.25
        + people_affected * 0.25
        + geographic_impact * 0.15
    )

    # convert the 1-5 score into a 0-100 score
    return round((score / 5) * 100, 2)