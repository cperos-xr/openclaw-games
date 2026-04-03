# OpenClaw Game Layout Guide — v3.0

> **TL;DR:** Use `GAME-TEMPLATE.html`. If you must write CSS from scratch, read every rule below. The same five mistakes broke games 003–010. Don't repeat them.

---

## What Went Wrong — Root Causes

Games 003–010 progressively broke on mobile because each one deviated from the working template and re-introduced the same bugs:

| Bug | Symptom on mobile | Affected games |
|-----|------------------|----------------|
| `height:100vh + overflow:hidden` on `body` at base level | Content below viewport is permanently hidden. Inventory, exits, buttons never reachable. | 003–010 |
| `min-height: 400px` on `.art-panel` | Art panel alone is taller than a phone screen. Nothing else is visible. | 004–010 |
| Side-by-side flex (`display:flex` on `.game-container`) with no mobile stacking | Two `flex:1` panels on a 390px screen = each is ~175px wide. Art is unreadable, text is crushed. | 003–010 |
| No `@media (max-width: 768px)` at all | Every single phone gets the broken desktop layout. | 003–010 |
| No `flex-wrap: wrap` on button bars | Buttons overflow off the right edge of the screen on any phone narrower than ~500px. | 002–010 |
| Pixel font (`Press Start 2P`) with `line-height: 1.8` | Text is enormous. One sentence fills the display. | 002, 007 |
| `overflow: hidden` on `html` and `body` | Browser scroll is completely disabled. User cannot reach any overflowed content. | 003, 007 |

---

## The Single Rule That Prevents All of the Above

> **Mobile-first. Desktop is an enhancement.**

Write your base CSS for a 390px wide phone. Use `@media (min-width: 769px)` to layer on the desktop side-by-side layout. Never the reverse.

---

## The Five Non-Negotiable Rules

### 1. Never `height:100vh + overflow:hidden` at base level

```css
/* ❌ WRONG — kills mobile, content disappears below the fold */
body { height: 100vh; overflow: hidden; }

/* ✅ CORRECT — base is scrollable, desktop enhances */
body { overflow-x: hidden; }                   /* base */
@media (min-width: 769px) {
  body { height: 100vh; overflow: hidden; }    /* desktop only */
}
```

### 2. Never `min-height` on the art panel

```css
/* ❌ WRONG — 400px is taller than most phone viewports. Nothing else shows. */
.art-panel { min-height: 400px; }

/* ✅ CORRECT — aspect ratio keeps art proportional, max-height keeps it bounded */
.art-panel { width: 100%; aspect-ratio: 8 / 5; max-height: 56vw; }
/* On a 375px phone: 56vw = ~210px. Art is clear. Leaves room for everything else. */
```

### 3. Stack vertically on mobile, side-by-side on desktop

```css
/* ❌ WRONG — side-by-side at all sizes */
.game-container { display: flex; gap: 20px; }

/* ✅ CORRECT — stack first, side-by-side only on desktop */
/* (no flex rule at base level — block layout stacks naturally) */
@media (min-width: 769px) {
  .game-container { display: flex; gap: 12px; min-height: 0; }
  .art-panel  { flex: 3; aspect-ratio: unset; max-height: none; }
  .text-panel { flex: 2; display: flex; flex-direction: column; overflow: hidden; }
  #text-display { flex: 1; max-height: none; }
}
```

### 4. Every button must have `min-height: 44px`

```css
/* ❌ WRONG — 5px padding = ~25px tall. Impossible to tap on a phone. */
.cmd-btn { padding: 5px 10px; }

/* ✅ CORRECT — 44px is Apple/Google's minimum accessible touch target */
.cmd-btn { padding: 10px 14px; min-height: 44px; min-width: 44px; }
```

### 5. Every button bar must have `flex-wrap: wrap`

```css
/* ❌ WRONG — LOOK TAKE USE EXAMINE HINTS all on one row = overflows at 390px */
.command-bar { display: flex; gap: 10px; }

/* ✅ CORRECT — buttons wrap to next line when they don't fit */
.command-bar { display: flex; flex-wrap: wrap; gap: 6px; }
```

---

## Reference CSS Template (copy this, do not rewrite)

The canonical reference is `/workspace/games/GAME-TEMPLATE.html`. It implements all five rules. **Kit (Game Assembler) must always start from that file.**

The key structure at a glance:

```css
/* BASE: mobile-first, scrollable */
body { overflow-x: hidden; padding: 8px; max-width: 1200px; margin: 0 auto; }

/* Art: proportional, never taller than 56% of viewport width */
.art-panel { width: 100%; aspect-ratio: 8/5; max-height: 56vw; overflow: hidden; }

/* Art SVG/img fills panel */
#art-display svg, #art-display img { max-width: 100%; max-height: 100%; object-fit: contain; }

/* Text: scrollable window, capped height so controls remain visible */
#text-display { overflow-y: auto; max-height: 40vh; }

/* Buttons: always wrap, always 44px tap targets */
.command-bar, #exits-bar { display: flex; flex-wrap: wrap; gap: 6px; }
.cmd-btn, .exit-btn { min-height: 44px; min-width: 44px; }

/* DESKTOP ONLY: side-by-side, fixed viewport */
@media (min-width: 769px) {
  body { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
  .game-container { display: flex; flex: 1; gap: 12px; min-height: 0; }
  .art-panel  { flex: 3; aspect-ratio: unset; max-height: none; }
  .text-panel { flex: 2; display: flex; flex-direction: column; overflow: hidden; }
  #text-display { flex: 1; max-height: none; }
  .cmd-btn, .exit-btn { min-height: 36px; } /* desktop can be smaller */
}
```

---

## What `min-height: 0` Does and Why It's Critical on Desktop

When using flexbox with `flex: 1` on a child, that child will not shrink below its content size by default. This causes overflow on the desktop layout.

```css
.game-container { display: flex; flex: 1; min-height: 0; } /* CRITICAL */
```

Without `min-height: 0`, the art or text panel can grow beyond the 100vh boundary and cause scroll even on desktop. Add it to any flex container that should shrink.

---

## Pattern to Avoid: CSS Grid for Game Layout

Game #003 used `grid-template-columns: 1fr 320px`. This is fragile:
- Fixed `320px` column is wider than many phones
- Grid area assignments (`grid-column: 2; grid-row: 3`) must be manually overridden in every media query
- Flex is simpler and more resilient for this use case

**Use flex, not grid, for the game layout.**

---

## Self-Test Checklist Before Submitting a Game

Before sending `game.html` to QA, verify each item:

- [ ] Open in browser, resize to 390px wide. Does the page scroll? (It should.)
- [ ] Is the art visible at ~200px tall at 390px width? (Not a huge black box, not missing.)
- [ ] Are all buttons (LOOK, TAKE, USE, EXAMINE, exits) visible without horizontal scrolling?
- [ ] Can you tap every button at 390px? (Each should be ≥44px tall.)
- [ ] At desktop (1024px+), does everything fit in one screen without vertical scrollbars?
- [ ] Search the CSS for `height: 100vh` — does it only appear inside `@media (min-width: 769px)`?
- [ ] Search the CSS for `min-height: 400` — it must not exist.
- [ ] Search the CSS for `overflow: hidden` on `body` or `html` — only inside desktop media query.
