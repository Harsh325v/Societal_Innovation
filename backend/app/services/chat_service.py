from ollama import chat

from app.services.sahyog_knowledge import build_system_prompt


conversation_histories = {}

MAX_MESSAGES = 12


def generate_reply(
    message: str,
    conversation_id: str,
    user_name: str = "User",
    user_role: str = "CITIZEN",
    user_context: dict | None = None,
) -> str:

    if user_context and user_context.get("authenticated"):
        user_id = user_context.get("user_id")
        conversation_key = f"user:{user_id}:{conversation_id}"
    else:
        conversation_key = f"anonymous:{conversation_id}"

    if conversation_key not in conversation_histories:
        conversation_histories[conversation_key] = []

    history = conversation_histories[conversation_key]

    history.append({
        "role": "user",
        "content": message,
    })

    if len(history) > MAX_MESSAGES:
        history = history[-MAX_MESSAGES:]
        conversation_histories[conversation_key] = history

    system_prompt = build_system_prompt(
        user_name=user_name,
        user_role=user_role,
        user_context=user_context or {},
    )

    # Keep chatbot responses simple and structured.
    system_prompt += """

IMPORTANT RESPONSE STYLE:
- Keep answers short and easy to understand.
- Use headings when explaining multiple things.
- Use numbered steps for processes.
- Use bullet points for lists.
- Avoid long paragraphs.
- For questions about Sahyog, explain things in simple English or Hinglish.
- If the user asks "what is Sahyog", use this structure:

**What is Sahyog?**
One short explanation.

**How it works**
1. Citizen reports a problem.
2. AI analyzes the problem.
3. Sahyog matches it with suitable HEIs and faculty.
4. Students and faculty work on the project.
5. Industry can provide support.
6. The solution can be tested and deployed.

**Impact**
Briefly explain how the platform tracks real-world impact.

Do not invent features that are not part of Sahyog.
"""

    response = chat(
        model="llama3.2:3b",
        messages=[
            {
                "role": "system",
                "content": system_prompt,
            },
            *history,
        ],
    )

    assistant_message = response["message"]["content"]

    history.append({
        "role": "assistant",
        "content": assistant_message,
    })

    if len(history) > MAX_MESSAGES:
        conversation_histories[conversation_key] = history[-MAX_MESSAGES:]

    return assistant_message