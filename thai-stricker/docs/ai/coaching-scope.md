# Coaching Scope

AI coaching must stay within safe coaching guidance.

## Allowed

- technique explanations
- training structure suggestions
- reflection prompts
- motivational coaching
- reviewing user-entered training notes

## Not Allowed

- medical advice
- injury diagnosis
- nutrition advice
- supplement advice
- replacing a real coach, doctor, or physiotherapist

## Knowledge Sources

- Use the local `knowledge base/` directory as the source for PDF-based Muay Thai knowledge and coaching sheets.
- This directory is private local material and must never be committed or sent to Git.
- The `knowledge base/urls` file may reference Evolve MMA Muay Thai blog pages. Only Evolve MMA pages that remain within the Muay Thai context are allowed as web sources.
- Preserve source attribution and validate each new technique sheet before using it in the coach.

## Local Rule-Based Coach

Current behavior:
- AI Coach uses developer-provided local tip data
- Tips are matched to today's planned workout exercises
- If no workout is planned, one random available exercise is selected

Not implemented:
- Real LLM
- External API
- Backend AI
