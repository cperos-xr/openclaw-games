#!/usr/bin/env python3
import json, os
base = "/home/node/.openclaw/workspace/games/011-starlight-derelict"
with open(os.path.join(base, "game-script.json")) as f:
    game_data = json.load(f)
scene_ids = [s["id"] for s in game_data["scenes"]]
item_ids = [i["id"] for i in game_data["items"]]
def read_svg(path):
    try: return open(path).read().strip()
    except: return "<!-- missing -->"
game_art = {}
for sid in scene_ids: game_art[sid] = read_svg(os.path.join(base, "art", f"scene-{sid}.svg"))
for iid in item_ids: game_art[iid] = read_svg(os.path.join(base, "art", f"item-{iid}.svg"))
with open(os.path.join(base, "game-logic.js")) as f: logic_js = f.read()
title, num = game_data["title"], str(game_data["number"]).zfill(3)
html = f'''<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{title} | Game #{num}</title>
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet"><style>
*{{margin:0;padding:0;box-sizing:border-box;}}body{{background:#000;color:#0f0;font-family:'Press Start 2P',monospace;font-size:12px;line-height:1.4;padding:20px;max-width:1024px;margin:0 auto;display:flex;flex-direction:column;height:100vh;overflow:hidden;}}
header{{text-align:center;margin-bottom:10px;}}h1{{font-size:16px;margin-bottom:5px;color:#0f0;text-shadow:0 0 5px #0f0;}}h2{{font-size:14px;margin-bottom:10px;color:#0f0;}}
#scene-name{{font-size:18px;text-align:center;margin-bottom:10px;color:#0f0;text-transform:uppercase;letter-spacing:1px;}}
.game-container{{display:flex;flex:1;gap:20px;min-height:0;}}.art-panel{{flex:1;border:2px solid #0f0;background:#000;display:flex;justify-content:center;align-items:center;overflow:hidden;min-height:400px;}}
#text-display{{flex:1;overflow-y:auto;margin-bottom:10px;border-bottom:1px solid #0f0;padding-bottom:10px;}}
#text-display p{{margin-bottom:10px;color:#0f0;}}.system{{color:#0a0;font-style:italic;}}.success{{color:#0f0;font-weight:bold;animation:itemGlow 1s infinite alternate;}}.locked{{color:#f00;font-weight:bold;}}
.command-bar{{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:15px;}}.cmd-btn{{background:#000;color:#0f0;border:1px solid #0f0;padding:5px 10px;font-family:'Press Start 2P',monospace;font-size:10px;cursor:pointer;}}
.cmd-btn.active{{background:#0f0;color:#000;}}.exits-panel{{border:2px solid #0f0;background:#000;padding:10px;}}
#exits-bar{{display:flex;flex-wrap:wrap;gap:8px;}}.exit-btn{{background:#000;color:#0f0;border:1px solid #0f0;padding:5px 10px;font-family:'Press Start 2P',monospace;font-size:10px;cursor:pointer;}}
.look-target{{color:#0af;text-decoration:underline;cursor:pointer;}}@keyframes itemGlow{{0%{{text-shadow:0 0 5px #0f0;}}100%{{text-shadow:0 0 15px #0f0;}}}}.puzzle-solved{{animation:puzzle-solved 0.6s ease-in-out;}}
footer{{margin-top:20px;text-align:center;font-size:10px;color:#080;}}
</style></head><body><header><h1>{title.upper()}</h1><h2>Game #{num}</h2></header>
<div id="scene-name">AIRLOCK</div><div class="game-container"><div class="art-panel"><div id="art-display"></div></div>
<div class="text-panel"><div id="text-display"></div><div class="command-bar"><button class="cmd-btn" data-cmd="look">LOOK</button><button class="cmd-btn" data-cmd="take">TAKE</button><button class="cmd-btn" data-cmd="use">USE</button><button class="cmd-btn" data-cmd="examine">EXAMINE</button></div>
<h3>INVENTORY</h3><div id="inventory-bar"><span id="inv-empty">(empty)</span></div><h3>EXITS</h3><div id="exits-bar"></div></div></div><footer>Use commands or click highlighted words. Click exits to move. Type /restart to reset.</footer>
<script>const GAME_DATA={json.dumps(game_data)};const GAME_ART={json.dumps(game_art)};{logic_js}</script></body></html>'''
open(os.path.join(base, "game.html"), "w").write(html)
print("game.html created")