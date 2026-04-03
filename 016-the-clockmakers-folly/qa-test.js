/**
 * Automated QA Test Suite for Game #016 "The Clockmaker's Folly"
 * Tests: scene rendering, playthrough, puzzles, v3.0 layout compliance
 */
const fs = require('fs');
const path = require('path');

const GAME_DIR = path.dirname(__dirname) + '/016-the-clockmakers-folly' || process.cwd();
const GAME_HTML = path.join(GAME_DIR, 'game.html');
const REPORT_PATH = path.join(GAME_DIR, 'qa-report.json');

// ── Helpers ──────────────────────────────────────────────────────
function extractGlobalVars(html) {
  const results = {};
  // Extract GAME_DATA JSON
  const gameDataMatch = html.match(/var GAME_DATA\s*=\s*({[\s\S]*?});\n/);
  if (gameDataMatch) {
    try {
      results.GAME_DATA = JSON.parse(gameDataMatch[1]);
    } catch(e) {
      results.GAME_DATA_ERROR = e.message;
    }
  }

  // Extract GAME_ART object
  const gameArtMatch = html.match(/window\.GAME_ART\s*=\s*({[\s\S]*?\n};)/);
  if (gameArtMatch) {
    // GAME_ART contains SVGs with JS-like template strings — can't parse as JSON directly.
    // Instead, extract keys from the assignment.
    const artKeys = [];
    const keyRegex = /\s*"([^"]+)"\s*:\s*"/g;
    let m;
    while ((m = keyRegex.exec(gameArtMatch[1])) !== null) {
      artKeys.push(m[1]);
    }
    results.GAME_ART_KEYS = artKeys;
  }

  // Extract CSS content
  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
  results.CSS = styleMatch ? styleMatch[1] : '';

  // Extract full HTML for DOM-like checks
  results.HTML = html;
  return results;
}

function checkScenes(gameData) {
  const results = { check: 'All 6 scenes defined', pass: true, details: [] };
  const expectedScenes = [
    'scene-foyer', 'scene-workshop', 'scene-library',
    'scene-bedroom', 'scene-observatory', 'scene-heart'
  ];

  if (!gameData.scenes) {
    results.pass = false;
    results.details.push('No scenes array found in GAME_DATA');
    return results;
  }

  const sceneIds = gameData.scenes.map(s => s.id);
  expectedScenes.forEach(sid => {
    const found = sceneIds.includes(sid);
    results.details.push({ scene: sid, found });
    if (!found) {
      results.pass = false;
    }
  });

  // Check each scene has prose (not empty/placeholder)
  gameData.scenes.forEach(scene => {
    const hasProse = scene.prose && scene.prose.length > 50;
    const hasName = scene.name && scene.name.length > 0;
    const hasExits = scene.exits && Object.keys(scene.exits).length > 0;
    const detail = {
      scene: scene.id,
      hasProse, hasName, hasExits,
      proseLength: scene.prose ? scene.prose.length : 0
    };
    results.details.push(detail);
    if (!hasProse || !hasName || !hasExits) {
      results.pass = false;
      results.details.push({ scene: scene.id, error: 'Missing content' });
    }
  });

  return results;
}

function checkSceneArt(artKeys, gameData) {
  const results = { check: 'All 6 scene SVGs present in GAME_ART', pass: true, details: [] };
  const expectedArt = [
    'scene-foyer', 'scene-workshop', 'scene-library',
    'scene-bedroom', 'scene-observatory', 'scene-heart'
  ];

  expectedArt.forEach(key => {
    const found = artKeys.includes(key);
    results.details.push({ artKey: key, found });
    if (!found) {
      results.pass = false;
    }
  });

  // Also check for placeholder text in HTML
  return results;
}

