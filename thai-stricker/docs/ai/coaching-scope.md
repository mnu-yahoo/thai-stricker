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
- Technique sheets must distinguish isolated execution from combination use. When sources document a technique followed by another technique, record the sequence, the role of each technique, the transition cues, and the combination-specific mistakes.
- Combination guidance must remain source-grounded: do not infer an undocumented sequence, timing, target, or tactical purpose from the technique name alone.
- Fiches must not add separate `Critical guard cue` or `Key cues` sections; keep those details in the validated principles, focus points, explanations, or documented combination transitions.

## Local Coach

Current behavior:
- AI Coach uses validated local technique knowledge as the only source of responses
- Transformers.js loads the local browser model lazily when a guided action is requested
- WebGPU is preferred and WebAssembly CPU is used as a fallback
- The model acts as a constrained selector: it returns the index of one allowed fiche entry, not a free-form coaching sentence
- The application resolves the selected index to the exact text stored in the validated fiche
- Invalid model output, model errors, timeouts, or unavailable runtime automatically use the local fallback
- Tips are matched to the selected exercise and its techniques
- If no workout is planned, one random available exercise is selected

The technique fiches are the source of truth. Improving the coach therefore means
improving and validating the fiches, rather than relying on model creativity or
fine-tuning. The model is not trained at runtime and does not add new Muay Thai
knowledge.

For every guided action, the coach must select exactly one existing entry:

- `Technique tips`: one principle, transition, or documented execution entry
- `Common mistakes`: one validated mistake, including the documented technique prefix when needed
- `Focus points`: one validated focus point or documented transition entry
- `Explain`: one explanation sentence, role, or documented combination entry

The application must reject any response that is not a valid candidate index and
must never display arbitrary model-generated text.

Not implemented:
- External API or backend AI
- Open-ended chat input
