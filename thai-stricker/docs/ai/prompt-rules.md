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

## Isolated and Combination Technique Guidance

- A technique may be performed alone or followed by another technique in the same exercise.
- When one or more validated techniques are present in an exercise, the coach must use the isolated technique guidance and the documented combination guidance when available.
- Combination guidance must identify the sequence, the role of each technique, the transition between techniques, the guard cues, and the most relevant combination-specific mistakes.
- `Technique tips` selects 2 or 3 execution or transition cues.
- `Common mistakes` selects 2 or 3 validated mistakes and states the correction when the fiche provides one.
- `Focus points` selects 2 or 3 elements to monitor during the execution or transition.
- `Explain` selects 2 or 3 points about the technique's role, tactical objective, and relevant follow-up or variation.
- The coach must not reproduce the whole fiche, invent an undocumented combination, or repeat the same generic sentence for every guided action.
- Example: for `JAB–CROSS`, the jab measures distance and creates a reaction; the transition drives the cross from the rear foot while the lead hand protects the chin; the cross returns quickly to guard.
