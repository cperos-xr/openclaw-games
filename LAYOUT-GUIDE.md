# OpenClaw Game Layout Guide — v4.0

> **TL;DR:** Start from the shared-engine wrappers in `games/` and set layout by data. Use `GAME-TEMPLATE.html` for the standard layout, `GAME-TEMPLATE-VERTICAL.html` for the vertical carnival wrapper, and `layout` in `game-script.json` to swap between them. Do not invent a new layout unless there is a documented reason, a review, and a passing mobile QA run.

---

# Part A — Non-Negotiable Rules

This section is the enforcement layer. These rules are mandatory. If a game violates any item here, it is not ready for QA.

## A1. Mobile-first is mandatory

Write base CSS for a small phone first. Desktop is an enhancement layered on with `@media (min-width: 769px)`.

**Required:**
- Base layout must work at 390px width without horizontal scrolling
- Base layout must allow vertical page scrolling
- Desktop-only layout changes must live inside `@media (min-width: 769px)`

**Forbidden:**
- Building desktop first and patching mobile later
- Side-by-side panel layout at base level
- Fixed-height page shells at base level

---

## A2. Base layout must remain scrollable

At mobile widths, content below the fold must remain reachable.

**Required:**
- `body` may use `overflow-x: hidden`
- Vertical overflow must remain reachable through normal browser scroll

**Forbidden at base level:**
```css
body { height: 100vh; overflow: hidden; }
html, body { overflow: hidden; }
```

**Allowed on desktop only:**
```css
@media (min-width: 769px) {
  body { height: 100vh; overflow: hidden; }
}
```

---

## A3. Mobile stacks vertically by default

The default game flow on mobile is top-to-bottom:
1. title/status
2. art
3. text
4. commands
5. exits
6. inventory or secondary controls

**Required:**
- Base layout must stack naturally in document flow
- No desktop-only side-by-side rules may leak into base CSS

**Forbidden at base level:**
```css
.game-container { display: flex; }
.game-container { display: grid; }
```

---

## A4. Desktop may switch to side-by-side

Desktop is allowed to use a split layout only inside the desktop media query.

**Required desktop behavior:**
- `.game-container` may become flex
- art and text may sit side-by-side
- the desktop layout must fit within one viewport without unwanted outer scrollbars

**Required desktop shrink rule:**
```css
.game-container { min-height: 0; }
```

Any flex container expected to shrink within the viewport must explicitly allow shrinking.

---

## A5. Never use `min-height` on the art panel

Large fixed minimum heights make the art panel consume the screen before the user can reach the text or controls.

**Forbidden:**
```css
.art-panel { min-height: 400px; }
```

**Required mobile behavior:**
- art must scale proportionally
- art must remain visible without dominating the screen
- art must leave room for text and controls

**Approved pattern:**
```css
.art-panel {
  width: 100%;
  aspect-ratio: 8 / 5;
  max-height: 56vw;
  overflow: hidden;
}
```

---

## A6. Text must remain readable and reachable

Narrative text is core gameplay content. It cannot be squeezed into an unreadable slot or pushed permanently out of view.

**Required:**
- the text region must be readable at 390px width
- long text must be scrollable or naturally reachable
- on mobile, text must not be trapped below a non-scrollable page shell

**Approved mobile pattern:**
```css
#text-display {
  overflow-y: auto;
  max-height: 40vh;
}
```

Desktop may relax the cap when the panel becomes a flex child.

---

## A7. All button rows must wrap

Any row of commands that can exceed viewport width must wrap.

**Required:**
```css
.command-bar,
#exits-bar,
.inventory-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
```

**Forbidden:**
```css
.command-bar { display: flex; gap: 10px; }
```
without `flex-wrap: wrap`.

---

## A8. All tappable controls must meet touch minimums

**Required on mobile:**
```css
.cmd-btn,
.exit-btn,
.inventory-btn {
  min-height: 44px;
  min-width: 44px;
}
```

Desktop may reduce button height if usability remains good with mouse input.

---

## A9. Do not use CSS Grid for primary game layout

