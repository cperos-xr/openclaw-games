const fs = require('fs');
const path = require('path');

const gameDir = __dirname;
const templatePath = path.join(gameDir, '../../games/GAME-TEMPLATE.html');
const logicPath = path.join(gameDir, 'game-logic.js');
const artDir = path.join(gameDir, 'art');

// Read template
let template = fs.readFileSync(templatePath, 'utf8');

// Read game logic
let logic = fs.readFileSync(logicPath, 'utf8');

// Build GAME_ART from SVGs
const svgFiles = fs.readdirSync(artDir).filter(f => f.endsWith('.svg'));
const art = {};
for (const file of svgFiles) {
    const key = file.replace('.svg', '');
    const content = fs.readFileSync(path.join(artDir, file), 'utf8');
    art[key] = JSON.stringify(content);
}
const artLines = ['window.GAME_ART = {'];
for (const [key, value] of Object.entries(art)) {
    artLines.push(`  "${key}": ${value},`);
}
artLines.push('};');
const artBlock = artLines.join('\n');

// Replace placeholders
template = template.replace('{{GAME_TITLE}}', "The Clockmaker's Folly");
template = template.replace('{{GAME_NUMBER}}', '016');
template = template.replace('{{GAME_TITLE_UPPER}}', "THE CLOCKMAKER'S FOLLY");
template = template.replace('{{FIRST_SCENE_NAME}}', 'The Foyer');

// Replace script sections
// Find the script block between // ============================================================
// We'll do simple string replacement
const startMarker = '// ============================================================\n// GAME DATA — replace with assembled content from game-script.json\n// ============================================================';
const endMarker = '// ============================================================\n// GAME ENGINE — paste game-logic.js content here\n// ============================================================\n/* ... */';

// We'll replace from startMarker to endMarker inclusive with our new content
const newScriptSection = `// ============================================================
// GAME ART — replace with inlined SVGs from art/*.svg
// ============================================================
${artBlock}

// ============================================================
// GAME ENGINE — paste game-logic.js content here
// ============================================================
${logic}`;

// Since the template has three sections, we need to replace the whole block from the first GAME DATA comment to the end of the script tag? Simpler: replace everything between the script opening tag and closing tag.
const scriptStart = template.indexOf('<script>');
const scriptEnd = template.indexOf('</script>', scriptStart) + '</script>'.length;
const beforeScript = template.substring(0, scriptStart);
const afterScript = template.substring(scriptEnd);

const newScript = `<script>
// ============================================================
// GAME ART — replace with inlined SVGs from art/*.svg
// ============================================================
${artBlock}

// ============================================================
// GAME ENGINE — paste game-logic.js content here
// ============================================================
${logic}
</script>`;

const final = beforeScript + newScript + afterScript;

// Write to game.html
const outputPath = path.join(gameDir, 'game.html');
fs.writeFileSync(outputPath, final);
console.log('Generated game.html at', outputPath);