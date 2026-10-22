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
- AI Coach uses validated local technique knowledge as context for guided generation
- Transformers.js loads the local browser model lazily when a guided action is requested
- WebGPU is preferred and WebAssembly CPU is used as a fallback
- Existing local coaching tips remain available as an automatic fallback
- Tips are matched to the selected exercise and its techniques
- If no workout is planned, one random available exercise is selected

Not implemented:
- External API or backend AI
- Open-ended chat input