Grid is not approved for the main game shell.

**Reason:**
- fixed columns break narrow screens
- grid-area overrides add maintenance overhead
- flex is simpler for the approved mobile-to-desktop transition

Grid may be used for small internal components only if it does not affect responsive game-shell behavior.

---

## A10. Use the template unless an exception is documented

The canonical shared-engine references are `GAME-TEMPLATE.html` and `GAME-TEMPLATE-VERTICAL.html`.

The preferred switch is the `layout` field in `game-script.json`:
- `standard`
- `vertical-carnival`

**Required process:**
- Start from the shared wrapper that matches the intended layout
- Keep the shared runtime and shared style intact
- Make only game-specific visual changes unless a layout exception is approved
- Document any layout-level deviation in code comments or review notes

---

## A11. Search-based QA checks are mandatory

Before submission, search CSS for these patterns:

- `height: 100vh`
- `overflow: hidden`
- `min-height: 400`
- `display: grid`
- `grid-template-columns`
- `Press Start 2P`
- `line-height:`
- `.command-bar`
- `.art-panel`

**Pass criteria:**
- `height: 100vh` only appears inside `@media (min-width: 769px)`
- `overflow: hidden` on `html` or `body` only appears inside desktop media query
- large `min-height` on `.art-panel` does not exist
- primary layout is not grid-based
- wrapping is present on button bars

---

## A12. Real-device and narrow-width verification are mandatory

Every game must be checked at minimum in these states:
- 390px wide portrait
- 430px wide portrait
- 768px wide portrait
- 1024px wide landscape
- desktop 1366×768

At 390px portrait, the game must:
- scroll vertically
- show art at a reasonable height
- show readable text
- keep commands reachable
- avoid horizontal scrolling
- keep all tap targets usable

---

# Part B — Full Reference Guide

This section explains how to build and review layouts that survive real devices, content growth, and future changes.

## B1. Purpose

This guide defines the standard layout behavior for OpenClaw HTML games. It exists to ensure that every game:
- works on phones first
- remains readable under content growth
- fits cleanly on desktop
- behaves consistently across titles
- does not reintroduce known layout regressions

This is not just a style suggestion. It is the system contract for how a game page should be structured.

---

## B2. What Broke Before

Multiple games regressed for the same reasons:
- `height:100vh` plus `overflow:hidden` at base level prevented access to off-screen content
- large `min-height` values on the art panel pushed all useful UI below the fold
- desktop side-by-side rules leaked into phone layouts
- button rows did not wrap
- pixel-font settings created unreadable text density
- scroll ownership was unclear or broken

The key pattern was not one bad declaration. It was abandoning the working template and rebuilding layout rules from scratch.

---

## B3. Architecture Overview

The approved page model has three layers:

### 1. Page shell
The outer document and body. On mobile this remains scrollable. On desktop it may lock to the viewport.

### 2. Game container
The main structural wrapper for art and text. On mobile it stacks naturally. On desktop it may become a flex row.

### 3. Internal regions
- status/title
- art panel
- text panel
- command bar
- exits bar
- inventory or contextual actions

The key principle is simple:
- **mobile uses document flow**
- **desktop may use viewport-managed flex layout**

---

## B4. Scroll Ownership

This must be explicit.

### Mobile
The page owns vertical scrolling.
- The user can scroll the full document
- Some internal regions, like `#text-display`, may also scroll if capped
- No critical content may be trapped beneath a non-scrollable outer shell

### Desktop
The viewport may be fixed.
- `body` may become `height: 100vh; overflow: hidden`
- internal panels may manage overflow
- flex children must allow shrinkage using `min-height: 0`

### Rule of thumb
If you cannot answer “which element owns vertical scroll in this breakpoint,” the layout is not ready.

---

## B5. Approved Breakpoints

### Base: 0–768px
Treat this as phone-first and narrow-tablet-safe.
- single-column flow
- page scroll enabled
- wrapped controls
- bounded art

### Desktop enhancement: 769px+
The split layout may activate.
- side-by-side art and text
- viewport-managed shell allowed
- internal overflow handling allowed

