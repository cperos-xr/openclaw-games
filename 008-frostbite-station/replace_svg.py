#!/usr/bin/env python3
import re
import sys

with open('game.html', 'r') as f:
    lines = f.readlines()

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

# Generate all key variations for each base item
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
    # scene- prefix (maybe used as scene items)
    replacements[f'scene-{base}'] = png
    # SCENE- prefix uppercase
    replacements[f'SCENE-{base.upper().replace("-", "-")}'] = png

print(f'Will replace {len(replacements)} keys')

# Process lines
i = 0
new_lines = []
while i < len(lines):
    line = lines[i]
    # Check if line contains a key we want to replace
    matched = False
    for key, png in replacements.items():
        pattern = f'"{key}": "'
        if pattern in line:
            # This line starts the SVG value
            # Find the closing quote of the value (may span multiple lines)
            # We need to find the matching closing quote that ends the SVG string
            # SVG strings are multiline, but we can assume they end with </svg>",
            # Let's gather lines until we see "</svg>",
            start_line = i
            content_lines = [line]
            j = i
            while j < len(lines) and '</svg>' not in lines[j]:
                j += 1
                if j < len(lines):
                    content_lines.append(lines[j])
                else:
                    break
            # Now j points to line containing </svg>
            if j < len(lines):
                content_lines.append(lines[j])
                # Replace the whole block
                # Keep indentation from first line
                indent = line[:line.find('"')]
                new_line = f'{indent}"{key}": "{png}",\n'
                # Replace the block with new_line
                new_lines.append(new_line)
                i = j + 1
                matched = True
                print(f'Replaced {key}')
                break
    if not matched:
        new_lines.append(line)
        i += 1

# Write back
with open('game.html', 'w') as f:
    f.writelines(new_lines)
print('Done')