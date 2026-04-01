# Art Asset Specification - The Ashmore Sanatorium

## Overview
Generated Apple II-style SVG art assets for the point-and-click adventure game "The Ashmore Sanatorium". All assets follow the retro aesthetic guidelines with limited color palettes, thick strokes, and geometric shapes.

## Scene Backgrounds (640x400 viewport)

### Scene 1: The Foyer
- **File:** `scene-1-foyer.svg`
- **Key Elements:** Frost-covered walls, marble floor, wrought-iron banister, chandelier with ice stalactites, reception desk with guest book, master key on hook, Records door, The Warden figure frozen mid-stride
- **Color Palette:** Dark blues, frost whites, tarnished gold, oak brown

### Scene 2: Records Room
- **File:** `scene-2-records-room.svg`
- **Key Elements:** Filing cabinets spilling papers, central desk with typewriter, cipher wheel, journal with scribbled numbers, wall map with red pins, Electrotherapy door, chained staircase to Ice Cellar
- **Color Palette:** Metal grays, paper beige, brass gold, wood brown

### Scene 3: Electrotherapy Chamber
- **File:** `scene-3-electrotherapy-chamber.svg`
- **Key Elements:** Metal gurneys with restraints, dangling wires, massive generator with open panel, battery cell with blue glow, monitoring equipment, Cryo-Feed schematic, Ice Cellar access door
- **Color Palette:** Steel grays, rust brown, electric blue, copper wire

### Scene 4: Ice Cellar
- **File:** `scene-4-ice-cellar.svg`
- **Key Elements:** Stone walls, ice-covered floor, storage lockers, autopsy table, wall safe with combination dial, patient ledger with circled entry, Director's Office door with tuning fork lock
- **Color Palette:** Ice blue, stone gray, leather brown, frost white

### Scene 5: Director's Office
- **File:** `scene-5-directors-office.svg`
- **Key Elements:** Iced-over windows, oak desk scattered with papers, phonograph with wax cylinder, resonance key glowing, spiral staircase with metal gate, portrait of Dr. Ashmore
- **Color Palette:** Oak brown, paper beige, brass gold, charged blue-white

### Scene 6: Observatory
- **File:** `scene-6-observatory.svg`
- **Key Elements:** Starry night sky, glass dome, massive telescope, Frostwell apparatus pulsing with blue light, control panel with tuning fork keyhole, dawn horizon
- **Color Palette:** Night black, star white, brass gold, electric blue, dawn orange

## Item Icons (64x64 viewport)

### Master Key
- **File:** `item-master-key.svg`
- **Description:** Large tarnished key with ornate bow and frost accents
- **Colors:** Tarnished gold, dark background

### Cipher Wheel
- **File:** `item-cipher-wheel.svg`
- **Description:** Brass-and-glass device with frozen dials and crystal center
- **Colors:** Brass gold, glass blue, frost white

### Battery Cell
- **File:** `item-battery-cell.svg`
- **Description:** Cylindrical cell with faint blue internal glow
- **Colors:** Steel gray, electric blue, metallic bands

### Patient Ledger
- **File:** `item-patient-ledger.svg`
- **Description:** Leather-bound log with circled red entry showing numbers 7-3-9
- **Colors:** Leather brown, paper beige, red accent

### Resonance Key
- **File:** `item-resonance-key.svg`
- **Description:** Tuning-fork-shaped device glowing with pale light
- **Colors:** Brass gold, pale blue glow, vibration lines

## Technical Specifications

- **Format:** SVG (Scalable Vector Graphics)
- **Scene Viewport:** 640x400 pixels (4:2.5 aspect ratio)
- **Item Viewport:** 64x64 pixels
- **Stroke Width:** 2-4px for thick, defined lines
- **Color Palette:** Maximum 8 colors per scene (Apple II inspired)
- **Style Elements:** Geometric shapes, patterns for texture, no gradients

## Color Palette Used

- Black: `#000000`
- White: `#FFFFFF`
- Frost Blue: `#AAEEFF`
- Dark Blue: `#2A2A44`, `#3A3A5A`, `#4A4A6A`
- Steel Gray: `#555577`, `#666688`
- Brass/Gold: `#B8860B`, `#DAA520`
- Leather/Wood Brown: `#5A3A2A`, `#6A4A3A`, `#8B6914`
- Paper Beige: `#D2B48C`, `#C2A47C`
- Electric Blue: `#0000FF`
- Red: `#FF0000`
- Green: `#00FF00`
- Orange: `#FF8800`

## Generation Notes

- All assets generated as SVG files for scalability
- Used geometric primitives (rectangles, circles, lines, polygons) for Apple II authenticity
- Implemented SVG patterns for textures (frost, marble, metal, ice)
- Applied thick strokes (2-4px) for bold, defined outlines
- Limited color usage to maintain retro aesthetic
- No text within scene artwork (game engine handles all text)

## Integration

Files are located in: `/workspace/games/003-ashmore-sanatorium/art/`

Scene files follow naming: `scene-{id}-{name}.svg`
Item files follow naming: `item-{id}.svg`

All assets are ready for integration into the game engine via `window.GAME_ART` in `game.html`.