### Practical testing widths
Use these as named checkpoints:
- **390px** — minimum target phone layout
- **430px** — large modern phone
- **768px** — portrait tablet boundary
- **1024px** — landscape tablet / small laptop
- **1366px** — common laptop baseline

A game that only works at 390px and 1366px but fails in the middle is not responsive enough.

---

## B6. Viewport Units and Safe Areas

The known bug pattern involves `100vh`, but the broader lesson is that viewport units are fragile on mobile.

### Guidance
- Do not use fixed viewport-height shells at base level
- Prefer content flow on mobile over exact viewport fitting
- If future work introduces modern viewport units like `dvh`, they still must not trap content below the fold
- If the shell ever includes fixed bottom controls, account for safe-area padding on devices with notches or home indicators

For current OpenClaw games, the simplest stable choice is still:
- mobile: normal page flow
- desktop: optional viewport shell

---

## B7. Canonical CSS Skeleton

Use this as the standard baseline.

```css
/* BASE: mobile-first, scrollable */
body {
  overflow-x: hidden;
  padding: 8px;
  max-width: 1200px;
  margin: 0 auto;
}

.art-panel {
  width: 100%;
  aspect-ratio: 8 / 5;
  max-height: 56vw;
  overflow: hidden;
}

#art-display svg,
#art-display img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

#text-display {
  overflow-y: auto;
  max-height: 40vh;
}

.command-bar,
#exits-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.cmd-btn,
.exit-btn {
  min-height: 44px;
  min-width: 44px;
}

@media (min-width: 769px) {
  body {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  .game-container {
    display: flex;
    flex: 1;
    gap: 12px;
    min-height: 0;
  }

  .art-panel {
    flex: 3;
    aspect-ratio: unset;
    max-height: none;
  }

  .text-panel {
    flex: 2;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  #text-display {
    flex: 1;
    max-height: none;
  }

  .cmd-btn,
  .exit-btn {
    min-height: 36px;
  }
}
```

This is the baseline. Teams should modify styling around this structure, not replace the structure casually.

---

## B8. Panel Contracts

Each region should have a clear contract.

### Art panel
**Role:** visual reinforcement, immediate scene recognition, atmosphere

**Must:**
- be visible without dominating the screen
- maintain proportion
- degrade gracefully if art is missing or oddly sized

**Must not:**
- use large fixed minimum heights
- push all commands below the fold
- crop essential art without intent

**Preferred behavior:**
- contain SVG/image cleanly
- cap mobile height relative to width
- allow flexible growth on desktop

### Text panel
**Role:** primary gameplay information

**Must:**
- stay readable
- allow long descriptions
- remain reachable on all breakpoints

**Must not:**
- collapse into a tiny unreadable sliver
- get pushed below a locked page shell

### Command bar
**Role:** primary interaction surface

**Must:**
- wrap
- preserve tap size
- support short and medium labels

**Must not:**
- rely on a single unbroken row
- overflow horizontally

### Exits bar
**Role:** navigation choices

**Must:**
- wrap like commands
- remain visually distinct from action buttons when possible
- scale to rooms with many exits

### Inventory/actions area
**Role:** secondary interaction surface

**Must:**
- handle growth from zero items to many items
- wrap or scroll intentionally
- show an empty state if no items exist

---

## B9. Typography Rules

The prior guide correctly identified pixel-font misuse as a source of failure. The broader rule is that type choices are layout choices.

### Body text
Use a readable font with moderate line height.

**Recommended targets:**
- body size: roughly 14–18px depending on style
- line height: roughly 1.4–1.6 for body copy
- comfortable paragraph width

### Pixel fonts
Pixel fonts may be used for headers, labels, or flavor, but they are dangerous for long narrative text.

**Use with caution:**
- avoid for long paragraphs
- avoid oversized line height
- test on real phones

**Forbidden combination for main text:**
- dense narrative paragraphs in `Press Start 2P`
- large font size plus `line-height: 1.8`

