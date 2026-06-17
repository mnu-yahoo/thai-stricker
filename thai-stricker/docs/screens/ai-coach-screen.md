# AI Coach Screen

Status: Approved

## Purpose

The AI Coach screen gives the user local technique guidance based on mocked developer-provided coach-tip data.

AI Coach is local and rule-based.

It does not use:
- LLM
- API
- Backend
- Database
- Persistence

AI Coach responses come from developer-provided mocked coach tip data.

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

## Local Mocked Data Source

- Coach tips are defined in `src/features/aiCoach/coachTipsMocks.ts`
- Context uses mocked weekly workout plans, mocked workouts, and mocked available exercises
- Exercise matching prefers id and falls back to exercise title

## Safety Guardrails

- Technique-focused only
- No medical advice
- No injury diagnosis
- No nutrition advice
- No supplement advice
- No wearable-based guidance
- Includes a general boundary reminding users to ask a qualified professional for pain, injury, or health concerns

## Out Of Scope

- Real LLM
- API calls
- Backend AI
- Database persistence
- Open-ended chat input
- Voice input
- Speech output

## Codex Rules

- Keep AI Coach local and deterministic
- Use developer-provided mocked coach data only
- Do not add persistence or external dependencies
- Do not add medical or nutrition advice
