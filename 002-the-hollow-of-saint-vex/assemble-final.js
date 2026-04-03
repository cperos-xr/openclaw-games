const fs = require('fs');
const path = require('path');

const template = fs.readFileSync('/home/node/.openclaw/workspace/games/GAME-TEMPLATE.html', 'utf8');

const gameScript = JSON.parse(fs.readFileSync('game-script.json', 'utf8'));
const gameLogic = fs.readFileSync('game-logic.js', 'utf8');

// Generate GAME_ART mapping
const artDir = 'art';
const artFiles = fs.readdirSync(artDir).filter(f => f.startsWith('scene-') && f.endsWith('.svg'));
const gameArt = {};
artFiles.forEach(file => {
    const sceneId = file.replace('.svg', '');
    const content = fs.readFileSync(path.join(artDir, file), 'utf8').trim();
    gameArt[sceneId] = content;
});

const replacements = {
    '{{GAME_TITLE}}': gameScript.title,
    '{{GAME_NUMBER}}': gameScript.number,
    '{{GAME_TITLE_UPPER}}': gameScript.title.toUpperCase(),
    '{{FIRST_SCENE_NAME}}': gameScript.scenes[0].name,
    '// ============================================================\n// GAME DATA — replace with assembled content from game-script.json\n// ============================================================\nconst GAME_DATA = { /* ... */ };': `// ============================================================\n// GAME DATA\n// ============================================================\nconst GAME_DATA = ${JSON.stringify(gameScript, null, 2)};`,
    '// ============================================================\n// GAME ART — replace with inlined SVGs from art/*.svg\n// ============================================================\nwindow.GAME_ART = { /* ... */ };': `// ============================================================\n// GAME ART\n// ============================================================\nwindow.GAME_ART = ${JSON.stringify(gameArt, null, 2)};`,
    '// ============================================================\n// GAME ENGINE — paste game-logic.js content here\n// ============================================================\n/* ... */': `// ============================================================\n// GAME ENGINE\n// ============================================================\n${gameLogic}`
};

let output = template;
for (const [key, value] of Object.entries(replacements)) {
    output = output.replace(key, value);
}

fs.writeFileSync('game.html', output);
console.log('Generated game.html');
