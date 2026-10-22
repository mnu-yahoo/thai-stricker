# AI Coach Screen

Status: Approved

## Purpose

The AI Coach screen gives the user local, guided technique guidance. It uses the browser-local `onnx-community/LFM2.5-350M-ONNX` model through Transformers.js when available, with the existing local coach tips as an automatic fallback.

The AI runtime is loaded only when the user requests a guided response. The model is cached by the browser after its first download. WebGPU is preferred and WebAssembly CPU is used as a fallback.

## User Goals

- Open AI Coach from Home or the navbar
- See coaching context for today
- Review technique tips for today's planned workout exercises
- Fall back to one random available exercise when no workout is planned
- Use guided prompt buttons to get focused responses

## Entry Points

- Home AI Coach card
- Bottom navbar AI Coach tab

## Context Resolution Behavior

- The screen checks today's local date
- It looks for a planned workout day where `plannedDay.dayDate === todayDate`
- If found, it resolves the planned workout from mocked workouts
- If not found, it selects one random available exercise

## Planned Workout Behavior

- Shows the planned workout title for today
- Displays one selectable exercise card per workout exercise
- Defaults the guided chat to the first exercise in the workout

## Random Exercise Fallback Behavior

- If no workout is planned today, one random available exercise is selected
- The fallback remains local and session-only
- No selection history is persisted

## Guided Chat Behavior

- Guided prompt buttons only
- Technique tips returns `technicalTips`
- Common mistakes returns `commonMistakes`
- Focus points returns `focusPoints`
- Explain exercise returns `explanation`
- No open-ended text input is implemented

## Context and fallback data

- Context is restricted to the selected exercise, its description and Tip, its techniques, and the matching workout when available
- Existing imported coach tips remain the local fallback source
- Exercise matching prefers id and falls back to exercise title
- The first validated local knowledge entry is currently `JAB`; AI generation remains disabled for techniques without a validated entry

## Loading and failure behavior

- The first guided action displays a loading state while the model is downloaded or initialized
- Network, model, WebGPU/WebAssembly, timeout, empty, and overlong-response failures use local coaching advice
- No model is loaded on other screens

## Safety Guardrails

- Technique-focused only
- No medical advice
- No injury diagnosis
- No nutrition advice
- No supplement advice
- No wearable-based guidance
- Includes a general boundary reminding users to ask a qualified professional for pain, injury, or health concerns

## Out Of Scope

- API calls
- Backend AI
- Database persistence
- Open-ended chat input
- Voice input
- Speech output

## Implementation rules

- Keep the first version guided and contextualized; no open-ended prompt is exposed
- Do not add persistence or server credentials
- Do not add medical, injury, nutrition, or supplement advice
