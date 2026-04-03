const fs = require('fs');
const path = require('path');

// Read template
const templatePath = '/home/node/.openclaw/workspace/games/GAME-TEMPLATE.html';
let html = fs.readFileSync(templatePath, 'utf-8');

// Replace placeholders
html = html.replace('{{GAME_TITLE}}', 'The Clockmaker\'s Folly');
html = html.replace('{{GAME_NUMBER}}', '16');
html = html.replace('{{GAME_TITLE_UPPER}}', 'THE CLOCKMAKER\'S FOLLY');
html = html.replace('{{FIRST_SCENE_NAME}}', 'The Foyer');

// Read game-logic.js
const logicPath = './game-logic.js';
const logicContent = fs.readFileSync(logicPath, 'utf-8');

// Build GAME_ART mapping
const artDir = './art';
const mapping = {};

// Scene SVGs
const sceneFiles = [
  'scene-foyer.svg',
  'scene-workshop.svg',
  'scene-library.svg',
  'scene-bedroom.svg',
  'scene-observatory.svg',
  'scene-heart.svg'
];
sceneFiles.forEach(file => {
  const key = file.replace('.svg', '');
  mapping[key] = fs.readFileSync(path.join(artDir, file), 'utf-8');
});

// Item SVGs
const itemFiles = [
  { file: 'item-key.svg', key: 'ITEM_KEY' },
  { file: 'item-gear.svg', key: 'ITEM_GEAR' },
  { file: 'item-journal.svg', key: 'ITEM_JOURNAL' },
  { file: 'item-crystal.svg', key: 'ITEM_CRYSTAL' },
  { file: 'item-winding-key.svg', key: 'ITEM_WINDING_KEY' }
];
itemFiles.forEach(({ file, key }) => {
  mapping[key] = fs.readFileSync(path.join(artDir, file), 'utf-8');
});

// Generate GAME_ART JS code
let gameArtJs = 'window.GAME_ART = {\n';
for (const [key, value] of Object.entries(mapping)) {
  gameArtJs += `  "${key}": ${JSON.stringify(value)},\n`;
}
gameArtJs += '};\n';

// Replace the three placeholders in template
// The template has three sections: GAME_DATA, GAME_ART, GAME ENGINE
// We need to replace each.

// Replace GAME_DATA placeholder
const gameDataMarker = 'const GAME_DATA = { /* ... */ };';
const gameDataJs = logicContent.substring(0, logicContent.indexOf('// ---- Game State ----')).trim();
html = html.replace(gameDataMarker, gameDataJs);

// Replace GAME_ART placeholder
const gameArtMarker = 'window.GAME_ART = { /* ... */ };';
html = html.replace(gameArtMarker, gameArtJs);

// Replace GAME ENGINE placeholder (the rest of game-logic.js after GAME_DATA)
const engineMarker = '/* ... */';
const engineJs = logicContent.substring(logicContent.indexOf('// ---- Game State ----')).trim();
html = html.replace(engineMarker, engineJs);

// Write final game.html
fs.writeFileSync('./game.html', html);
console.log('game.html written successfully');
