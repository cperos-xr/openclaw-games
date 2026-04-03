import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const VALID_LAYOUTS = new Set(['standard', 'split', 'vertical-carnival']);

function getLocalDateStamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[\u2018\u2019']/g, '')
    .replace(/[_-]+/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeLayout(value) {
  const normalized = normalize(value).replace(/\s+/g, '-');
  if (!normalized) {
    return 'standard';
  }

  if (normalized === 'split') {
    return 'standard';
  }

  if (VALID_LAYOUTS.has(normalized)) {
    return normalized;
  }

  return normalized;
}

export function extractGameDirsFromIndex(indexHtml) {
  const links = [...indexHtml.matchAll(/href="([0-9]{3}[^"/]+)\/game\.html"/g)];
  return Array.from(new Set(links.map((match) => match[1])));
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

export function readPublishedGameConfigs(gamesPath) {
  const indexPath = path.join(gamesPath, 'index.html');
  const indexHtml = readText(indexPath);
  const gameDirs = extractGameDirsFromIndex(indexHtml);

  return gameDirs.map((gameDirName) => {
    const gameDirPath = path.join(gamesPath, gameDirName);
    const scriptPath = path.join(gameDirPath, 'game-script.json');
    const gameData = JSON.parse(readText(scriptPath));

    return {
      gameDirName,
      gameDirPath,
      scriptPath,
      gameData
    };
  });
}

function pushIssue(list, code, message, details = {}) {
  list.push({
    code,
    message,
    ...details
  });
}

function getDuplicateIds(values) {
  const seen = new Set();
  const duplicates = new Set();

  values.forEach((value) => {
    if (!value) {
      return;
    }

    if (seen.has(value)) {
      duplicates.add(value);
      return;
    }

    seen.add(value);
  });

  return Array.from(duplicates);
}

function getBlockedExitConfig(puzzle) {
  if (!puzzle || !puzzle.blocksExit) {
    return null;
  }

  if (typeof puzzle.blocksExit === 'string') {
    if (!normalize(puzzle.blocksExit)) {
      return null;
    }

    return {
      scene: puzzle.scene,
      direction: puzzle.blocksExit,
      blockedMessage: puzzle.blockedMessage || ''
    };
  }

  if (typeof puzzle.blocksExit === 'object') {
    if (!normalize(puzzle.blocksExit.direction)) {
      return null;
    }

    return {
      scene: puzzle.blocksExit.scene || puzzle.scene,
      direction: puzzle.blocksExit.direction,
      blockedMessage: puzzle.blocksExit.blockedMessage || puzzle.blockedMessage || ''
    };
  }

  return null;
}

function getHintEntries(gameData, sceneId) {
  const scene = gameData.scenes.find((entry) => entry.id === sceneId);
  const sceneHints = Array.isArray(scene?.hints) ? scene.hints : [];
  const rootHints = Array.isArray(gameData.hints?.[sceneId]) ? gameData.hints[sceneId] : [];
  return sceneHints.length > 0 ? sceneHints : rootHints;
}

function getItemRevealers(gameData) {
  const itemRevealers = new Map();
  const itemIds = new Set((gameData.items || []).map((item) => item.id));

  (gameData.puzzles || []).forEach((puzzle) => {
    (puzzle.reveals || []).forEach((revealId) => {
      if (!itemIds.has(revealId)) {
        return;
      }

      const revealers = itemRevealers.get(revealId) || [];
      revealers.push(puzzle.id);
      itemRevealers.set(revealId, revealers);
    });
  });

  return itemRevealers;
}

function isItemVisible(item, solvedPuzzles, itemRevealers) {
  const revealers = itemRevealers.get(item.id) || [];
  if (revealers.length === 0) {
    return true;
  }

  return revealers.some((puzzleId) => solvedPuzzles.has(puzzleId));
}

function getReachableScenes(gameData, solvedPuzzles) {
  const sceneMap = new Map((gameData.scenes || []).map((scene) => [scene.id, scene]));
  const queue = [];
  const reachable = new Set();

  if (!gameData.scenes || gameData.scenes.length === 0) {
    return reachable;
  }

  queue.push(gameData.scenes[0].id);
  reachable.add(gameData.scenes[0].id);

  while (queue.length > 0) {
    const sceneId = queue.shift();
    const scene = sceneMap.get(sceneId);
    if (!scene) {
      continue;
    }

    Object.entries(scene.exits || {}).forEach(([direction, destination]) => {
      const blocked = (gameData.puzzles || []).some((puzzle) => {
        if (solvedPuzzles.has(puzzle.id)) {
          return false;
        }

        const blockedExit = getBlockedExitConfig(puzzle);
        if (!blockedExit) {
          return false;
        }

        return normalize(blockedExit.scene) === normalize(sceneId) &&
          normalize(blockedExit.direction) === normalize(direction);
      });

      if (blocked || !sceneMap.has(destination) || reachable.has(destination)) {
        return;
      }

      reachable.add(destination);
      queue.push(destination);
    });
  }

  return reachable;
}

function simulateSolvability(gameData) {
  const itemMap = new Map((gameData.items || []).map((item) => [item.id, item]));
  const itemRevealers = getItemRevealers(gameData);
  const inventory = new Set();
  const solvedPuzzles = new Set();
  const waves = [];

  let changed = true;
  while (changed) {
    changed = false;
    const reachableScenes = getReachableScenes(gameData, solvedPuzzles);
    const newlyCollected = [];
    const newlySolved = [];

    reachableScenes.forEach((sceneId) => {
      itemMap.forEach((item) => {
        if (item.foundIn !== sceneId || inventory.has(item.id)) {
          return;
        }

        if (!isItemVisible(item, solvedPuzzles, itemRevealers)) {
          return;
        }

        inventory.add(item.id);
        newlyCollected.push(item.id);
        changed = true;
      });
    });

    (gameData.puzzles || []).forEach((puzzle) => {
      if (solvedPuzzles.has(puzzle.id) || !reachableScenes.has(puzzle.scene)) {
        return;
      }

      const requiredItems = Array.isArray(puzzle.requires) ? puzzle.requires : [];
      if (!requiredItems.every((itemId) => inventory.has(itemId))) {
        return;
      }

      solvedPuzzles.add(puzzle.id);
      newlySolved.push(puzzle.id);
      changed = true;
    });

    if (newlyCollected.length > 0 || newlySolved.length > 0) {
      waves.push({
        reachableScenes: Array.from(reachableScenes).sort(),
        collectedItems: newlyCollected.sort(),
        solvedPuzzles: newlySolved.sort()
      });
    }
  }

  return {
    reachableScenes: Array.from(getReachableScenes(gameData, solvedPuzzles)).sort(),
    inventory: Array.from(inventory).sort(),
    solvedPuzzles: Array.from(solvedPuzzles).sort(),
    waves
  };
}

function isEndingSceneReachable(sceneId, gameData, solvedPuzzleSet) {
  if (!sceneId || sceneId !== gameData.winCondition?.scene) {
    return false;
  }

  return (gameData.puzzles || []).some((puzzle) =>
    solvedPuzzleSet.has(puzzle.id) && Array.isArray(puzzle.reveals) && puzzle.reveals.includes(sceneId)
  );
}

export function validateGameData(gameData, gameDirName) {
  const errors = [];
  const warnings = [];
  const scenes = Array.isArray(gameData.scenes) ? gameData.scenes : [];
  const items = Array.isArray(gameData.items) ? gameData.items : [];
  const puzzles = Array.isArray(gameData.puzzles) ? gameData.puzzles : [];
  const sceneMap = new Map(scenes.map((scene) => [scene.id, scene]));
  const itemMap = new Map(items.map((item) => [item.id, item]));
  const puzzleMap = new Map(puzzles.map((puzzle) => [puzzle.id, puzzle]));
  const layout = normalizeLayout(gameData.layout);

  getDuplicateIds(scenes.map((scene) => scene.id)).forEach((duplicateId) => {
    pushIssue(errors, 'duplicate-scene-id', `Duplicate scene id "${duplicateId}".`, { sceneId: duplicateId });
  });

  getDuplicateIds(items.map((item) => item.id)).forEach((duplicateId) => {
    pushIssue(errors, 'duplicate-item-id', `Duplicate item id "${duplicateId}".`, { itemId: duplicateId });
  });

  getDuplicateIds(puzzles.map((puzzle) => puzzle.id)).forEach((duplicateId) => {
    pushIssue(errors, 'duplicate-puzzle-id', `Duplicate puzzle id "${duplicateId}".`, { puzzleId: duplicateId });
  });

  if (scenes.length === 0) {
    pushIssue(errors, 'missing-scenes', 'Game has no scenes.');
  }

  if (!VALID_LAYOUTS.has(layout)) {
    pushIssue(errors, 'invalid-layout', `Unsupported layout "${gameData.layout}". Use "standard" or "vertical-carnival".`, { layout: gameData.layout });
  }

  scenes.forEach((scene) => {
    Object.entries(scene.exits || {}).forEach(([direction, destination]) => {
      if (!sceneMap.has(destination)) {
        pushIssue(errors, 'missing-exit-scene', `Scene "${scene.id}" exit "${direction}" points to missing scene "${destination}".`, {
          sceneId: scene.id,
          direction,
          destination
        });
      }
    });

    (scene.items || []).forEach((itemId) => {
      if (!itemMap.has(itemId)) {
        pushIssue(errors, 'missing-scene-item', `Scene "${scene.id}" references missing item "${itemId}".`, {
          sceneId: scene.id,
          itemId
        });
      }
    });

    (scene.puzzles || []).forEach((puzzleId) => {
      if (!puzzleMap.has(puzzleId)) {
        pushIssue(errors, 'missing-scene-puzzle', `Scene "${scene.id}" references missing puzzle "${puzzleId}".`, {
          sceneId: scene.id,
          puzzleId
        });
      }
    });

    getHintEntries(gameData, scene.id).forEach((entry, index) => {
      if (typeof entry === 'string') {
        return;
      }

      if (!entry || typeof entry !== 'object' || !String(entry.text || '').trim()) {
        pushIssue(errors, 'invalid-hint-entry', `Scene "${scene.id}" has an invalid hint at index ${index}.`, {
          sceneId: scene.id,
          index
        });
        return;
      }

      if (entry.delay != null && Number.isNaN(Number(entry.delay))) {
        pushIssue(errors, 'invalid-hint-delay', `Scene "${scene.id}" hint ${index} has a non-numeric delay.`, {
          sceneId: scene.id,
          index
        });
      }
    });
  });

  items.forEach((item) => {
    if (!sceneMap.has(item.foundIn)) {
      pushIssue(errors, 'missing-item-found-scene', `Item "${item.id}" foundIn references missing scene "${item.foundIn}".`, {
        itemId: item.id,
        sceneId: item.foundIn
      });
    }

    if (item.usedIn && !sceneMap.has(item.usedIn)) {
      pushIssue(errors, 'missing-item-used-scene', `Item "${item.id}" usedIn references missing scene "${item.usedIn}".`, {
        itemId: item.id,
        sceneId: item.usedIn
      });
    }

    if (!String(item.usedOn || '').trim()) {
      pushIssue(warnings, 'missing-item-target', `Item "${item.id}" has no usedOn target.`, { itemId: item.id });
    }
  });

  puzzles.forEach((puzzle) => {
    if (!sceneMap.has(puzzle.scene)) {
      pushIssue(errors, 'missing-puzzle-scene', `Puzzle "${puzzle.id}" references missing scene "${puzzle.scene}".`, {
        puzzleId: puzzle.id,
        sceneId: puzzle.scene
      });
    }

    (puzzle.requires || []).forEach((itemId) => {
      if (!itemMap.has(itemId)) {
        pushIssue(errors, 'missing-puzzle-item', `Puzzle "${puzzle.id}" requires missing item "${itemId}".`, {
          puzzleId: puzzle.id,
          itemId
        });
      }
    });

    (puzzle.reveals || []).forEach((revealId) => {
      if (!sceneMap.has(revealId) && !itemMap.has(revealId)) {
        pushIssue(errors, 'missing-puzzle-reveal', `Puzzle "${puzzle.id}" reveals missing scene or item "${revealId}".`, {
          puzzleId: puzzle.id,
          revealId
        });
      }
    });

    const blockedExit = getBlockedExitConfig(puzzle);
    if (!puzzle.blocksExit || !blockedExit) {
      return;
    }

    const blockedScene = sceneMap.get(blockedExit.scene);
    if (!blockedScene) {
      pushIssue(errors, 'missing-blocker-scene', `Puzzle "${puzzle.id}" blocks an exit in missing scene "${blockedExit.scene}".`, {
        puzzleId: puzzle.id,
        sceneId: blockedExit.scene,
        direction: blockedExit.direction
      });
      return;
    }

    if (!Object.prototype.hasOwnProperty.call(blockedScene.exits || {}, blockedExit.direction)) {
      pushIssue(errors, 'missing-blocked-exit', `Puzzle "${puzzle.id}" blocks "${blockedExit.direction}" in scene "${blockedExit.scene}", but that exit does not exist there.`, {
        puzzleId: puzzle.id,
        sceneId: blockedExit.scene,
        direction: blockedExit.direction,
        availableExits: Object.keys(blockedScene.exits || {})
      });
    }
  });

  if (gameData.winCondition?.scene && !sceneMap.has(gameData.winCondition.scene)) {
    pushIssue(errors, 'missing-win-scene', `Win condition references missing scene "${gameData.winCondition.scene}".`, {
      sceneId: gameData.winCondition.scene
    });
  }

  (gameData.winCondition?.requires || []).forEach((itemId) => {
    if (!itemMap.has(itemId)) {
      pushIssue(errors, 'missing-win-item', `Win condition requires missing item "${itemId}".`, { itemId });
    }
  });

  const solvability = simulateSolvability(gameData);
  const reachableSceneSet = new Set(solvability.reachableScenes);
  const inventorySet = new Set(solvability.inventory);
  const solvedPuzzleSet = new Set(solvability.solvedPuzzles);

  scenes.forEach((scene) => {
    if (!reachableSceneSet.has(scene.id)) {
      if (isEndingSceneReachable(scene.id, gameData, solvedPuzzleSet)) {
        return;
      }

      pushIssue(errors, 'unreachable-scene', `Scene "${scene.id}" is unreachable from the starting scene.`, { sceneId: scene.id });
    }
  });

  items.forEach((item) => {
    if (!inventorySet.has(item.id)) {
      pushIssue(errors, 'unobtainable-item', `Item "${item.id}" cannot be obtained during play.`, {
        itemId: item.id,
        sceneId: item.foundIn
      });
    }
  });

  puzzles.forEach((puzzle) => {
    if (solvedPuzzleSet.has(puzzle.id)) {
      return;
    }

    const missingItems = (puzzle.requires || []).filter((itemId) => !inventorySet.has(itemId));
    pushIssue(errors, 'unsolved-puzzle', `Puzzle "${puzzle.id}" is not solvable from the current data chain.`, {
      puzzleId: puzzle.id,
      sceneId: puzzle.scene,
      missingItems
    });
  });

  if (gameData.winCondition?.scene && !reachableSceneSet.has(gameData.winCondition.scene)) {
    if (!isEndingSceneReachable(gameData.winCondition.scene, gameData, solvedPuzzleSet)) {
      pushIssue(errors, 'unreachable-win-scene', `Win scene "${gameData.winCondition.scene}" is not reachable.`, {
        sceneId: gameData.winCondition.scene
      });
    }
  }

  (gameData.winCondition?.requires || []).forEach((itemId) => {
    if (!inventorySet.has(itemId)) {
      pushIssue(errors, 'unobtainable-win-item', `Win condition item "${itemId}" cannot be obtained.`, { itemId });
    }
  });

  return {
    gameDirName,
    title: gameData.title || gameDirName,
    layout,
    errors,
    warnings,
    solvability
  };
}

export function validatePublishedGames(gamesPath) {
  return readPublishedGameConfigs(gamesPath).map(({ gameDirName, gameData }) => validateGameData(gameData, gameDirName));
}

export function formatValidationText(results) {
  const failing = results.filter((result) => result.errors.length > 0);
  const passing = results.filter((result) => result.errors.length === 0);
  const lines = [
    `Validated ${results.length} published games.`,
    `${passing.length} passing, ${failing.length} failing.`
  ];

  results.forEach((result) => {
    lines.push(``);
    lines.push(`${result.gameDirName}: ${result.errors.length === 0 ? 'PASS' : 'FAIL'} (${result.title})`);

    if (result.errors.length === 0 && result.warnings.length === 0) {
      lines.push('  No issues found.');
      return;
    }

    result.errors.forEach((issue) => lines.push(`  ERROR [${issue.code}] ${issue.message}`));
    result.warnings.forEach((issue) => lines.push(`  WARN  [${issue.code}] ${issue.message}`));
  });

  return lines.join('\n');
}

export function formatValidationMarkdown(results, dateStamp) {
  const today = dateStamp || getLocalDateStamp();
  const failing = results.filter((result) => result.errors.length > 0);
  const passing = results.filter((result) => result.errors.length === 0);
  const lines = [
    '# Solvability Summary Report',
    '',
    `Last Audit: ${today}`,
    '',
    '## Executive Summary',
    '',
    `Validated ${results.length} published games from games/index.html. ${passing.length} passed with no blocking solvability errors and ${failing.length} failed validation.`,
    ''
  ];

  if (failing.length === 0) {
    lines.push('No blocking puzzle-data issues were found in the published set.');
    lines.push('');
  }

  lines.push('## Game-by-Game Results');
  lines.push('');

  results.forEach((result) => {
    lines.push(`### ${result.gameDirName} — ${result.title}`);
    lines.push(`- Status: ${result.errors.length === 0 ? 'PASS' : 'FAIL'}`);
    lines.push(`- Layout: ${result.layout}`);
    lines.push(`- Reachable scenes: ${result.solvability.reachableScenes.length}`);
    lines.push(`- Obtainable items: ${result.solvability.inventory.length}`);
    lines.push(`- Solvable puzzles: ${result.solvability.solvedPuzzles.length}`);

    if (result.errors.length === 0) {
      lines.push('- Issues: None');
    } else {
      lines.push('- Issues:');
      result.errors.forEach((issue) => lines.push(`  - [${issue.code}] ${issue.message}`));
    }

    if (result.warnings.length > 0) {
      lines.push('- Warnings:');
      result.warnings.forEach((issue) => lines.push(`  - [${issue.code}] ${issue.message}`));
    }

    lines.push('');
  });

  lines.push('## Notes');
  lines.push('');
  lines.push('- Validation checks scene reachability, item acquisition, puzzle dependency order, win-condition reachability, scene-exit references, and blocksExit integrity.');
  lines.push('- The shared runtime still supports legacy string-style blocksExit values, but new content should prefer the object form for clarity.');

  return lines.join('\n');
}

function runCli() {
  const args = process.argv.slice(2);
  const gamesPath = path.dirname(fileURLToPath(import.meta.url));
  const results = validatePublishedGames(gamesPath);
  const writeSummary = args.includes('--write-summary');
  const markdown = formatValidationMarkdown(results);

  console.log(formatValidationText(results));

  if (writeSummary) {
    const outputPath = path.join(gamesPath, 'solvability-summary.md');
    fs.writeFileSync(outputPath, markdown, 'utf8');
    console.log(`\nWrote ${outputPath}`);
  }

  if (results.some((result) => result.errors.length > 0)) {
    process.exitCode = 1;
  }
}

const currentFilePath = fileURLToPath(import.meta.url);
const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';

if (invokedPath && currentFilePath === invokedPath) {
  runCli();
}