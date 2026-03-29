# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Mozart's Musical Adventure" — a zero-install 8-bit browser platformer. Open `index.html` directly in any browser. No build step, no dependencies, no CDN.

## Checking for syntax errors

```bash
node --check game.js
node --check audio.js
node --check i18n.js
```

Run these after every edit. No test suite exists; browser testing is the only runtime validation.

## File load order (critical)

`index.html` loads scripts in this order — it must stay this way:
```
i18n.js  →  audio.js  →  game.js
```
`game.js` depends on `window.I18N` (from i18n.js) and `window.AudioEngine` (from audio.js).

## Architecture

### game.js (~2100 lines) — everything is one IIFE

Sections are separated by `═══` dividers:

- **CONSTANTS** — canvas size (768×432), physics values (GRAVITY, SPD, JUMP), sprite scale
- **SPRITE PIXEL DATA** — 8×12 pixel art defined as string arrays with color keys; rendered via `drawSprite()`
- **LEVEL DATA** (`LEVELS` array) — platforms, enemies, notes, player start, exit per level. Platform factory: `makePlatform(x, y, w, h, color, moving?, speed?, minX?, maxX?)`. Moving platforms require the last 4 args.
- **GAME STATE** — all mutable state as `let` variables (no class instances)
- **PHYSICS / UPDATE** — `update()` runs every frame; `resolveCollisions()` handles AABB separately for X and Y axes
- **RENDERING** — `render()` draws everything; camera offset stored in `camX`
- **QUIZ SYSTEM** — triggered after Level 1; questions seeded from Mozart facts shown during gameplay (`collectedFacts[]`)
- **PIANO CHALLENGE** — triggered after Level 2; state machine: `DEMO → INPUT → SUCCESS`; letter keys C D E F G A B map to notes C4–B4 (C5 is click-only); demo sequence is Eine Kleine opening: G G D G E D
- **INPUT** — `handleKeyDown()` dispatches by `gameState`
  - Movement: Arrow keys / WASD; jump: Space / Up / W
  - Global: `ESC` = pause, `M` = toggle mute, `L` = toggle language
  - Quiz: `A`/`B`/`C`/`D` select answers
  - Piano: `C`/`D`/`E`/`F`/`G`/`A`/`B` play notes C4–B4; C5 is mouse-click only
- **TOUCH CONTROLS** — on-screen ◀ ▶ ▲ buttons in `#touch-controls` div; shown automatically via `@media (pointer: coarse)`

**Game states:** `MENU`, `PLAYING`, `PAUSED`, `GAMEOVER`, `WIN`, `QUIZ`, `PIANO_CHALLENGE`

### audio.js — module pattern, exposed as `window.AudioEngine`

- `FREQ` table maps note names (e.g. `'Gs4'`, `'Bb5'`) to Hz
- Song notes format: `['NOTE', durationInBeats]`; `'R'` = rest
- `AudioContext` is created on first user gesture (browser autoplay policy)
- Key methods: `AudioEngine.playSong(songName)`, `AudioEngine.playSfx(name)`, `AudioEngine.playPianoNote(noteKey, duration)`, `AudioEngine.stopMusic()`, `AudioEngine.toggleMute()`
- Songs: `eine_kleine` (menu), `turkish_march` (Level 1), `symphony_40` (Level 2), `magic_flute` (Level 3/boss)

### i18n.js — exposed as `window.I18N`

- Two locale objects (`en`, `de`) keyed by translation string ID
- `I18N.t(key)` returns current locale string; `I18N.toggle()` or `L` key switches EN↔DE
- All UI text, quiz questions, and Mozart facts are translated

## Level structure

3 levels defined in the `LEVELS` array in game.js:
1. **Concert Hall** (3840px wide) — Turkish March, 3 sections
2. **Opera House** (4608px wide) — Symphony No. 40, 3 sections
3. **Boss Arena** (768px, no scroll) — Magic Flute, Salieri boss fight (3 HP, 3 phases)

Between levels: Quiz (after L1) → Piano Challenge (after L2) → Boss (L3).

## Physics notes

- Max horizontal jump distance ≈ 161px at full run speed — keep platform gaps ≤ 140px
- `CH` = 432 (canvas height); platform Y positions use `CH - N` (e.g. `CH-96` = 336px from top)
- Sprites are rendered at 3× scale: logical 8×12px → 24×36px on screen
