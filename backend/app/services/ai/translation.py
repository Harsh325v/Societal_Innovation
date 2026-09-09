from ollama import chat


MODEL = "llama3.2:3b"


def translate_text(
    text: str,
    source_language: str,
    target_language: str,
) -> str:
    """
    Translate citizen-provided text using
    the local Ollama model.

    If translation fails, return the original
    text instead of breaking challenge submission.
    """

    if not text.strip():
        return text

    if source_language == target_language:
        return text.strip()

    if source_language == "hi":
        source_name = "Hindi"
    else:
        source_name = "English"

    if target_language == "hi":
        target_name = "Hindi"
    else:
        target_name = "English"

    prompt = f"""
Translate the following text from {source_name}
to {target_name}.

Rules:
- Preserve the original meaning.
- Do not add information.
- Keep the translation natural and easy to understand.
- Return ONLY the translated text.
- Do not add quotes.
- Do not explain the translation.

Text:
{text}
"""

    try:
        response = chat(
            model=MODEL,
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
        )

        translated = (
            response["message"]["content"]
            .strip()
        )

        return translated or text.strip()

    except Exception:
        # Multilingual support should never
        # prevent a citizen from reporting
        # a real problem.
        return text.strip()