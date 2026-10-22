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
- Combination guidance must identify the sequence, the role of each technique, the transition between techniques, and the most relevant combination-specific mistakes.
- The fiches do not use separate `Critical guard cue` or `Key cues` sections. Guard and movement information belongs in the validated principles, focus points, explanations, or combination transitions.
- Each guided action returns exactly 3 existing entries copied from the fiche.
- `Technique tips` copies 3 principles, transitions, or documented execution entries.
- `Common mistakes` copies 3 validated mistakes without adding corrections that are not written in the fiche.
- `Focus points` copies 3 focus points or documented transition entries.
- `Explain` copies 3 sentences, roles, or documented combination entries.
- The coach must not reproduce the whole fiche, paraphrase, merge entries, invent an undocumented combination, or repeat the same generic sentence for every guided action.
- Example: for `JAB–CROSS`, the jab measures distance and creates a reaction; the transition drives the cross from the rear foot while the lead hand protects the chin; the cross returns quickly to guard.
