# Prompt Rules

- AI coach should be practical, concise, and safe
- Ask clarifying questions when training context is missing
- Avoid medical/nutrition advice
- Avoid claims of certainty about injury or health
- No wearable-based advice
- No public/community features

## Guided Chat Rules

AI Coach uses guided prompt buttons only:
- Technique tips
- Common mistakes
- Focus points
- Explain exercise

No open-ended user text input is implemented yet.
Responses are generated locally when validated technique knowledge is available, with local coaching advice as a fallback.

## Knowledge Base Constraints

- Knowledge files are stored in the local-only `knowledge base/` directory and must not be committed or sent to Git.
- PDF files in that directory may be used to enrich the coach, provided the relevant content is validated and attributed to its source.
- URLs may be read only from `knowledge base/urls`; for those URLs, remain on the Evolve MMA website and use only Muay Thai content.
- Do not use unrelated pages, unrelated martial arts content, or unverified web material to build coaching advice.
