#!/usr/bin/env python3
import re

with open('game.html', 'r') as f:
    lines = f.readlines()

# Find start line
start = None
for i, line in enumerate(lines):
    if line.strip().startswith('const GAME_ART = {'):
        start = i
        break
if start is None:
    print("const GAME_ART not found")
    exit(1)

# Find matching closing brace and semicolon
brace_count = 0
end = None
for i in range(start, len(lines)):
    line = lines[i]
    for ch in line:
        if ch == '{':
            brace_count += 1
        elif ch == '}':
            brace_count -= 1
            if brace_count == 0:
                # Check if next char is semicolon on same line
                if '};' in line:
                    end = i
                    break
                else:
                    # look ahead
                    pass
    if end is not None:
        break
if end is None:
    print("Could not find matching };")
    exit(1)

print(f"GAME_ART spans lines {start} to {end}")

# Extract block lines
block_lines = lines[start:end+1]
block = ''.join(block_lines)
print(f"Block length {len(block)}")

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

# Generate replacements
replacements = {}
for base, png in base_items.items():
    # item- prefix
    replacements[f'item-{base}'] = png
    # ITEM- prefix uppercase
    replacements[f'ITEM-{base.upper().replace("-", "-")}'] = png
    # plain base
    replacements[base] = png
    # uppercase plain
    replacements[base.upper()] = png
    # underscore variant
    replacements[base.replace('-', '_')] = png
    # scene- prefix
    replacements[f'scene-{base}'] = png
    # SCENE- prefix uppercase
    replacements[f'SCENE-{base.upper().replace("-", "-")}'] = png
    # item_ underscore prefix
    replacements[f'item_{base.replace("-", "_")}'] = png
    # ITEM_ underscore uppercase
    replacements[f'ITEM_{base.upper().replace("-", "_")}'] = png

# For each key, replace SVG strings within the block
new_block = block
for key, png in replacements.items():
    # Pattern: "key": "<svg ...>"
    # Match across lines up to closing </svg>"
    pattern = r'(\"' + re.escape(key) + r'\"\s*:\s*\")(<svg.*?</svg>)(\")'
    def replace_func(m):
        return m.group(1) + png + m.group(3)
    new_block = re.sub(pattern, replace_func, new_block, flags=re.DOTALL)
    print(f'Processed {key}')

# Replace block in lines
new_lines = lines[:start] + [new_block] + lines[end+1:]

# Write back
with open('game.html', 'w') as f:
    f.writelines(new_lines)
print('Done')