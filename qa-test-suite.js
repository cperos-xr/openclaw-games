#!/usr/bin/env node
/**
 * OpenClaw Point & Click Studio — Automated QA Test Suite
 * Usage: node qa-test-suite.js <path-to-game.html>
 *
 * Runs comprehensive functional tests on a game HTML file.
 * Outputs a JSON report to stdout and writes qa-report.json alongside the game.
 */

const fs = require('fs');
const path = require('path');

const gameFile = process.argv[2];
if (!gameFile) {
  console.error('Usage: node qa-test-suite.js <path-to-game.html>');
  process.exit(1);
}

const html = fs.readFileSync(gameFile, 'utf8');
const gameDir = path.dirname(gameFile);

const report = {
  game: path.basename(gameDir),
  file: gameFile,
  timestamp: new Date().toISOString(),
  verdict: 'PASS',
  issues: [],
  passedChecks: [],
  stats: {}
};

function fail(severity, category, description, location, expected, actual, suggestedFix, assignTo) {
  report.issues.push({
    id: `BUG-${String(report.issues.length + 1).padStart(3, '0')}`,
    severity, category, description, location, expected, actual, suggestedFix, assignTo
  });
  if (severity === 'CRITICAL' || severity === 'HIGH') report.verdict = 'FAIL';
}

function pass(check) { report.passedChecks.push(check); }

// ── Extract GAME_DATA from HTML or external game-logic.js ────────────

let GAME_DATA = null;

// Combine HTML + external game-logic.js for searching
let allCode = html;
const externalLogicPath = path.join(gameDir, 'game-logic.js');
try {
  const externalLogic = fs.readFileSync(externalLogicPath, 'utf8');
  allCode += '\n' + externalLogic;
} catch(e) { /* no external file — GAME_DATA is inline */ }

// Also try game-script.json directly (most reliable source)
const scriptJsonPath = path.join(gameDir, 'game-script.json');
try {
  GAME_DATA = JSON.parse(fs.readFileSync(scriptJsonPath, 'utf8'));
} catch(e) { /* no game-script.json, try extracting from code */ }

if (!GAME_DATA) {
  // Try regex patterns on combined code
  const patterns = [
    /(?:const|let|var|window\.)\s*GAME_DATA\s*=\s*(\{[\s\S]*?\});?\s*\n\s*(?:\/\/|const|let|var|window\.|function|$)/,
    /GAME_DATA\s*=\s*(\{[\s\S]*?\});\s*\n/,
  ];

  for (const pat of patterns) {
    const m = allCode.match(pat);
    if (m) {
      try {
        GAME_DATA = JSON.parse(m[1]);
        break;
      } catch (e) { /* try next pattern */ }
    }
  }
}

