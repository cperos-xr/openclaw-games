#!/usr/bin/env python3
import json
import os
import re

base = "/home/node/.openclaw/workspace/games/004-the-frequency-of-the-dead"
game_html_path = os.path.join(base, "game.html")

# Read the current game.html
with open(game_html_path, 'r') as f:
    content = f.read()

# Remove the game-art.js script tag (since we'll embed art inline)
# Find the line <script src="game-art.js"></script> and remove it
content = re.sub(r'<script src="game-art\.js"></script>\s*', '', content)

# Find the second script tag: from <script> to </script> (including the comment)
# We'll replace everything between <script> and </script> with our new content
script_pattern = r'<script>\s*// Game logic will be inserted here\s*</script>'
match = re.search(script_pattern, content, re.DOTALL)
if not match:
    print("Error: Could not find script tag with placeholder")
    exit(1)

# Extract scene and item IDs from game-script.json
script_path = os.path.join(base, "game-script.json")
with open(script_path, 'r') as f:
    game_data = json.load(f)

scene_ids = [scene["id"] for scene in game_data["scenes"]]
item_ids = [item["id"] for item in game_data["items"]]

print(f"Found {len(scene_ids)} scenes: {scene_ids}")
print(f"Found {len(item_ids)} items: {item_ids}")

# Read SVGs
def read_svg(path):
    try:
        with open(path, 'r') as f:
            return f.read().strip()
    except Exception as e:
        print(f"Warning: Could not read {path}: {e}")
        return "<!-- missing -->"

game_art = {}
# Scenes: scene-<id>.svg
for sid in scene_ids:
    svg_path = os.path.join(base, "art", f"scene-{sid}.svg")
    game_art[sid] = read_svg(svg_path)

# Items: item-<id>.svg
for iid in item_ids:
    svg_path = os.path.join(base, "art", f"item-{iid}.svg")
    game_art[iid] = read_svg(svg_path)

# Read game-logic.js
logic_path = os.path.join(base, "game-logic.js")
with open(logic_path, 'r') as f:
    logic_js = f.read()

# Construct new script content
new_script_content = f"""<script>
// ============================================================
// GAME DATA
const GAME_DATA = {json.dumps(game_data, indent=2)};

// ============================================================
// GAME ART
const GAME_ART = {json.dumps(game_art, indent=2)};

// ============================================================
// GAME LOGIC
{logic_js}
</script>"""

# Replace the script tag with new content
new_content = content[:match.start()] + new_script_content + content[match.end():]

# Write back
with open(game_html_path, 'w') as f:
    f.write(new_content)

print(f"Updated {game_html_path}")
print(f"Added {len(scene_ids)} scenes and {len(item_ids)} items to GAME_ART")