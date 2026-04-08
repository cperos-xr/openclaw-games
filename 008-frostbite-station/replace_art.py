#!/usr/bin/env python3
import re
import json

with open('game.html', 'r') as f:
    content = f.read()

# Find the GAME_ART section using regex
pattern = r'(window\.GAME_ART\s*=\s*\{.*?\};)'
match = re.search(pattern, content, re.DOTALL)
if not match:
    print("GAME_ART not found")
    exit(1)

game_art_block = match.group(1)
print(f"Found GAME_ART block, length {len(game_art_block)}")

# Extract the JSON object part
json_str = game_art_block.replace('window.GAME_ART =', '').strip().rstrip(';')
# The JSON may contain trailing commas; we can try to parse with json5, but we'll do simple replacements
# Instead of parsing, we'll do targeted replacements for each item key within this block only

# Map of base item IDs to PNG paths
base_items = {
    'emergency-fuse': 'art/item-emergency-fuse.png',
    'flare-torch': 'art/item-flare-torch.png',
    'frequency-transmitter': 'art/item-frequency-transmitter.png',
    'ice-core-artifact': 'art/item-ice-core-artifact.png',
    'keycard-maintenance': 'art/item-keycard-maintenance.png',
    'research-journal': 'art/item-research-journal.png',
    'sample-drill': 'art/item-sample-drill.png',
}

# For each base item, generate variations
replacements = {}
for base, png in base_items.items():
    # item- prefix
    replacements[f'item-{base}'] = png
    # ITEM- prefix uppercase
    replacements[f'ITEM-{base.upper().replace("-", "-")}'] = png
    # plain base (used as item ID)
    replacements[base] = png
    # uppercase plain
    replacements[base.upper()] = png
    # underscore variant
    replacements[base.replace('-', '_')] = png
    # scene- prefix (might be used for scene items, but we'll replace anyway)
    replacements[f'scene-{base}'] = png
    # SCENE- prefix uppercase
    replacements[f'SCENE-{base.upper().replace("-", "-")}'] = png
    # item_ underscore prefix
    replacements[f'item_{base.replace("-", "_")}'] = png
    # ITEM_ underscore uppercase
    replacements[f'ITEM_{base.upper().replace("-", "_")}'] = png

print(f"Will replace {len(replacements)} keys")

# For each key, replace SVG strings within the GAME_ART block
new_block = game_art_block
for key, png in replacements.items():
    # Pattern: "key": "<svg ...>"
    # Need to match across lines up to closing </svg>"
    pattern = r'(\"' + re.escape(key) + r'\"\s*:\s*\")(<svg.*?</svg>)(\")'
    # Use DOTALL to match across lines
    def replace_func(m):
        return m.group(1) + png + m.group(3)
    new_block = re.sub(pattern, replace_func, new_block, flags=re.DOTALL)
    print(f'Processed {key}')

# Replace the block in the original content
new_content = content[:match.start()] + new_block + content[match.end():]

# Write back
with open('game.html', 'w') as f:
    f.write(new_content)
print('Done')