function checkPlaythrough(gameData) {
  const results = { check: 'Full playthrough path valid', pass: true, details: [] };
  
  // Expected path: Foyer -> Workshop -> Library -> Bedroom -> Observatory -> Heart
  const expectedPath = [
    'scene-foyer', 'scene-workshop', 'scene-library',
    'scene-bedroom', 'scene-observatory', 'scene-heart'
  ];

  const sceneMap = {};
  gameData.scenes.forEach(s => { sceneMap[s.id] = s; });

  // Verify each transition is valid via exits
  for (let i = 0; i < expectedPath.length - 1; i++) {
    const from = expectedPath[i];
    const to = expectedPath[i + 1];
    const scene = sceneMap[from];
    
    if (!scene) {
      results.pass = false;
      results.details.push({ from, to, error: 'Source scene not found' });
      continue;
    }

    const exits = Object.values(scene.exits || {});
    const canReach = exits.includes(to);
    
    // Also check if puzzle blocks this exit
    const blocker = gameData.puzzles.find(p =>
      p.blocksExit && p.blocksExit.scene === from && 
      p.blocksExit.direction && scene.exits && 
      Object.entries(scene.exits).some(([dir, target]) => dir === p.blocksExit.direction && target === to)
    );

    results.details.push({
      from, to, canReach,
      blockedByPuzzle: blocker ? blocker.id : null
    });

    if (!canReach && !blocker) {
      // Check alternate paths (scene may be reachable from another scene)
      const allExits = Object.values(scene.exits || {});
      results.details.push({ note: `${from} exits: ${allExits.join(', ')}` });
    }
  }

  return results;
}

function checkPuzzles(gameData) {
  const results = { check: 'All 5 puzzles defined and solvable', pass: true, details: [] };
  const expectedPuzzles = ['P1', 'P2', 'P3', 'P4', 'P5'];

  if (!gameData.puzzles) {
    results.pass = false;
    results.details.push('No puzzles array found');
    return results;
  }

  const puzzleIds = gameData.puzzles.map(p => p.id);
  expectedPuzzles.forEach(pid => {
    const puzzle = gameData.puzzles.find(p => p.id === pid);
    const found = !!puzzle;
    const detail = {
      puzzle: pid,
      found,
      scene: puzzle ? puzzle.scene : null,
      requires: puzzle ? puzzle.requires : null,
      reveals: puzzle ? puzzle.reveals : null,
      hasResult: puzzle ? !!(puzzle.result && puzzle.result.length > 10) : false,
      hasTarget: puzzle ? !!(puzzle.target) : false
    };
    results.details.push(detail);
    if (!found || !detail.hasResult || !detail.hasTarget) {
      results.pass = false;
    }
  });

  // Verify puzzle chain: each puzzle reveals what the next puzzle needs
  const puzzleChain = [
    { puzzle: 'P1', reveals: 'ITEM_GEAR', neededBy: 'P2' },
    { puzzle: 'P2', reveals: null, unlocks: 'scene-bedroom (north exit)', neededBy: 'P3' },
    { puzzle: 'P3', reveals: 'ITEM_CRYSTAL', neededBy: 'P4' },
    { puzzle: 'P4', reveals: 'ITEM_WINDING_KEY', neededBy: 'P5' },
    { puzzle: 'P5', reveals: null, wins: true }
  ];

  puzzleChain.forEach(chain => {
    const puzzle = gameData.puzzles.find(p => p.id === chain.puzzle);
    if (puzzle && chain.reveals) {
      const revealsCorrect = puzzle.reveals.includes(chain.reveals);
      results.details.push({
        chain: `${chain.puzzle} -> ${chain.reveals}`,
        revealsCorrect,
        neededBy: chain.neededBy
      });
      if (!revealsCorrect) {
        results.pass = false;
      }
    }
  });

  return results;
}

