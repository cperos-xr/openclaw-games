const fs = require('fs');
const path = require('path');
const artDir = 'art';
const files = fs.readdirSync(artDir).filter(f => f.startsWith('scene-') && f.endsWith('.svg'));
const mapping = {};
files.forEach(file => {
    const sceneId = file.replace('.svg', '');
    const content = fs.readFileSync(path.join(artDir, file), 'utf8');
    // ensure SVG is trimmed
    mapping[sceneId] = content.trim();
});
// Also include item SVGs? Not needed for window.GAME_ART.
console.log('window.GAME_ART = ' + JSON.stringify(mapping, null, 2) + ';');