// Fallback: manual bracket matching from first GAME_DATA assignment
if (!GAME_DATA) {
  const startIdx = allCode.indexOf('GAME_DATA');
  if (startIdx !== -1) {
    const braceStart = allCode.indexOf('{', startIdx);
    if (braceStart !== -1) {
      let depth = 0;
      let end = braceStart;
      for (let i = braceStart; i < allCode.length; i++) {
        if (allCode[i] === '{') depth++;
        else if (allCode[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
      }
      try {
        GAME_DATA = JSON.parse(allCode.substring(braceStart, end + 1));
      } catch (e) {
        fail('CRITICAL', 'data', 'GAME_DATA is not valid JSON', 'game.html', 'Valid JSON', e.message, 'Fix JSON syntax in GAME_DATA', 'game-assembler');
      }
    }
  }
}

if (!GAME_DATA) {
  fail('CRITICAL', 'data', 'GAME_DATA not found in HTML or game-logic.js or game-script.json', 'game.html', 'GAME_DATA variable', 'Not found', 'Ensure GAME_DATA is defined in the script section', 'game-assembler');
  outputReport();
  process.exit(1);
}

pass('GAME_DATA extracted and parsed');

// ── A. Data Integrity ────────────────────────────────────────────────

const requiredFields = ['title', 'slug', 'scenes', 'items', 'puzzles', 'winCondition'];
for (const field of requiredFields) {
  if (!GAME_DATA[field]) {
    fail('CRITICAL', 'data', `Missing required field: ${field}`, 'GAME_DATA', `${field} present`, 'undefined', `Add ${field} to GAME_DATA`, 'brian-shakespeare');
  }
}

const scenes = GAME_DATA.scenes || [];
const items = GAME_DATA.items || [];
const puzzles = GAME_DATA.puzzles || [];
const winCondition = GAME_DATA.winCondition || {};

report.stats.scenes = scenes.length;
report.stats.items = items.length;
report.stats.puzzles = puzzles.length;

if (scenes.length < 5) {
  fail('HIGH', 'data', `Only ${scenes.length} scenes (minimum 5)`, 'GAME_DATA.scenes', '>= 5 scenes', `${scenes.length}`, 'Add more scenes', 'brian-shakespeare');
}

if (puzzles.length !== 5) {
  fail('MEDIUM', 'data', `${puzzles.length} puzzles (studio rule: exactly 5)`, 'GAME_DATA.puzzles', '5 puzzles', `${puzzles.length}`, 'Adjust puzzle count to 5', 'brian-shakespeare');
}

for (const item of items) {
  if (!item.foundIn) fail('HIGH', 'data', `Item "${item.id}" missing foundIn`, `items.${item.id}`, 'foundIn set', 'undefined', 'Set foundIn scene', 'brian-shakespeare');
  if (!item.usedIn && !item.usedOn) fail('MEDIUM', 'data', `Item "${item.id}" has no usedIn or usedOn`, `items.${item.id}`, 'usedIn or usedOn set', 'undefined', 'Set usage target', 'brian-shakespeare');
}

for (const scene of scenes) {
  if (!scene.id) fail('HIGH', 'data', `Scene missing id`, 'GAME_DATA.scenes', 'id present', 'undefined', 'Add scene id', 'brian-shakespeare');
  if (!scene.name) fail('MEDIUM', 'data', `Scene ${scene.id} missing name`, `scenes.${scene.id}`, 'name present', 'undefined', 'Add scene name', 'brian-shakespeare');
  if (!scene.prose) fail('HIGH', 'data', `Scene ${scene.id} missing prose`, `scenes.${scene.id}`, 'prose present', 'undefined', 'Add scene prose text', 'brian-shakespeare');
  if (!scene.exits || Object.keys(scene.exits).length === 0) {
    // Only warn if not the win scene
    if (scene.id !== winCondition.scene) {
      fail('MEDIUM', 'data', `Scene ${scene.id} has no exits and is not the win scene`, `scenes.${scene.id}`, 'At least one exit', 'No exits', 'Add exits or mark as win scene', 'brian-shakespeare');
    }
  }
}

pass('Data integrity checks complete');

// ── B. Scene Graph Reachability ──────────────────────────────────────

const sceneMap = {};
scenes.forEach(s => sceneMap[s.id] = s);
const firstScene = scenes[0];

if (!firstScene) {
  fail('CRITICAL', 'scene-graph', 'No scenes defined', 'GAME_DATA.scenes', 'At least one scene', '0 scenes', 'Define scenes', 'brian-shakespeare');
} else {
  // BFS from first scene
  const visited = new Set();
  const queue = [firstScene.id];
  visited.add(firstScene.id);

  while (queue.length > 0) {
    const current = queue.shift();
    const scene = sceneMap[current];
    if (!scene || !scene.exits) continue;

    // Also check exits unlocked by puzzles
    for (const [dir, target] of Object.entries(scene.exits)) {
      if (!visited.has(target)) {
        visited.add(target);
        queue.push(target);
      }
    }
  }

  // Also add scenes revealed by puzzles
  for (const puzzle of puzzles) {
    if (puzzle.reveals) {
      for (const revealed of puzzle.reveals) {
        if (sceneMap[revealed]) visited.add(revealed);
      }
    }
  }

  report.stats.reachableScenes = visited.size;

  const unreachable = scenes.filter(s => !visited.has(s.id));
  if (unreachable.length > 0) {
    fail('CRITICAL', 'scene-graph', `Unreachable scenes: ${unreachable.map(s => s.id).join(', ')}`, 'scene-graph', 'All scenes reachable', `${unreachable.length} unreachable`, 'Add exits or puzzle reveals connecting to these scenes', 'brian-shakespeare');
  } else {
    pass('All scenes reachable from start');
  }
}

// ── C. Item Availability ─────────────────────────────────────────────

const sceneOrder = []; // BFS order for checking item availability
{
  const visited = new Set();
  const queue = [scenes[0]?.id];
  if (queue[0]) visited.add(queue[0]);
  while (queue.length > 0) {
    const current = queue.shift();
    sceneOrder.push(current);
    const scene = sceneMap[current];
    if (!scene?.exits) continue;
    for (const target of Object.values(scene.exits)) {
      if (!visited.has(target)) {
        visited.add(target);
        queue.push(target);
      }
    }
  }
}

for (const item of items) {
  const foundIdx = sceneOrder.indexOf(item.foundIn);
  const usedIdx = sceneOrder.indexOf(item.usedIn);

  if (foundIdx === -1) {
    fail('HIGH', 'puzzle-logic', `Item "${item.id}" foundIn scene "${item.foundIn}" not in reachable scenes`, `items.${item.id}`, 'foundIn scene reachable', 'Not reachable', 'Fix foundIn to a reachable scene', 'brian-shakespeare');
  }

  // Note: usedIn check is informational — items might be usable without strict ordering
  if (foundIdx !== -1 && usedIdx !== -1 && foundIdx > usedIdx) {
    fail('MEDIUM', 'puzzle-logic', `Item "${item.id}" found (scene index ${foundIdx}) AFTER it's used (scene index ${usedIdx}) in BFS order`, `items.${item.id}`, 'Found before used', 'Found after', 'Ensure player can reach foundIn scene before usedIn scene', 'brian-shakespeare');
  }
}

// Check for orphan items (defined but never referenced by any puzzle)
const puzzleRequiredItems = new Set();
puzzles.forEach(p => (p.requires || []).forEach(r => puzzleRequiredItems.add(r)));
if (winCondition.requires) winCondition.requires.forEach(r => puzzleRequiredItems.add(r));

for (const item of items) {
  if (!puzzleRequiredItems.has(item.id)) {
    fail('LOW', 'puzzle-logic', `Item "${item.id}" is never required by any puzzle or win condition`, `items.${item.id}`, 'Item used somewhere', 'Orphan item', 'Remove item or add a puzzle that uses it', 'brian-shakespeare');
  }
}

pass('Item availability checks complete');

// ── D. Puzzle Dependency Graph ───────────────────────────────────────

const puzzleMap = {};
puzzles.forEach(p => puzzleMap[p.id] = p);

// Build item → revealing puzzle map
const itemRevealedBy = {};
for (const puzzle of puzzles) {
  if (puzzle.reveals) {
    for (const revealed of puzzle.reveals) {
      // Check if revealed is an item
      if (items.find(i => i.id === revealed)) {
        itemRevealedBy[revealed] = puzzle.id;
      }
    }
  }
}

// Build puzzle dependency edges
const puzzleDeps = {};
for (const puzzle of puzzles) {
  puzzleDeps[puzzle.id] = [];
  for (const req of (puzzle.requires || [])) {
    if (itemRevealedBy[req]) {
      puzzleDeps[puzzle.id].push(itemRevealedBy[req]);
    }
  }
}

// Topological sort to detect cycles
const topoVisited = new Set();
const topoStack = new Set();
let hasCycle = false;

function topoSort(id) {
  if (topoStack.has(id)) { hasCycle = true; return; }
  if (topoVisited.has(id)) return;
  topoStack.add(id);
  for (const dep of (puzzleDeps[id] || [])) {
    topoSort(dep);
  }
  topoStack.delete(id);
  topoVisited.add(id);
}

for (const puzzle of puzzles) topoSort(puzzle.id);

if (hasCycle) {
  fail('CRITICAL', 'puzzle-logic', 'Circular puzzle dependency detected — game is unsolvable', 'puzzles', 'No circular deps', 'Cycle found', 'Remove circular item/puzzle dependencies', 'brian-shakespeare');
} else {
  pass('Puzzle dependency graph is acyclic (no circular dependencies)');
}

report.stats.solvablePuzzles = hasCycle ? 0 : puzzles.length;

// ── E. Exit Lock Verification ────────────────────────────────────────

const gameLogicPath = path.join(gameDir, 'game-logic.js');
let gameLogic = '';
try { gameLogic = fs.readFileSync(gameLogicPath, 'utf8'); } catch(e) { /* embedded in HTML */ }

// Also check inline script in HTML
const fullCode = gameLogic + '\n' + html;

for (const puzzle of puzzles) {
  if (puzzle.blocksExit) {
    const hasCanExit = fullCode.includes('canExit') || fullCode.includes('blocksExit') || fullCode.includes(puzzle.id);
    if (!hasCanExit) {
      fail('CRITICAL', 'puzzle-logic', `Puzzle "${puzzle.id}" has blocksExit but no canExit check found in code`, `puzzles.${puzzle.id}`, 'canExit function checks this puzzle', 'Not found', 'Add canExit check for this puzzle in game-logic.js', 'gameplay-coder');
    }
  }
}

pass('Exit lock verification complete');

// ── F. Win Condition Verification ────────────────────────────────────

if (!winCondition.scene) {
  fail('CRITICAL', 'puzzle-logic', 'No win condition scene specified', 'GAME_DATA.winCondition', 'scene set', 'undefined', 'Add winCondition.scene', 'brian-shakespeare');
} else if (!sceneMap[winCondition.scene]) {
  fail('CRITICAL', 'puzzle-logic', `Win condition scene "${winCondition.scene}" does not exist`, 'winCondition.scene', 'Valid scene', 'Not found', 'Fix winCondition.scene to match an actual scene id', 'brian-shakespeare');
} else {
  pass('Win condition scene exists');
}

if (winCondition.requires) {
  for (const req of winCondition.requires) {
    if (!items.find(i => i.id === req)) {
      fail('HIGH', 'puzzle-logic', `Win condition requires item "${req}" which doesn't exist`, 'winCondition.requires', 'Valid item', 'Not found', 'Fix item id or add the item', 'brian-shakespeare');
    }
  }
}

pass('Win condition checks complete');

// ── G. HTML/CSS/JS Integrity ─────────────────────────────────────────

// Check GAME_ART declaration
if (html.includes('const GAME_ART') || html.includes('let GAME_ART')) {
  fail('CRITICAL', 'code', 'GAME_ART declared with const/let — will not be globally accessible', 'game.html', 'var GAME_ART or window.GAME_ART', 'const/let', 'Change to var GAME_ART or window.GAME_ART', 'game-assembler');
} else if (html.includes('GAME_ART')) {
  pass('GAME_ART uses correct variable declaration');
}

// Check CSS animations
const requiredAnimations = ['puzzle-solved', 'unlockPulse', 'itemGlow'];
for (const anim of requiredAnimations) {
  if (!html.includes(anim)) {
    fail('MEDIUM', 'code', `Missing CSS animation: ${anim}`, 'game.html <style>', `@keyframes ${anim}`, 'Not found', `Add @keyframes ${anim} to CSS`, 'game-assembler');
  }
}

// Check art files exist
const artDir = path.join(gameDir, 'art');
let artFiles = [];
try { artFiles = fs.readdirSync(artDir); } catch(e) { /* no art dir */ }

const sceneArtCount = artFiles.filter(f => f.startsWith('scene-')).length;
const itemArtCount = artFiles.filter(f => f.startsWith('item-')).length;
const itemPngFiles = artFiles.filter(f => f.startsWith('item-') && f.endsWith('.png'));

report.stats.artAssetsFound = artFiles.length;
report.stats.artAssetsMissing = 0;

if (itemPngFiles.length > 0) {
  fail(
    'HIGH',
    'art',
    `PNG item art found: ${itemPngFiles.join(', ')}`,
    artDir,
    'Item/tool inventory art must be SVG only',
    itemPngFiles.join(', '),
    'Remove item PNGs and keep inventory assets as item-*.svg until PNG inventory support exists',
    'devstral-art-coder'
  );
}

for (const scene of scenes) {
  const expectedFiles = [
    `scene-${scene.id}.svg`, `scene-${scene.id}.png`,
    `scene-${scene.id.replace('scene-', '')}.svg`, `scene-${scene.id.replace('scene-', '')}.png`
  ];
  // Also check numeric patterns
  const sceneNum = scene.id.replace(/\D/g, '');
  if (sceneNum) {
    expectedFiles.push(`scene-${sceneNum}-${scene.name?.toLowerCase().replace(/\s+/g, '-')}.svg`);
    expectedFiles.push(`scene-${sceneNum}-${scene.name?.toLowerCase().replace(/\s+/g, '-')}.png`);
  }

  const found = expectedFiles.some(f => artFiles.includes(f));
  // Don't fail hard — art naming varies. Check if GAME_ART references it instead.
  if (!found && artFiles.length > 0) {
    // Only warn, as naming conventions vary
    // fail('LOW', 'art', `No obvious art file for scene "${scene.id}"`, 'art/', expectedFiles.join(' or '), 'None matched', 'Verify art file naming matches scene id', 'devstral-art-coder');
  }
}

// Check for symlinks in art directory
if (artFiles.length > 0) {
  for (const artFile of artFiles) {
    const artPath = path.join(artDir, artFile);
    try {
      const stat = fs.lstatSync(artPath);
      if (stat.isSymbolicLink()) {
        fail('CRITICAL', 'art', `Art file "${artFile}" is a symlink — GitHub Pages will 404`, artPath, 'Real file', 'Symlink', 'cp the real file instead of ln -s', 'game-assembler');
        report.stats.artAssetsMissing++;
      }
    } catch(e) { /* skip */ }
  }
}

pass('HTML/CSS/JS integrity checks complete');

// ── H. Layout and Responsiveness ─────────────────────────────────────

if (!html.includes('max-width')) {
  fail('HIGH', 'layout', 'No max-width set — layout will explode on ultrawide monitors', 'game.html CSS', 'max-width: 1200px or similar', 'Not found', 'Add max-width to body or game-container', 'game-assembler');
} else {
  pass('max-width constraint present');
}

if (!html.includes('viewport')) {
  fail('MEDIUM', 'layout', 'No viewport meta tag — mobile rendering will be wrong', 'game.html <head>', '<meta name="viewport">', 'Not found', 'Add viewport meta tag', 'game-assembler');
} else {
  pass('Viewport meta tag present');
}

// Check for grid-row overflow
const gridRowMatch = html.match(/grid-template-rows:\s*([^;]+)/);
const gridRowRefs = html.match(/grid-row:\s*(\d+)/g);
if (gridRowMatch && gridRowRefs) {
  const definedRows = gridRowMatch[1].trim().split(/\s+/).length;
  const maxUsedRow = Math.max(...gridRowRefs.map(r => parseInt(r.match(/\d+/)[0])));
  if (maxUsedRow > definedRows) {
    fail('HIGH', 'layout', `grid-row ${maxUsedRow} exceeds grid-template-rows (${definedRows} rows defined)`, 'game.html CSS', `grid-row <= ${definedRows}`, `grid-row: ${maxUsedRow}`, 'Add more rows to grid-template-rows or restructure layout', 'game-assembler');
  } else {
    pass('Grid row values within bounds');
  }
}

// ── I. Word Count ────────────────────────────────────────────────────

for (const scene of scenes) {
  if (scene.prose) {
    const wordCount = scene.prose.split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount < 60) {
      fail('MEDIUM', 'data', `Scene "${scene.id}" prose too short: ${wordCount} words (min 60)`, `scenes.${scene.id}.prose`, '60-400 words', `${wordCount} words`, 'Expand scene prose', 'brian-shakespeare');
    } else if (wordCount > 500) {
      fail('LOW', 'data', `Scene "${scene.id}" prose very long: ${wordCount} words (max recommended 400)`, `scenes.${scene.id}.prose`, '60-400 words', `${wordCount} words`, 'Consider trimming prose', 'brian-shakespeare');
    }
  }

  const lookCount = scene.lookDescriptions ? Object.keys(scene.lookDescriptions).length : 0;
  if (lookCount < 2) {
    fail('LOW', 'data', `Scene "${scene.id}" has only ${lookCount} lookDescriptions (recommend >= 3)`, `scenes.${scene.id}.lookDescriptions`, '>= 3', `${lookCount}`, 'Add more interactive objects', 'brian-shakespeare');
  }
}

pass('Word count checks complete');

// ── J. Exit Symmetry Check ───────────────────────────────────────────

const opposites = { north: 'south', south: 'north', east: 'west', west: 'east', up: 'down', down: 'up' };

for (const scene of scenes) {
  if (!scene.exits) continue;
  for (const [dir, targetId] of Object.entries(scene.exits)) {
    const target = sceneMap[targetId];
    if (!target || !target.exits) continue;
    const opposite = opposites[dir];
    if (opposite && target.exits[opposite] !== scene.id) {
      // Don't fail — just note. Some one-way exits are intentional.
      // fail('LOW', 'scene-graph', `Asymmetric exit: ${scene.id} → ${dir} → ${targetId}, but ${targetId} has no ${opposite} back`, ...);
    }
  }
}

pass('Exit symmetry check complete');

// ── K. Prose-Item Cross Reference ────────────────────────────────────

for (const scene of scenes) {
  if (!scene.prose) continue;
  const proseLower = scene.prose.toLowerCase();
  const sceneItems = (scene.items || []);

  // Check if look descriptions reference things not in prose
  if (scene.lookDescriptions) {
    for (const key of Object.keys(scene.lookDescriptions)) {
      const keyWords = key.toLowerCase().replace(/[-_]/g, ' ');
      if (!proseLower.includes(keyWords) && !proseLower.includes(keyWords.split(' ').pop())) {
        // Soft check — some look targets are implied
      }
    }
  }
}

pass('Prose-item cross reference complete');

// ── L. Art Quality Automated Checks ──────────────────────────────────

if (artFiles.length > 0) {
  for (const artFile of artFiles) {
    if (!artFile.endsWith('.svg')) continue;
    const artPath = path.join(artDir, artFile);
    let svgContent = '';
    try { svgContent = fs.readFileSync(artPath, 'utf8'); } catch(e) { continue; }

    // L1: ViewBox validation
    const viewBoxMatch = svgContent.match(/viewBox\s*=\s*["']([^"']+)["']/);
    if (!viewBoxMatch) {
      fail('HIGH', 'art', `SVG "${artFile}" missing viewBox attribute`, artPath, 'viewBox="0 0 640 400" or "0 0 64 64"', 'No viewBox', 'Add viewBox attribute', 'devstral-art-coder');
    } else {
      const vb = viewBoxMatch[1].trim().split(/\s+/);
      if (vb.length === 4) {
        const w = parseInt(vb[2]), h = parseInt(vb[3]);
        const isScene = artFile.startsWith('scene-');
        const isItem = artFile.startsWith('item-');
        if (isScene && (w !== 640 || h !== 400)) {
          fail('MEDIUM', 'art', `Scene SVG "${artFile}" has viewBox ${w}x${h}, expected 640x400`, artPath, '640 400', `${w} ${h}`, 'Set viewBox="0 0 640 400"', 'devstral-art-coder');
        }
        if (isItem && (w !== 64 || h !== 64)) {
          fail('MEDIUM', 'art', `Item SVG "${artFile}" has viewBox ${w}x${h}, expected 64x64`, artPath, '64 64', `${w} ${h}`, 'Set viewBox="0 0 64 64"', 'devstral-art-coder');
        }
      }
    }

    // L2: File size check
    const fileSizeKB = Buffer.byteLength(svgContent, 'utf8') / 1024;
    const isScene = artFile.startsWith('scene-');
    const maxSizeKB = isScene ? 50 : 10;
    if (fileSizeKB > maxSizeKB) {
      fail('LOW', 'art', `SVG "${artFile}" is ${fileSizeKB.toFixed(1)}KB (max recommended ${maxSizeKB}KB)`, artPath, `< ${maxSizeKB}KB`, `${fileSizeKB.toFixed(1)}KB`, 'Simplify SVG or reduce path complexity', 'devstral-art-coder');
    }

    // L3: Gradient detection (Apple II style prohibition)
    if (svgContent.includes('<linearGradient') || svgContent.includes('<radialGradient') ||
        svgContent.includes('gradient') || svgContent.includes('stop-color')) {
      fail('MEDIUM', 'art', `SVG "${artFile}" contains gradients — breaks Apple II style`, artPath, 'No gradients', 'Gradients found', 'Replace gradients with flat color fills', 'devstral-art-coder');
    }

    // L4: Filter detection (Apple II style prohibition)
    if (svgContent.includes('<filter') || svgContent.includes('feGaussian') ||
        svgContent.includes('feDropShadow') || svgContent.includes('blur')) {
      fail('MEDIUM', 'art', `SVG "${artFile}" contains filters/effects — breaks Apple II style`, artPath, 'No filters', 'Filters found', 'Remove filter elements, use flat geometric shapes', 'devstral-art-coder');
    }

    // L5: Color palette analysis
    const colorMatches = svgContent.match(/(?:fill|stroke|color)\s*[:=]\s*["']?(#[0-9a-fA-F]{3,8}|[a-z]+)["']?/g) || [];
    const uniqueColors = new Set();
    for (const cm of colorMatches) {
      const colorVal = cm.match(/(#[0-9a-fA-F]{3,8}|[a-z]+)/g);
      if (colorVal) colorVal.forEach(c => { if (c.length > 1) uniqueColors.add(c.toLowerCase()); });
    }
    // Filter out common non-color words
    const nonColors = new Set(['none', 'inherit', 'current', 'transparent', 'xmlns', 'http', 'svg', 'viewbox', 'width', 'height', 'style', 'type', 'class', 'id']);
    const actualColors = [...uniqueColors].filter(c => !nonColors.has(c));
    if (actualColors.length > 10) {
      fail('LOW', 'art', `SVG "${artFile}" uses ${actualColors.length} colors (max recommended 8)`, artPath, '<= 8 colors', `${actualColors.length} colors: ${actualColors.slice(0, 10).join(', ')}`, 'Reduce color palette for Apple II aesthetic', 'devstral-art-coder');
    }

    // L6: Stroke width check
    const strokeMatches = svgContent.match(/stroke-width\s*[:=]\s*["']?(\d+(?:\.\d+)?)["']?/g) || [];
    const thinStrokes = strokeMatches.filter(s => {
      const val = parseFloat(s.match(/(\d+(?:\.\d+)?)/)[1]);
      return val < 1.5;
    });
    if (thinStrokes.length > 2) {
      fail('LOW', 'art', `SVG "${artFile}" has ${thinStrokes.length} thin strokes (< 1.5px) — may be invisible at game scale`, artPath, 'stroke-width >= 2', 'Thin strokes found', 'Increase stroke-width to 2-4px', 'devstral-art-coder');
    }
  }

  pass('Art quality automated checks complete');
} else {
  // No art files at all
  fail('HIGH', 'art', 'No art files found in art/ directory', artDir, 'Scene art plus SVG item files', 'Empty directory', 'Generate scene assets and SVG item icons', 'devstral-art-coder');
}

// ── Output Report ────────────────────────────────────────────────────

function outputReport() {
  // Set final verdict
  if (report.issues.some(i => i.severity === 'CRITICAL' || i.severity === 'HIGH')) {
    report.verdict = 'FAIL';
  }

  // Summary line
  const critCount = report.issues.filter(i => i.severity === 'CRITICAL').length;
  const highCount = report.issues.filter(i => i.severity === 'HIGH').length;
  const medCount = report.issues.filter(i => i.severity === 'MEDIUM').length;
  const lowCount = report.issues.filter(i => i.severity === 'LOW').length;

  report.summary = `${report.verdict} — ${report.issues.length} issues (${critCount} CRITICAL, ${highCount} HIGH, ${medCount} MEDIUM, ${lowCount} LOW)`;

  // Write report file
  const reportPath = path.join(gameDir, 'qa-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Print to stdout
  console.log(JSON.stringify(report, null, 2));
}

outputReport();
process.exit(report.verdict === 'FAIL' ? 1 : 0);
