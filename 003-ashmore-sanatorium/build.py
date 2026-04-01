#!/usr/bin/env python3
import json
import os
import re

base = "/home/node/.openclaw/workspace/games/003-ashmore-sanatorium"
game_html_path = os.path.join(base, "game.html")

# Read the current game.html
with open(game_html_path, 'r') as f:
    content = f.read()

# Find where to insert: after the GAME DATA comment line
match = re.search(r'// ============================================================\s*$', content, re.MULTILINE)
if not match:
    # Fallback: find last </script>? Actually there is none yet
    insert_pos = len(content)
else:
    insert_pos = match.end()

# Build GAME_ART object
scene_ids = [
    "foyer",
    "records-room", 
    "electrotherapy-chamber",
    "ice-cellar",
    "directors-office",
    "observatory"
]

item_ids = [
    "master-key",
    "cipher-wheel",
    "battery-cell",
    "patient-ledger",
    "resonance-key"
]

# Read SVGs
def read_svg(path):
    try:
        with open(path, 'r') as f:
            return f.read().strip()
    except:
        return "<!-- missing -->"

game_art = {}
# Scenes: files are named scene-1-foyer.svg etc.
for idx, sid in enumerate(scene_ids, 1):
    svg_path = os.path.join(base, "art", f"scene-{idx}-{sid}.svg")
    game_art[sid] = read_svg(svg_path)

# Items
for iid in item_ids:
    svg_path = os.path.join(base, "art", f"item-{iid}.svg")
    game_art[iid] = read_svg(svg_path)

# Read game-logic.js
logic_path = os.path.join(base, "game-logic.js")
with open(logic_path, 'r') as f:
    logic_js = f.read()

# Read game-script.json to embed as GAME_DATA
script_path = os.path.join(base, "game-script.json")
with open(script_path, 'r') as f:
    game_data = json.load(f)

# Construct new part
new_part = f"""
const GAME_DATA = {json.dumps(game_data, indent=2)};
const GAME_ART = {json.dumps(game_art, indent=2)};

{logic_js}
</script>
</body>
</html>
"""

# Replace from insert_pos to end
new_content = content[:insert_pos] + new_part

# Write back
with open(game_html_path, 'w') as f:
    f.write(new_content)

print(f"Updated {game_html_path}")
print(f"Added {len(scene_ids)} scenes and {len(item_ids)} items to GAME_ART")