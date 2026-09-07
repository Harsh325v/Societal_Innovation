from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression


# give the model examples that clearly separate similar categories
training_texts = [
    # Agriculture
    "farmers need better irrigation systems for their crops",
    "crop production is affected by poor farming equipment",
    "farmers need modern agricultural technology and machinery",
    "soil quality is affecting agricultural productivity",
    "lack of irrigation water is reducing crop yields",

    # Healthcare
    "villagers do not have access to proper healthcare facilities",
    "rural areas need more hospitals and medical centres",
    "people are unable to get timely medical treatment",
    "lack of doctors and medicines is affecting patients",
    "healthcare services are unavailable in remote villages",

    # Education
    "students need better schools and educational facilities",
    "rural schools lack classrooms and teaching resources",
    "students do not have access to quality education",
    "schools need better teachers and learning equipment",
    "children are dropping out because of poor education facilities",

    # Water Management
    "villages do not have access to clean drinking water",
    "people are facing a shortage of drinking water",
    "groundwater levels are falling in rural areas",
    "water supply systems are unreliable",
    "villages need better water distribution infrastructure",

    # Environment
    "deforestation is damaging the local environment",
    "river pollution is harming the ecosystem",
    "plastic waste is causing environmental problems",
    "air pollution is affecting the environment",
    "forest areas are being damaged by illegal activities",

    # Energy
    "villages have unreliable electricity supply",
    "rural areas need solar power systems",
    "frequent power cuts are affecting households",
    "communities need access to renewable energy",
    "lack of electricity is affecting rural development",

    # Accessibility
    "people with disabilities cannot access public buildings",
    "public transport is difficult to use for disabled people",
    "buildings need ramps for wheelchair users",
    "government services are not accessible to disabled citizens",
    "people with disabilities face mobility problems",

    # Urban Development
    "cities need better roads and public infrastructure",
    "traffic congestion is affecting urban areas",
    "roads and drainage systems need improvement",
    "urban areas lack proper public infrastructure",
    "poor city planning is causing transportation problems",

    # Sanitation
    "villages lack proper toilets and sanitation facilities",
    "open defecation is a major problem in rural areas",
    "poor waste disposal is causing sanitation problems",
    "communities need better sewage systems",
    "garbage collection services are inadequate",

    # Rural Livelihoods
    "rural workers need better employment opportunities",
    "villagers need skills training for employment",
    "farm families need additional sources of income",
    "rural communities need better livelihood opportunities",
    "people in villages struggle to find sustainable jobs",

    # Public Administration
    "government services are slow and difficult to access",
    "citizens face delays in government administrative services",
    "people have difficulty applying for government schemes",
    "government offices need better service delivery",
    "citizens cannot easily access public services",
]


training_labels = [
    "Agriculture", "Agriculture", "Agriculture", "Agriculture", "Agriculture",
    "Healthcare", "Healthcare", "Healthcare", "Healthcare", "Healthcare",
    "Education", "Education", "Education", "Education", "Education",
    "Water Management", "Water Management", "Water Management",
    "Water Management", "Water Management",
    "Environment", "Environment", "Environment", "Environment", "Environment",
    "Energy", "Energy", "Energy", "Energy", "Energy",
    "Accessibility", "Accessibility", "Accessibility", "Accessibility",
    "Accessibility",
    "Urban Development", "Urban Development", "Urban Development",
    "Urban Development", "Urban Development",
    "Sanitation", "Sanitation", "Sanitation", "Sanitation", "Sanitation",
    "Rural Livelihoods", "Rural Livelihoods", "Rural Livelihoods",
    "Rural Livelihoods", "Rural Livelihoods",
    "Public Administration", "Public Administration", "Public Administration",
    "Public Administration", "Public Administration",
]


# turn text into numbers the model can understand
vectorizer = TfidfVectorizer(
    lowercase=True,
    stop_words="english",
    ngram_range=(1, 2),
)

X = vectorizer.fit_transform(training_texts)


# train the classifier
model = LogisticRegression(
    max_iter=1000,
)

model.fit(X, training_labels)


# strong words that clearly point towards a category
category_keywords = {
    "Agriculture": {
        "farmer", "farmers", "crop", "crops", "farming",
        "agriculture", "agricultural", "harvest", "soil",
        "cultivation", "irrigation",
    },
    "Healthcare": {
        "hospital", "doctor", "doctors", "medicine", "medical",
        "healthcare", "health", "patient", "patients", "clinic",
    },
    "Education": {
        "school", "schools", "student", "students", "teacher",
        "teachers", "education", "classroom", "learning",
    },
    "Water Management": {
        "drinking water", "water supply", "groundwater",
        "water shortage", "water distribution", "water source",
        "clean water",
    },
    "Environment": {
        "pollution", "deforestation", "forest", "ecosystem",
        "environment", "plastic waste", "air pollution",
    },
    "Energy": {
        "electricity", "power", "solar", "energy", "renewable",
        "power cuts", "electricity supply",
    },
    "Accessibility": {
        "disability", "disabled", "wheelchair", "accessibility",
        "accessible", "ramps", "mobility",
    },
    "Urban Development": {
        "city", "cities", "urban", "traffic", "roads",
        "infrastructure", "drainage", "city planning",
    },
    "Sanitation": {
        "toilet", "toilets", "sanitation", "sewage",
        "sewer", "defecation", "garbage collection",
    },
    "Rural Livelihoods": {
        "employment", "jobs", "livelihood", "income",
        "workers", "skill training", "employment opportunities",
    },
    "Public Administration": {
        "government services", "government office", "citizen services",
        "administration", "government scheme", "public services",
    },
}


def classify_challenge(text: str) -> tuple[str, float]:
    # convert everything to lowercase so matching is easier
    text_lower = text.lower()

    # get the ML model's prediction and confidence
    text_vector = vectorizer.transform([text])
    probabilities = model.predict_proba(text_vector)[0]

    prediction = str(model.classes_[probabilities.argmax()])
    ml_confidence = float(probabilities.max())

    # count strong category signals found in the challenge
    keyword_scores = {}

    for category, keywords in category_keywords.items():
        score = 0

        for keyword in keywords:
            if keyword in text_lower:
                score += 1

        keyword_scores[category] = score

    # find the category with the strongest keyword signal
    best_category = max(
        keyword_scores,
        key=keyword_scores.get,
    )

    best_keyword_score = keyword_scores[best_category]

    # if we have a clear domain signal, trust it over a weak ML prediction
    if best_keyword_score > 0:
        prediction = best_category

        # give a reasonable confidence based on the strength of the signal
        confidence = min(
            0.95,
            0.70 + (best_keyword_score * 0.05),
        )

        return prediction, round(confidence, 4)

    # otherwise fall back to the ML model
    return prediction, round(ml_confidence, 4)