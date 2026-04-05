# Game #35: The Echo Chamber

**Theme:** An abandoned 1970s AM radio station. The equipment still hums. The voices on the static aren't from this world.

**Setting:** WVKR Radio — a local station that went dark in 1977 after the entire overnight crew vanished. You're a frequency inspector sent to assess the building for demolition. Something is still broadcasting.

**Art Style:** VECTOR (SVG scenes and items — clean, sharp, retro aesthetic with orange/amber/green CRT glow palette)

**Scene Count:** 6 scenes

**Puzzle Count:** 5 puzzles (studio rule)

**Item Count:** 5 items (each used exactly once)

---

## Scene List

### Scene 1: The Lobby
**ID:** `lobby`
**Purpose:** Entry point. Player learns the station's history via a clipboard. Receives first item.
**Exits:** North → Reception
**Items:** `security-badge`
**Puzzles:** None (starter room)
**Prose Tone:** Eerie quiet, fluorescent hum, dust-covered 1970s decor. The intercom crackles with a voice that says your name wrong.

### Scene 2: Reception / Control Desk
**ID:** `reception`
**Purpose:** First puzzle gate. Badge unlocks access. Player finds a reel-to-reel tape.
**Exits:** South → Lobby, East → Studio A, West → Engineering
**Items:** `reel-tape-alpha`
**Puzzles:** 
- Puzzle 1: Use `security-badge` on card reader to unlock East and West doors.
**Prose Tone:** The desk lamp is on. Someone was here recently. The calendar on the wall says October 1977.

### Scene 3: Studio A (Broadcast Booth)
**ID:** `studio-a`
**Purpose:** Second puzzle. The mixing board needs the reel tape to unlock a clue. Player finds a frequency diagram.
**Exits:** West → Reception
**Items:** `frequency-diagram`
**Puzzles:**
- Puzzle 2: Insert `reel-tape-alpha` into the reel-to-reel player. Plays back a distorted message revealing a frequency code.
**Prose Tone:** Soundproofed room. Dead microphones. The reel-to-reel spins on its own for a moment when you enter.

### Scene 4: Engineering / Transmitter Room
**ID:** `engineering`
**Purpose:** Third puzzle. The frequency diagram tells player which dial to set. Player finds a transmitter key.
**Exits:** East → Reception
**Items:** `transmitter-key`
**Puzzles:**
- Puzzle 3: Set the transmitter dial to the frequency from the diagram (e.g., 89.7 FM). This unlocks a compartment with the key.
**Prose Tone:** Wall of dials and meters. One needle is twitching. The air smells like ozone and old cigarettes.

### Scene 5: The Archive / Tape Library
**ID:** `archive`
**Purpose:** Fourth puzzle. The transmitter key opens a locked filing cabinet. Inside is a master tape with the "real" broadcast.
**Exits:** North → Reception
**Items:** `master-tape-omega`
**Puzzles:**
- Puzzle 4: Use `transmitter-key` on the locked file cabinet. Inside: the master tape labeled "DO NOT AIR."
**Prose Tone:** Shelves of reel tapes. Some are labeled with dates that haven't happened yet. The air is colder here.

### Scene 6: The Broadcast Room / Climax
**ID:** `broadcast-room`
**Purpose:** Final puzzle and win. Player inserts the master tape into the main transmitter. Broadcasting it ends the loop — or doesn't.
**Exits:** South → Reception
**Items:** None
**Puzzles:**
- Puzzle 5: Insert `master-tape-omega` into the main broadcast deck. Press TRANSMIT. The static clears to a voice that knows everything about you.
**Win Condition:** Pressing TRANSMIT with the master tape loaded triggers the end game.
**Prose Tone:** The biggest room. The main transmitter hums at full power. The ON AIR light flickers on as you approach.

---

## Puzzle Chain

1. **Badge → Unlock doors** (Puzzle 1: `security-badge` used on card reader in Reception)
2. **Reel tape → Playback message** (Puzzle 2: `reel-tape-alpha` inserted in Studio A reel-to-reel)
3. **Frequency diagram → Set dial** (Puzzle 3: Use frequency code from tape to set Engineering transmitter dial)
4. **Transmitter key → Open cabinet** (Puzzle 4: `transmitter-key` used on locked archive cabinet)
5. **Master tape → Transmit** (Puzzle 5: `master-tape-omega` loaded and broadcast in Broadcast Room)

---

## Item List

| Item ID | Name | Found In | Used In | Used On |
|---------|------|----------|---------|---------|
| `security-badge` | WVKR Security Badge | Lobby | Reception | Card Reader |
| `reel-tape-alpha` | Reel Tape "Alpha" | Reception | Studio A | Reel-to-Reel Player |
| `frequency-diagram` | Handwritten Frequency Diagram | Studio A | Engineering | Transmitter Dial |
| `transmitter-key` | Brass Transmitter Key | Engineering | Archive | Locked File Cabinet |
| `master-tape-omega` | Master Tape "Omega - DO NOT AIR" | Archive | Broadcast Room | Main Broadcast Deck |

---

## Characters

- **Player:** Frequency inspector (silent protagonist)
- **The Voice:** An entity on the static that mimics human speech. Not truly malevolent, but deeply wrong. Appears in audio cues.

---

## Win Scene Prose Concept

The master tape plays. The static clears to a voice — calm, familiar, and impossibly knowing. It recites details from your life you've never told anyone. Then: "We've been waiting for you to come back on air." The ON AIR light goes steady. The building exhales. You are no longer the inspector. You are the next overnight host.

Fade to black. Credits: "WVKR 89.7 — Broadcasting Since 1952. Broadcasting Forever."
