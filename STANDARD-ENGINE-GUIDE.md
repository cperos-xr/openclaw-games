# OpenClaw Standard Engine Guide

Last updated: 2026-04-02

## Core Rule

New games do not ship custom HTML shells or custom per-game engines anymore.

Author these inputs only:
- `game-script.json`
- `art/` assets

Then build the published wrapper with:

```bash
node games/build-standard-games.mjs
```

That generator writes the final `game.html` files using the shared engine:
- `games/standard-game-style.css`
- `games/standard-game-runtime.js`

If the data is broken, the generator must fail before it writes anything.

---

## Approved Layouts

There are exactly two approved shared layouts:

1. `standard`
   - Mobile: stacked, scrollable, art first
   - Desktop: side-by-side art + text
  - Legacy-friendly layout for Games 001-008 and deliberate exception cases
  - Use when a game specifically benefits from the older split desktop presentation

2. `vertical-carnival`
   - Single-column at every size
   - Full-width top art, scrollable text below, controls below the text
  - Uses the Game 005 frame: `640x400` scene art shown edge-to-edge in an `8:5` panel
  - Preferred layout for Game 009 onward and all future games unless a legacy exception is intentional

Live example:
- `games/005-the-last-showmans-carnival/game-script.json` uses `"layout": "vertical-carnival"`

### How to choose the layout

Set it in `game-script.json`:

```json
{
  "layout": "vertical-carnival"
}
```

or

```json
{
  "layout": "standard"
}
```

For new work, set the field explicitly.

- Preferred default: `vertical-carnival`
- Legacy/default exception: `standard`
- Games 001-008 may stay on `standard` when that older presentation is part of the game's identity

If omitted, the engine still falls back to `standard` for backward compatibility, but new and converted games should not rely on that omission.

### Template wrappers

For manual assembly only, the approved wrappers are:
- `games/GAME-TEMPLATE.html`
- `games/GAME-TEMPLATE-VERTICAL.html`

These wrappers are interchangeable because both load the same shared style and runtime. The preferred switch is still the `layout` field in `game-script.json`, not custom HTML surgery.

Use the phrase "vertical carnival" when referring to the preferred single-column template in reviews, briefs, and future game instructions.

---

## Runtime Contract

Every correct game built on the new engine must expose:
- `window.GAME_DATA`
- `window.GAME_ART`

The runtime supplies:
- LOOK / TAKE / USE / EXAMINE verbs
- EXAMINE-driven item/detail art previews when matching art assets exist
- target buttons
- inventory panel
- exits panel
- reset button
- hint toggle
- fresh-text glow for newly added lines
- puzzle success handling
- win-scene handoff when the final puzzle reveals a dedicated ending scene

Do not fork the runtime per game unless you are deliberately changing the platform itself.

---

## Required `game-script.json` Shape

Required top-level fields:
- `title`
- `slug`
- `number`
- `setting`
- `characters`
- `items`
- `scenes`
- `puzzles`
- `winCondition`

Optional engine fields:
- `layout`: `standard` or `vertical-carnival`
- `hintsEnabledByDefault`: boolean
- `hints`: object keyed by scene id

Hint format:

```json
{
  "hints": {
    "foyer": [
      { "text": "Check the ticket booth before you waste time on the stairs.", "delay": 10 },
      { "text": "The chain on the north doors is the real gate in this room.", "delay": 18 }
    ]
  }
}
```

If custom hints are omitted, the runtime generates fallback hints automatically.

---

## Authoring Rules

### Scenes

- Every exit destination must point to a real scene id.
- Do not leave `null`, empty, or dead placeholder exits in the data.
- A scene can be an ending tableau with no exits if the final puzzle reveals it.

### Items

- `foundIn` must name a real scene.
- `usedIn` should name the scene where the item matters.
- `usedOn` should preferably name a real target label from `lookDescriptions`, not a mystery placeholder.

### Puzzles

- `scene` must be a real scene.
- `requires` must list real item ids.
- `reveals` may contain real item ids and real scene ids only.
- Prefer `blocksExit` as an object:

```json
{
  "blocksExit": {
    "scene": "foyer",
    "direction": "north"
  },
  "blockedMessage": "The north doors are chained shut."
}
```

String blockers still work, but they are legacy shorthand and should not be used in new content.

### Endings

There are two valid ending patterns:

1. End in the current room.
   - Final puzzle result carries the win text.
   - `winCondition.scene` can be the current scene.

2. End in a dedicated final tableau.
   - Create a real final scene.
   - Set `winCondition.scene` to that scene id.
   - Reveal that scene from the final puzzle.
   - The runtime will hand off to that scene when the win triggers.

Do not use fake scene ids like `win` in new data.

---

## Validation Commands

Run these before publish:

```bash
node games/standard-game-validation.mjs --write-summary
node games/build-standard-games.mjs
```

What validation checks:
- scene reachability
- item acquisition chain
- puzzle dependency order
- `blocksExit` integrity
- win-condition reachability
- missing scene/item references

The generator must stay validation-gated.

---

## Design Checklist

- Use only the shared style and shared runtime.
- Pick `layout` in `game-script.json` instead of inventing custom page structure.
- Default new games to `vertical-carnival`; use `standard` only when a legacy-style exception is intentional.
- Make sure every blocked exit exists in the blocker scene.
- Make sure every required item is obtainable before its puzzle.
- Add explicit `hints` only when the game needs authored nudges; otherwise rely on fallback hints.
- If you want a final ending tableau, make it a real scene and reveal it from the last puzzle.
- Rebuild with `node games/build-standard-games.mjs` after editing data or art.

---

## What Not To Do

- Do not write a bespoke `game.html` shell from scratch.
- Do not paste a custom engine blob into individual games.
- Do not add dead exits that point to `null` or placeholder ids.
- Do not hide progression behind scenes or items that do not exist.
- Do not maintain separate CSS systems per game when the shared layout can already handle it.