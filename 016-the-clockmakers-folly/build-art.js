const fs = require('fs');
const path = require('path');

const artDir = path.join(__dirname, 'art');
const svgFiles = fs.readdirSync(artDir).filter(f => f.endsWith('.svg'));

const art = {};
for (const file of svgFiles) {
    const key = file.replace('.svg', '');
    const content = fs.readFileSync(path.join(artDir, file), 'utf8');
    // Escape backslashes, quotes, newlines for JS string literal
    // Use JSON.stringify to produce a valid JS string
    art[key] = JSON.stringify(content);
}

// Output as JavaScript assignment
console.log('window.GAME_ART = {');
for (const [key, value] of Object.entries(art)) {
    console.log(`  "${key}": ${value},`);
}
console.log('};');