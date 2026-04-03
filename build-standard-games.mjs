import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  formatValidationText,
  normalizeLayout,
  readPublishedGameConfigs,
  validateGameData
} from './standard-game-validation.mjs';

const gamesPath = path.dirname(fileURLToPath(import.meta.url));

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function zeroPadGameNumber(value) {
  const numeric = String(value || '').replace(/\D+/g, '');
  return numeric.padStart(3, '0');
}

function toInlineJson(value) {
  return JSON.stringify(value, null, 2).replace(/<\/script/gi, '<\\/script');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function addArtVariant(artMap, key, value) {
  if (!key || Object.prototype.hasOwnProperty.call(artMap, key)) {
    return;
  }

  artMap[key] = value;
}

function buildArtMap(gameDirPath) {
  const artDir = path.join(gameDirPath, 'art');
  const artMap = {};

  if (!fs.existsSync(artDir)) {
    return artMap;
  }

  const files = fs.readdirSync(artDir).filter((fileName) => /\.(svg|png|jpg|jpeg|gif|webp)$/i.test(fileName));
  files.sort();

  files.forEach((fileName) => {
    const extension = path.extname(fileName).toLowerCase();
    const stem = path.basename(fileName, extension);
    const filePath = path.join(artDir, fileName);
    const html = extension === '.svg'
      ? readText(filePath)
      : `<img src="art/${escapeHtml(fileName)}" alt="${escapeHtml(stem)}" loading="lazy">`;

    const stripped = stem.replace(/^(scene|item)-/i, '');
    const dash = stem.replace(/_/g, '-');
    const underscore = stem.replace(/-/g, '_');

    [
      stem,
      stem.toLowerCase(),
      stem.toUpperCase(),
      stripped,
      stripped.toLowerCase(),
      stripped.toUpperCase(),
      dash,
      dash.toLowerCase(),
      underscore,
      underscore.toLowerCase(),
      `scene-${stripped}`,
      `scene-${stripped}`.toLowerCase(),
      `item-${stripped}`,
      `item-${stripped}`.toLowerCase()
    ].forEach((key) => addArtVariant(artMap, key, html));
  });

  return artMap;
}

function buildGameHtml({ gameDirName, gameData, gameArt }) {
  const title = gameData.title || gameDirName;
  const gameNumber = zeroPadGameNumber(gameData.number || gameDirName);
  const firstSceneName = (gameData.scenes && gameData.scenes[0] && gameData.scenes[0].name) || 'Loading';
  const layout = normalizeLayout(gameData.layout);
  const bodyClass = layout === 'vertical-carnival' ? 'openclaw-game layout-vertical-carnival' : 'openclaw-game layout-standard';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} | Game #${gameNumber}</title>
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../standard-game-style.css">
</head>
<body class="${bodyClass}" data-layout="${escapeHtml(layout)}">
  <header>
    <h1>${escapeHtml(String(title).toUpperCase())}</h1>
    <div class="subtitle">OpenClaw Adventures - Game #${gameNumber}</div>
  </header>

  <div id="scene-name">${escapeHtml(String(firstSceneName).toUpperCase())}</div>

  <div class="game-container">
    <div class="art-panel">
      <div id="art-display">
        <span class="no-art">[ART LOADING]</span>
      </div>
    </div>

    <div class="text-panel">
      <div id="text-display"></div>

      <div id="command-status" class="status-line"></div>

      <div class="command-bar">
        <button class="cmd-btn active" data-cmd="look">LOOK</button>
        <button class="cmd-btn" data-cmd="take">TAKE</button>
        <button class="cmd-btn" data-cmd="use">USE</button>
        <button class="cmd-btn" data-cmd="examine">EXAMINE</button>
      </div>

      <div class="subpanel targets-panel">
        <h3>TARGETS</h3>
        <div id="targets-bar"></div>
      </div>

      <div class="subpanel inventory-panel">
        <h3>INVENTORY</h3>
        <div id="inventory-bar">
          <span class="empty-state">(empty)</span>
        </div>
      </div>

      <div class="subpanel exits-panel">
        <h3>EXITS</h3>
        <div id="exits-bar"></div>
      </div>

      <div class="utility-bar">
        <button id="hint-toggle" class="utility-btn">HINTS: OFF</button>
        <button id="reset-game" class="utility-btn">RESET</button>
      </div>
    </div>
  </div>

  <footer>
    OpenClaw Point and Click Studio | LOOK - TAKE - USE - EXAMINE | Click exits to move
  </footer>

  <script>
window.GAME_DATA = ${toInlineJson(gameData)};
window.GAME_ART = ${toInlineJson(gameArt)};
  </script>
  <script src="../standard-game-runtime.js"></script>
</body>
</html>
`;
}

function main() {
  const validateOnly = process.argv.includes('--validate-only');
  const gameConfigs = readPublishedGameConfigs(gamesPath);
  const validationResults = gameConfigs.map(({ gameDirName, gameData }) => validateGameData(gameData, gameDirName));
  const failing = validationResults.filter((result) => result.errors.length > 0);

  if (gameConfigs.length === 0) {
    throw new Error('No game directories found in games/index.html');
  }

  if (failing.length > 0) {
    throw new Error(`Game validation failed before generation.\n\n${formatValidationText(validationResults)}`);
  }

  if (validateOnly) {
    console.log(formatValidationText(validationResults));
    return;
  }

  const updated = [];

  gameConfigs.forEach(({ gameDirName, gameDirPath, scriptPath, gameData }) => {
    const outputPath = path.join(gameDirPath, 'game.html');

    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Missing game-script.json for ${gameDirName}`);
    }

    const gameArt = buildArtMap(gameDirPath);
    const gameHtml = buildGameHtml({ gameDirName, gameData, gameArt });

    fs.writeFileSync(outputPath, gameHtml, 'utf8');
    updated.push(outputPath);
  });

  console.log(`Standardized ${updated.length} games.`);
  updated.forEach((filePath) => console.log(` - ${filePath}`));
}

main();