### Text density rule
At 390px width, one short sentence should not fill the entire visible text area by default. If it does, the typography is too large or too loose.

---

## B10. Spacing System

Spacing must be consistent and compact enough for phones.

### Recommended spacing rhythm
- 4px for very tight internal separation
- 6–8px for button gaps and panel padding
- 12px for section separation
- 16px+ only where there is clear visual benefit

### Rule
On mobile, every extra 8px of padding is a layout decision. Wasteful spacing can be just as damaging as bad height rules.

---

## B11. Interaction States

A layout guide should define state behavior because state styling affects space, readability, and usability.

### Buttons must define:
- default
- hover
- focus-visible
- active
- disabled

### Focus requirement
Keyboard focus must be visible without relying only on color.

### Long labels
If labels become long:
- wrapping is acceptable if the button remains readable and tappable
- truncation is acceptable only when meaning remains clear and another access path exists
- overflow off the screen is never acceptable

---

## B12. Accessibility Requirements

These are layout-relevant accessibility rules.

### Required
- tappable controls at least 44×44px on mobile
- visible focus state
- sufficient contrast for text and controls
- keyboard reachability for interactive elements
- no layout break at increased browser zoom or text scaling
- readable reflow without horizontal scroll at narrow widths

### Strongly recommended
- semantic button elements for actions
- semantic headings for structure
- clear labels for exits and inventory actions
- reduced-motion consideration if animations are introduced later

A layout that only works for mouse users at default zoom is not done.

---

## B13. Dynamic Content Resilience

Games do not stay in their ideal state. The layout must survive growth.

### Must handle
- long room descriptions
- many action buttons
- many exits
- inventory growth
- very tall or very wide art assets
- missing art assets
- localized or expanded text strings

### Stress cases to check
- 500+ characters in narrative text
- 10+ buttons in the command bar
- 8+ exits
- 20 inventory items
- art load failure fallback
- browser text zoom

If any of these states break layout, the design is incomplete.

---

## B14. Anti-Patterns

These are known bad patterns and should not be reintroduced.

### Anti-pattern 1: Base-level viewport lock
```css
body { height: 100vh; overflow: hidden; }
```
Result: mobile content disappears below the fold.

### Anti-pattern 2: Oversized art panel floor
```css
.art-panel { min-height: 400px; }
```
Result: art dominates small screens and hides gameplay UI.

### Anti-pattern 3: Permanent side-by-side shell
```css
.game-container { display: flex; }
```
Result: art and text both become too narrow on phones.

### Anti-pattern 4: Unwrapped controls
```css
.command-bar { display: flex; }
```
Result: controls overflow off-screen.

### Anti-pattern 5: Primary layout in grid
```css
.game-container { display: grid; grid-template-columns: 1fr 320px; }
```
Result: narrow screens break, overrides become fragile.

### Anti-pattern 6: Decorative font as body text engine
Result: readability collapses and text density becomes unusable.

---

## B15. QA Matrix

Use this matrix before submission.

| View | Expected behavior |
|------|-------------------|
| 390×844 portrait | Page scroll works, no horizontal scroll, art visible, text readable, all controls reachable |
| 430×932 portrait | Same as above with slightly more breathing room |
| 768×1024 portrait | Still stable in single-column or transitional behavior, no crushed panels |
| 1024×768 landscape | Desktop enhancement may activate; no outer overflow bugs |
| 1366×768 desktop | Fits cleanly in one viewport with internal overflow where intended |

### Required checks
- rotate phone orientation
- open with long text state
- open with many commands
- open with many exits
- open with large inventory state
- inspect focus behavior via keyboard
- verify no hidden controls

---

## B16. Submission Checklist

Before sending `game.html` to QA, verify all of the following:

### Layout
- [ ] Mobile base layout stacks vertically
- [ ] Page scroll works at 390px width
- [ ] No horizontal scroll at 390px width
- [ ] Art is visible but not oversized
- [ ] Text is readable and reachable
- [ ] Desktop layout fits cleanly inside the viewport

