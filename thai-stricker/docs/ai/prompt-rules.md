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

The model is a constrained selector, not the source of Muay Thai knowledge. The
prompt supplies the validated fiche entries as numbered candidates. The model
must return only the index of one candidate. The application then displays the
exact candidate text from the fiche. It must reject non-numeric, out-of-range,
or otherwise invalid model output and use the local fallback instead.

Prompting alone is not considered a safety or correctness guarantee. The
post-generation candidate validation is mandatory. Do not display free-form
model text, even when it is non-empty or sounds plausible.

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
- Each AI Coach guided action returns exactly 1 existing entry copied from the fiche.
- The model returns the index of exactly 1 allowed entry; the application displays the corresponding fiche text verbatim.
- `Technique tips` copies 1 principle, transition, or documented execution entry.
- `Common mistakes` copies 1 validated mistake without adding a correction that is not written in the fiche.
- `Focus points` copies 1 focus point or documented transition entry.
- `Explain` copies 1 sentence, role, or documented combination entry.
- The coach must not reproduce the whole fiche, paraphrase, merge entries, invent an undocumented combination, or repeat the same generic sentence for every guided action.
- Every candidate must be understandable as a standalone English coaching sentence.
- The fiches must contain enough distinct, source-validated entries to support useful answers; do not compensate for missing knowledge by asking the model to invent details.
- Do not fine-tune or retrain the local model for the current version. Enrich and validate the local fiches first.
- During workout execution, use compact local coaching instead of generative AI: display exactly one validated entry for `Technique tips`, one for `Common mistakes`, and one for `Focus points`. Do not display a separate generated `AI Coach` response in the workout session.
- Example: for `JAB–CROSS`, the jab measures distance and creates a reaction; the transition drives the cross from the rear foot while the lead hand protects the chin; the cross returns quickly to guard.
