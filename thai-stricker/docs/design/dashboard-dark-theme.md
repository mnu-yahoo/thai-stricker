# Dashboard Dark Theme

Status: Saved reference

Scope:
- Home dashboard dark theme only
- Current visual reference for the Thai Stricker dashboard
- Includes theme, layout direction, icon system, and font choices

## Purpose

This document preserves the current dark dashboard implementation so future changes can reuse the same look and avoid drifting away from the approved direction.

## Visual Direction

The dashboard uses:

- deep charcoal background
- cool cyan primary accents
- muted blue-gray secondary text
- glassy dark cards with subtle borders
- compact athletic typography
- high-contrast workout-first hierarchy

The overall mood should feel:

- modern
- technical
- focused
- premium
- Android-native

## Core Dark Colors

Source of truth:
- [src/styles/theme.ts](/C:/Users/mathieu.nussbaumer/Documents/ThaiStricker/thai-stricker/src/styles/theme.ts)

Current dark dashboard tokens:

- `appBackground`: `#131315`
- `surface`: `#131315`
- `surfaceMuted`: `#201F21`
- `card`: `#201F21`
- `cardElevated`: `#2A2A2C`
- `textPrimary`: `#E5E1E4`
- `textSecondary`: `#B9CACB`
- `textMuted`: `#849495`
- `border`: `#3B494B`
- `primary`: `#00F0FF`
- `primaryPressed`: `#00DBE9`
- `primaryText`: `#002022`
- `accent`: `#7DF4FF`
- `navbarBackground`: `#131315`
- `navbarActive`: `#00F0FF`
- `navbarInactive`: `#849495`

Dashboard-specific calendar selected-day styling in Home:

- selected fill: `#12333A`
- selected border: `#0EA5B7`
- selected dot: `#1DE7FF`

## Typography

Source of truth:
- [src/styles/theme.ts](/C:/Users/mathieu.nussbaumer/Documents/ThaiStricker/thai-stricker/src/styles/theme.ts)

Current shared typography tokens:

- `fontFamilyRegular`: `Archivo Narrow`
- `fontFamilyMedium`: `Archivo Narrow`
- `fontFamilyBold`: `Archivo Narrow`
- `titleSize`: `32`
- `subtitleSize`: `24`
- `bodySize`: `16`
- `captionSize`: `12`
- `buttonSize`: `12`

Dashboard usage notes:

- section labels are uppercase and compact
- main dashboard title is bold and large
- workout hero title is uppercase and italic
- AI Coach quote is large and italic
- metric labels are small and uppercase

## Icon System

Current icon implementation:

- general UI fallback icons use `@expo/vector-icons`
- saved dark dashboard icons use Google Material Symbols via font ligatures

Source files:

- [src/components/icons/GoogleMaterialSymbol.tsx](/C:/Users/mathieu.nussbaumer/Documents/ThaiStricker/thai-stricker/src/components/icons/GoogleMaterialSymbol.tsx)
- [App.tsx](/C:/Users/mathieu.nussbaumer/Documents/ThaiStricker/thai-stricker/App.tsx)

Packages currently used:

- `@expo-google-fonts/material-symbols`
- `expo-font`
- `@expo/vector-icons`

Loaded Google Material Symbols font:

- `MaterialSymbols_400Regular`

## Saved Dashboard Icons

Current Home dashboard symbol names:

- top-left user badge: `account_circle`
- top-right notification: `notifications`
- hero play button: `play_arrow`
- sessions card: `app_badging`
- hours card: `schedule`
- calendar previous: `chevron_left`
- calendar next: `chevron_right`
- AI Coach heading bolt: `bolt`
- AI Coach background mark: `psychology`

## Layout Reference

Source of truth:
- [src/features/home/HomeScreen.tsx](/C:/Users/mathieu.nussbaumer/Documents/ThaiStricker/thai-stricker/src/features/home/HomeScreen.tsx)

Current dark dashboard structure:

1. Top bar
2. Dashboard title block
3. Today workout hero card
4. Monthly activity card
5. Sessions / Hours mini-card row
6. Weekly calendar card
7. AI Coach tip card

## Home Dark Dashboard Details

### Top Bar

Displays:

- user badge with Material Symbol
- `TRAINING HUB`
- notification icon

### Hero Workout Card

Displays:

- `Today's Workout`
- `View routine`
- workout difficulty badge
- duration
- workout title
- focus text
- play button

### Monthly Activity

Displays:

- monthly calories highlight
- trend icon
- animated-style vertical bar chart look

### Sessions / Hours Cards

Displays:

- one Google Material Symbol each
- uppercase label
- large numeric value

### Calendar

Displays:

- month and year
- previous / next buttons
- current selected week only
- Monday through Sunday row
- cyan-highlighted selected workout days

### AI Coach Card

Displays:

- uppercase cyan heading
- bolt symbol
- large italic quote
- supporting explanation
- large faded psychology symbol in the background

## Spacing And Shape

Current shared spacing tokens:

- `xs`: `4`
- `sm`: `8`
- `md`: `16`
- `lg`: `24`
- `xl`: `32`

Current shared radius tokens:

- `sm`: `4`
- `md`: `6`
- `lg`: `8`
- `pill`: `999`

Dashboard card usage:

- large rounded cards for major sections
- smaller rounded cards for stat tiles
- pill buttons and badges for compact emphasis

## Persistence Note

This document saves the current design direction only.

It does not imply:

- persisted theme settings
- server-backed theming
- design token export tooling
- image asset locking

## Change Rule

When updating the dark dashboard:

- keep this document aligned with the implemented Home screen
- update icon names if symbol choices change
- update color values if tokens or local overrides change
- treat this file as the current saved visual baseline