### CSS search checks
- [ ] `height: 100vh` appears only inside `@media (min-width: 769px)`
- [ ] `overflow: hidden` on `html` or `body` appears only inside desktop media query
- [ ] No large fixed `min-height` on `.art-panel`
- [ ] Primary layout is not grid-based
- [ ] Button bars use `flex-wrap: wrap`

### Interaction
- [ ] All primary controls are at least 44px tall on mobile
- [ ] All controls are reachable at narrow widths
- [ ] Focus styling is visible
- [ ] Long labels do not break layout

### Stress tests
- [ ] Long text state passes
- [ ] Many-buttons state passes
- [ ] Many-exits state passes
- [ ] Inventory growth state passes
- [ ] Missing-art fallback passes

---

## B17. Exception Process

Exceptions should be rare.

A layout-level deviation from the template is allowed only if all of the following are true:
- there is a specific gameplay reason
- the reason is documented
- mobile behavior remains first-class
- the change passes the full QA matrix
- the exception does not reintroduce any forbidden pattern

“Wanted a different look” is not enough.

---

## B18. Ongoing Learnings

This section is intentionally open-ended. It should be updated whenever a game reveals a new layout failure mode, a new device quirk, or a better proven pattern.

### Why this section exists
The prior regressions did not happen because the team lacked talent. They happened because lessons were learned repeatedly and then lost. Ongoing learnings are how we stop paying for the same bug twice.

### How to add an entry
Each entry should include:
- **Date**
- **Game / build**
- **Symptom**
- **Root cause**
- **Fix**
- **Prevention rule**
- **Whether Part A changed**

### Entry template
```md
#### YYYY-MM-DD — Game ### / build X
- Symptom:
- Root cause:
- Fix:
- Prevention rule:
- Part A update required: yes/no
```

### Current learnings log

#### 1. Base-level viewport lock hides gameplay content
- Symptom: users cannot reach inventory, exits, or lower controls on phones
- Root cause: `height:100vh` combined with `overflow:hidden` on `body` or `html`
- Fix: keep mobile in normal document flow; move viewport lock to desktop-only media query
- Prevention rule: never lock base layout to viewport height
- Part A update required: no, already covered

#### 2. Large art minimums crowd out interaction
- Symptom: art consumes most of the phone screen; text and controls vanish below the fold
- Root cause: fixed `min-height` on `.art-panel`
- Fix: use aspect ratio and width-based cap
- Prevention rule: art scales proportionally; never force a large minimum height
- Part A update required: no, already covered

#### 3. Desktop shell assumptions leak into mobile
- Symptom: art and text become tiny columns on phones
- Root cause: base-level flex row or grid-based shell
- Fix: mobile stacks by default; desktop enhancement activates later
- Prevention rule: base layout must not depend on side-by-side composition
- Part A update required: no, already covered

#### 4. Unwrapped control rows fail under content growth
- Symptom: buttons overflow off the right edge on narrow devices
- Root cause: button bars assumed a single row would always fit
- Fix: wrap controls and keep gaps compact
- Prevention rule: every variable-length control row must wrap
- Part A update required: no, already covered

#### 5. Typography can break layout even when containers are correct
- Symptom: one sentence fills the screen and interaction feels cramped
- Root cause: decorative fonts and loose line height applied to body text
- Fix: use a readable body font and moderate line height; reserve pixel fonts for accents
- Prevention rule: body text settings must be tested at 390px width
- Part A update required: no, but monitor future examples

### Future learning categories to watch
Keep adding entries in these areas if they appear:
- mobile browser chrome and dynamic viewport quirks
- keyboard-open layout failures
- safe-area inset problems
- localization and text expansion
- art asset edge cases
- animation-related layout shift
- browser-specific overflow bugs

---

## B19. Final Guidance

The safest way to ship a correct layout is still the simplest one:
- start from the template
- keep mobile in normal flow
- bound art
- let controls wrap
- reserve viewport locking for desktop only
- test with narrow widths and ugly content states

The purpose of this guide is not to limit creativity. It is to protect gameplay from avoidable layout bugs.