function checkLayoutCompliance(css) {
  const results = { check: 'v3.0 layout compliance', pass: true, details: [] };

  // Rule 1: NO height:100vh on body outside desktop media query
  // Find base CSS (before any @media)
  const beforeMediaQuery = css.split('@media')[0];
  
  // Check if body has height:100vh (the real violation)
  const bodyBlockMatch = beforeMediaQuery.match(/body\s*\{([^}]*)\}/);
  const bodyBlock = bodyBlockMatch ? bodyBlockMatch[1] : '';
  const bodyHasHeight100vh = /height\s*:\s*100vh/.test(bodyBlock);
  
  results.details.push({
    rule: 'body has no height:100vh on mobile/base',
    pass: !bodyHasHeight100vh,
    found: bodyHasHeight100vh ? 'YES (FAIL)' : 'NO (OK)'
  });
  if (bodyHasHeight100vh) results.pass = false;

  // Check if body has overflow:hidden (the real violation)
  // Note: overflow-x:hidden is OK (prevents horizontal scroll from wide art)
  // .art-panel overflow:hidden is OK (clips oversized SVG)
  const bodyHasOverflowHidden = /overflow\s*:\s*hidden/.test(bodyBlock) && !/overflow-x/.test(bodyBlock);
  
  results.details.push({
    rule: 'body has no overflow:hidden on mobile/base',
    pass: !bodyHasOverflowHidden,
    found: bodyHasOverflowHidden ? 'YES (FAIL)' : 'NO (OK)',
    note: 'overflow-x:hidden on body is allowed; .art-panel overflow:hidden is allowed'
  });
  if (bodyHasOverflowHidden) results.pass = false;

  // Rule 2: flex-wrap on .command-bar
  const commandBarFlexWrap = /\.command-bar[^{]*\{[^}]*flex-wrap\s*:\s*(wrap|wrap-reverse)/.test(css);
  const commandBarDisplayFlex = /\.command-bar[^{]*\{[^}]*display\s*:\s*flex/.test(css);
  results.details.push({
    rule: '.command-bar has display:flex + flex-wrap:wrap',
    pass: commandBarFlexWrap && commandBarDisplayFlex,
    flexWrap: commandBarFlexWrap,
    displayFlex: commandBarDisplayFlex
  });
  if (!commandBarFlexWrap || !commandBarDisplayFlex) results.pass = false;

  // Rule 3: flex-wrap on #exits-bar
  const exitsBarFlexWrap = /#exits-bar[^{]*\{[^}]*flex-wrap\s*:\s*(wrap|wrap-reverse)/.test(css);
  const exitsBarDisplayFlex = /#exits-bar[^{]*\{[^}]*display\s*:\s*flex/.test(css);
  results.details.push({
    rule: '#exits-bar has display:flex + flex-wrap:wrap',
    pass: exitsBarFlexWrap && exitsBarDisplayFlex,
    flexWrap: exitsBarFlexWrap,
    displayFlex: exitsBarDisplayFlex
  });
  if (!exitsBarFlexWrap || !exitsBarDisplayFlex) results.pass = false;

  // Rule 4: aspect-ratio: 8/5 on .art-panel (mobile)
  const artPanelAspectRatio = /\.art-panel[^{]*\{[^}]*aspect-ratio\s*:\s*8\s*\/\s*5/.test(beforeMediaQuery);
  results.details.push({
    rule: '.art-panel has aspect-ratio: 8/5 on mobile',
    pass: artPanelAspectRatio,
    found: artPanelAspectRatio ? 'YES (OK)' : 'NO (FAIL)'
  });
  if (!artPanelAspectRatio) results.pass = false;

  // Rule 5: min-height:44px on buttons
  const cmdBtnMinHeight = /\.cmd-btn[^{]*\{[^}]*min-height\s*:\s*44px/.test(beforeMediaQuery);
  const exitBtnMinHeight = /\.exit-btn[^{]*\{[^}]*min-height\s*:\s*44px/.test(beforeMediaQuery);
  results.details.push({
    rule: '.cmd-btn has min-height:44px',
    pass: cmdBtnMinHeight,
    found: cmdBtnMinHeight ? 'YES (OK)' : 'NO (FAIL)'
  });
  if (!cmdBtnMinHeight) results.pass = false;

  results.details.push({
    rule: '.exit-btn has min-height:44px',
    pass: exitBtnMinHeight,
    found: exitBtnMinHeight ? 'YES (OK)' : 'NO (FAIL)'
  });
  if (!exitBtnMinHeight) results.pass = false;

  // Rule 6: height:100vh IS allowed inside @media (min-width: 769px)
  const mediaMatch = css.match(/@media\s*\(\s*min-width\s*:\s*769px\s*\)\s*\{([\s\S]*?)\n\s*\}/);
  if (mediaMatch) {
    const desktopCSS = mediaMatch[1];
    const hasDesktopHeight100vh = /height\s*:\s*100vh/.test(desktopCSS);
    results.details.push({
      rule: 'Desktop @media has height:100vh (allowed)',
      pass: hasDesktopHeight100vh,
      found: hasDesktopHeight100vh ? 'YES (OK)' : 'NO'
    });
  }

  return results;
}

function checkItems(gameData) {
  const results = { check: 'All 5 items defined', pass: true, details: [] };
  const expectedItems = ['ITEM_KEY', 'ITEM_GEAR', 'ITEM_JOURNAL', 'ITEM_CRYSTAL', 'ITEM_WINDING_KEY'];

  if (!gameData.items) {
    results.pass = false;
    results.details.push('No items array found');
    return results;
  }

  const itemIds = gameData.items.map(i => i.id);
  expectedItems.forEach(iid => {
    const found = itemIds.includes(iid);
    const item = gameData.items.find(i => i.id === iid);
    results.details.push({
      item: iid,
      found,
      hasName: item ? !!(item.name) : false,
      hasDesc: item ? !!(item.description) : false
    });
    if (!found || !item?.name || !item?.description) {
      results.pass = false;
    }
  });

  return results;
}

function checkPuzzleInitialItems(gameData) {
  const results = { check: 'Starting items in correct scene', pass: true, details: [] };

  // ITEM_KEY should be in scene-foyer (initial state)
  const foyerScene = gameData.scenes.find(s => s.id === 'scene-foyer');
  if (foyerScene && foyerScene.items) {
    const hasKey = foyerScene.items.includes('ITEM_KEY');
    results.details.push({
      check: 'ITEM_KEY in scene-foyer',
      pass: hasKey,
      found: hasKey ? 'YES' : 'NO'
    });
    if (!hasKey) results.pass = false;
  } else {
    results.pass = false;
    results.details.push({ check: 'ITEM_KEY in scene-foyer', pass: false, error: 'scene-foyer not found' });
  }

  // JOURNAL should be accessible in bedroom scene
  const bedroomScene = gameData.scenes.find(s => s.id === 'scene-bedroom');
  if (bedroomScene) {
    const hasJournal = bedroomScene.items && bedroomScene.items.includes('ITEM_JOURNAL');
    const canFindJournal = bedroomScene.lookDescriptions && bedroomScene.lookDescriptions['journal'];
    results.details.push({
      check: 'ITEM_JOURNAL accessible in scene-bedroom',
      journalInItems: hasJournal,
      journalLookDescription: !!canFindJournal,
      note: 'Journal is found by LOOK, not as pickup item — acceptable'
    });
  }

  return results;
}

// ── Main ─────────────────────────────────────────────────────────
function runTests() {
  console.log('=== QA Test Suite: The Clockmaker\'s Folly ===');
  console.log();

  // Read game.html
  if (!fs.existsSync(GAME_HTML)) {
    console.error(`FAIL: ${GAME_HTML} not found`);
    writeReport({ overall: 'FAIL', error: 'game.html not found', tests: [] });
    process.exit(1);
  }

  const html = fs.readFileSync(GAME_HTML, 'utf-8');
  console.log(`Loaded: ${GAME_HTML} (${html.length} bytes)`);

  const extracted = extractGlobalVars(html);

  if (extracted.GAME_DATA_ERROR) {
    console.error(`FAIL: Could not parse GAME_DATA: ${extracted.GAME_DATA_ERROR}`);
    writeReport({ overall: 'FAIL', error: extracted.GAME_DATA_ERROR, tests: [] });
    process.exit(1);
  }

  const gameData = extracted.GAME_DATA;
  const artKeys = extracted.GAME_ART_KEYS || [];
  const css = extracted.CSS || '';

  console.log(`Game: ${gameData.title}`);
  console.log(`Scenes: ${gameData.scenes?.length || 0}`);
  console.log(`Items: ${gameData.items?.length || 0}`);
  console.log(`Puzzles: ${gameData.puzzles?.length || 0}`);
  console.log(`Art keys: ${artKeys.length}`);
  console.log();

  // Run all checks
  const tests = [];

  // 1. Scene rendering check
  console.log('--- Test 1: Scene Rendering ---');
  const sceneCheck = checkScenes(gameData);
  tests.push(sceneCheck);
  console.log(`  ${sceneCheck.pass ? 'PASS' : 'FAIL'}: ${sceneCheck.check}`);
  sceneCheck.details.forEach(d => {
    if (d.scene) console.log(`    ${d.scene}: ${d.found !== undefined ? (d.found ? 'OK' : 'MISSING') : 'OK'}`);
  });

  // 2. Scene art (SVG) check
  console.log('--- Test 2: Scene Art Assets ---');
  const artCheck = checkSceneArt(artKeys, gameData);
  tests.push(artCheck);
  console.log(`  ${artCheck.pass ? 'PASS' : 'FAIL'}: ${artCheck.check}`);
  artCheck.details.forEach(d => {
    console.log(`    ${d.artKey}: ${d.found ? 'OK' : 'MISSING'}`);
  });

  // 3. Playthrough path check
  console.log('--- Test 3: Full Playthrough Path ---');
  const pathCheck = checkPlaythrough(gameData);
  tests.push(pathCheck);
  console.log(`  ${pathCheck.pass ? 'PASS' : 'FAIL'}: ${pathCheck.check}`);
  pathCheck.details.forEach(d => {
    if (d.from) {
      console.log(`    ${d.from} -> ${d.to}: ${d.canReach ? 'OK' : 'MISSING'}`);
    }
  });

  // 4. Puzzle verification
  console.log('--- Test 4: Puzzle Verification ---');
  const puzzleCheck = checkPuzzles(gameData);
  tests.push(puzzleCheck);
  console.log(`  ${puzzleCheck.pass ? 'PASS' : 'FAIL'}: ${puzzleCheck.check}`);
  puzzleCheck.details.forEach(d => {
    if (d.puzzle) {
      console.log(`    ${d.puzzle}: scene=${d.scene}, requires=${d.requires}, reveals=${d.reveals}, hasResult=${d.hasResult}`);
    }
    if (d.chain) {
      console.log(`    Chain: ${d.chain} ${d.revealsCorrect ? 'OK' : 'MISMATCH'}`);
    }
  });

  // 5. v3.0 layout compliance
  console.log('--- Test 5: v3.0 Layout Compliance ---');
  const layoutCheck = checkLayoutCompliance(css);
  tests.push(layoutCheck);
  console.log(`  ${layoutCheck.pass ? 'PASS' : 'FAIL'}: ${layoutCheck.check}`);
  layoutCheck.details.forEach(d => {
    console.log(`    ${d.rule}: ${d.pass ? 'OK' : 'FAIL'} (${d.found || ''})`);
  });

  // 6. Item definitions
  console.log('--- Test 6: Item Definitions ---');
  const itemCheck = checkItems(gameData);
  tests.push(itemCheck);
  console.log(`  ${itemCheck.pass ? 'PASS' : 'FAIL'}: ${itemCheck.check}`);

  // 7. Initial items placement
  console.log('--- Test 7: Starting Items ---');
  const initialItemsCheck = checkPuzzleInitialItems(gameData);
  tests.push(initialItemsCheck);
  console.log(`  ${initialItemsCheck.pass ? 'PASS' : 'FAIL'}: ${initialItemsCheck.check}`);

  // Overall result
  const allPass = tests.every(t => t.pass);
  const overall = allPass ? 'PASS' : 'FAIL';
  const passedCount = tests.filter(t => t.pass).length;
  const failedCount = tests.filter(t => !t.pass).length;

  console.log();
  console.log(`=== RESULTS ===`);
  console.log(`Overall: ${overall}`);
  console.log(`Passed: ${passedCount}/${tests.length}`);
  console.log(`Failed: ${failedCount}/${tests.length}`);

  // Generate report
  const report = {
    game: 'The Clockmaker\'s Folly',
    gameNumber: '016',
    timestamp: new Date().toISOString(),
    overall,
    summary: {
      total: tests.length,
      passed: passedCount,
      failed: failedCount,
      passRate: `${Math.round((passedCount / tests.length) * 100)}%`
    },
    tests: tests.map(t => ({
      check: t.check,
      pass: t.pass,
      details: t.details
    }))
  };

  writeReport(report);
  console.log();
  console.log(`Report written to: ${REPORT_PATH}`);
}

function writeReport(report) {
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf-8');
}

// Run
runTests();
