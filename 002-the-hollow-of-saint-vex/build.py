#!/usr/bin/env python3
import json
import os

base = "/home/node/.openclaw/workspace/games/002-the-hollow-of-saint-vex"
game_html_path = os.path.join(base, "game.html")

# Read the current game.html
with open(game_html_path, 'r') as f:
    content = f.read()

# Find where GAME_DATA ends
# It ends with "};" before closing script tag
import re
# Pattern to find the closing semicolon after the JSON
match = re.search(r'(\s*;\s*)</script>', content)
if not match:
    # If no script tag, find the end of GAME_DATA
    match = re.search(r'(\s*;\s*)$', content)
if not match:
    # Just append at end
    insert_pos = len(content)
else:
    insert_pos = match.start()

# Build GAME_ART object
scene_ids = [
    "scene-1-entrance",
    "scene-2-supply-tunnel", 
    "scene-3-equipment-room",
    "scene-4-chapel-antechamber",
    "scene-5-flooded-nave",
    "scene-6-bell-tower",
    "scene-7-reliquary"
]

item_ids = [
    "item-pickaxe",
    "item-lantern",
    "item-matches",
    "item-crowbar",
    "item-ritual-book",
    "item-bell-saint-vex",
    "item-bell-hollow",
    "item-bell-bone",
    "item-bell-mercy"
]

# Read SVGs
def read_svg(path):
    try:
        with open(path, 'r') as f:
            return f.read().strip()
    except:
        return "<!-- missing -->"

game_art = {}
for sid in scene_ids:
    svg_path = os.path.join(base, "art", f"{sid}.svg")
    game_art[sid] = read_svg(svg_path)

for iid in item_ids:
    svg_path = os.path.join(base, "art", f"{iid}.svg")
    game_art[iid] = read_svg(svg_path)

# Read game-logic.js
logic_path = os.path.join(base, "game-logic.js")
with open(logic_path, 'r') as f:
    logic_js = f.read()

# Construct new part
new_part = f"""
// GAME_ART
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