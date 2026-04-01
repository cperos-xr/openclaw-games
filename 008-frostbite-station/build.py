#!/usr/bin/env python3
import json
import os

base = "/home/node/.openclaw/workspace/games/008-frostbite-station"
script_path = os.path.join(base, "game-script.json")

with open(script_path, 'r') as f:
    game_data = json.load(f)

scene_ids = [scene["id"] for scene in game_data["scenes"]]
item_ids = [item["id"] for item in game_data["items"]]

print(f"Found {len(scene_ids)} scenes: {scene_ids}")
print(f"Found {len(item_ids)} items: {item_ids}")

def read_svg(path):
    try:
        with open(path, 'r') as f:
            return f.read().strip()
    except Exception as e:
        print(f"Warning: Could not read {path}: {e}")
        return "<!-- missing -->"

game_art = {}
for sid in scene_ids:
    svg_path = os.path.join(base, "art", f"scene-{sid}.svg")
    game_art[sid] = read_svg(svg_path)

for iid in item_ids:
    svg_path = os.path.join(base, "art", f"item-{iid}.svg")
    game_art[iid] = read_svg(svg_path)

logic_path = os.path.join(base, "game-logic.js")
with open(logic_path, 'r') as f:
    logic_js = f.read()

title = game_data["title"]
game_number = str(game_data["number"]).zfill(3)

html_template = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | Game #{game_number}</title>
    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            background-color: #000;
            color: #0f0;
            font-family: 'Press Start 2P', monospace;
            font-size: 12px;
            line-height: 1.4;
            padding: 20px;
            max-width: 1024px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            height: 100vh;
            overflow: hidden;
        }}

        header {{
            text-align: center;
            margin-bottom: 10px;
        }}

        h1 {{
            font-size: 16px;
            margin-bottom: 5px;
            color: #0f0;
            text-shadow: 0 0 5px #0f0;
        }}

        h2 {{
            font-size: 14px;
            margin-bottom: 10px;
            color: #0f0;
        }}

        #scene-name {{
            font-size: 18px;
            text-align: center;
            margin-bottom: 10px;
            color: #0f0;
            text-transform: uppercase;
            letter-spacing: 1px;
        }}

        .game-container {{
            display: flex;
            flex: 1;
            gap: 20px;
            min-height: 0;
        }}

        .art-panel {{
            flex: 1;
            border: 2px solid #0f0;
            background-color: #000;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            min-height: 400px;
        }}

        #art-display svg,
        #art-display img {{
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }}

        .text-panel {{
            flex: 1;
            border: 2px solid #0f0;
            background-color: #000;
            padding: 15px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }}

        #text-display {{
            flex: 1;
            overflow-y: auto;
            margin-bottom: 10px;
            border-bottom: 1px solid #0f0;
            padding-bottom: 10px;
        }}

        #text-display p {{
            margin-bottom: 10px;
            color: #0f0;
        }}

        #text-display .system {{
            color: #0a0;
            font-style: italic;
        }}

        #text-display .success {{
            color: #0f0;
            font-weight: bold;
            animation: itemGlow 1s infinite alternate;
        }}

        #text-display .locked {{
            color: #f00;
            font-weight: bold;
        }}

        #text-display .error {{
            color: #f00;
        }}

        .command-bar {{
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 15px;
        }}

        .cmd-btn {{
            background-color: #000;
            color: #0f0;
            border: 1px solid #0f0;
            padding: 5px 10px;
            font-family: 'Press Start 2P', monospace;
            font-size: 10px;
            cursor: pointer;
            transition: all 0.2s;
        }}

        .cmd-btn:hover {{
            background-color: #0f0;
            color: #000;
        }}

        .cmd-btn.active {{
            background-color: #0f0;
            color: #000;
        }}

        .inventory-panel {{
            border: 2px solid #0f0;
            background-color: #000;
            padding: 10px;
            margin-bottom: 15px;
        }}

        .inventory-panel h3 {{
            font-size: 12px;
            margin-bottom: 5px;
            color: #0f0;
        }}

        #inventory-bar {{
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            min-height: 20px;
        }}

        .inv-item {{
            border: 1px solid #0f0;
            padding: 3px 6px;
            font-size: 10px;
            cursor: pointer;
            background-color: #000;
            color: #0f0;
        }}

        .inv-item.selected {{
            background-color: #0f0;
            color: #000;
        }}

        .exits-panel {{
            border: 2px solid #0f0;
            background-color: #000;
            padding: 10px;
        }}

        .exits-panel h3 {{
            font-size: 12px;
            margin-bottom: 5px;
            color: #0f0;
        }}

        #exits-bar {{
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }}

        .exit-btn {{
            background-color: #000;
            color: #0f0;
            border: 1px solid #0f0;
            padding: 5px 10px;
            font-family: 'Press Start 2P', monospace;
            font-size: 10px;
            cursor: pointer;
        }}

        .exit-btn.available:hover {{
            background-color: #0f0;
            color: #000;
        }}

        .look-target {{
            color: #0af;
            text-decoration: underline;
            cursor: pointer;
        }}

        .look-target:hover {{
            color: #0ff;
        }}

        @keyframes puzzle-solved {{
            0% {{ filter: brightness(1); }}
            50% {{ filter: brightness(2); }}
            100% {{ filter: brightness(1); }}
        }}

        @keyframes unlockPulse {{
            0% {{ transform: scale(1); }}
            50% {{ transform: scale(1.05); }}
            100% {{ transform: scale(1); }}
        }}

        @keyframes itemGlow {{
            0% {{ text-shadow: 0 0 5px #0f0; }}
            100% {{ text-shadow: 0 0 15px #0f0; }}
        }}

        .puzzle-solved {{
            animation: puzzle-solved 0.6s ease-in-out;
        }}

        footer {{
            margin-top: 20px;
            text-align: center;
            font-size: 10px;
            color: #080;
        }}
    </style>
</head>
<body>
    <header>
        <h1>{title.upper()}</h1>
        <h2>Game #{game_number}</h2>
    </header>

    <div id="scene-name">LANDING PAD</div>

    <div class="game-container">
        <div class="art-panel">
            <div id="art-display">
                <!-- Art will be inserted here by JavaScript -->
            </div>
        </div>

        <div class="text-panel">
            <div id="text-display">
                <!-- Game text will appear here -->
            </div>

            <div class="command-bar">
                <button class="cmd-btn" data-cmd="look">LOOK</button>
                <button class="cmd-btn" data-cmd="take">TAKE</button>
                <button class="cmd-btn" data-cmd="use">USE</button>
                <button class="cmd-btn" data-cmd="examine">EXAMINE</button>
            </div>

            <div class="inventory-panel">
                <h3>INVENTORY</h3>
                <div id="inventory-bar">
                    <span id="inv-empty">(empty)</span>
                </div>
            </div>

            <div class="exits-panel">
                <h3>EXITS</h3>
                <div id="exits-bar">
                    <!-- Exit buttons will appear here -->
                </div>
            </div>
        </div>
    </div>

    <footer>
        Use the command buttons or click on highlighted words. Click exits to move.
        Type /restart in the text area to reset the game.
    </footer>

    <script>
// ============================================================
// GAME DATA
const GAME_DATA = {json.dumps(game_data, indent=2)};

// ============================================================
// GAME ART
const GAME_ART = {json.dumps(game_art, indent=2)};

// ============================================================
// GAME LOGIC
{logic_js}
    </script>
</body>
</html>
'''

html_path = os.path.join(base, "game.html")
with open(html_path, 'w') as f:
    f.write(html_template)

print(f"Created {html_path}")
