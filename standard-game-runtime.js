(function () {
  'use strict';

  if (window.__OPENCLAW_STANDARD_RUNTIME_BOOTED__) {
    return;
  }
  window.__OPENCLAW_STANDARD_RUNTIME_BOOTED__ = true;

  if (typeof window.GAME_DATA === 'undefined' && typeof GAME_DATA !== 'undefined') {
    window.GAME_DATA = GAME_DATA;
  }

  const gameData = window.GAME_DATA;
  const gameArt = window.GAME_ART || {};

  if (!gameData || !Array.isArray(gameData.scenes) || gameData.scenes.length === 0) {
    console.error('OpenClaw standard runtime: GAME_DATA is missing or invalid.');
    return;
  }

  const sceneMap = new Map(gameData.scenes.map((scene) => [scene.id, scene]));
  const itemMap = new Map((gameData.items || []).map((item) => [item.id, item]));
  const puzzles = Array.isArray(gameData.puzzles) ? gameData.puzzles : [];
  const winCondition = gameData.winCondition || {};
  const PROGRESS_STORAGE_KEY = 'openclaw-game-progress-v1';
  const itemRevealers = new Map();

  puzzles.forEach((puzzle) => {
    (puzzle.reveals || []).forEach((revealId) => {
      if (!itemMap.has(revealId)) {
        return;
      }

      const revealers = itemRevealers.get(revealId) || [];
      revealers.push(puzzle.id);
      itemRevealers.set(revealId, revealers);
    });
  });

  const dom = {
    artPanel: document.querySelector('.art-panel'),
    artDisplay: document.getElementById('art-display'),
    sceneName: document.getElementById('scene-name'),
    textDisplay: document.getElementById('text-display'),
    commandButtons: Array.from(document.querySelectorAll('.cmd-btn[data-cmd]')),
    commandStatus: document.getElementById('command-status'),
    targetsBar: document.getElementById('targets-bar'),
    inventoryBar: document.getElementById('inventory-bar'),
    exitsBar: document.getElementById('exits-bar'),
    hintToggle: document.getElementById('hint-toggle'),
    resetButton: document.getElementById('reset-game')
  };

  const state = {
    currentScene: gameData.scenes[0].id,
    inventory: [],
    solvedPuzzles: [],
    visitedScenes: [gameData.scenes[0].id],
    activeCommand: 'look',
    artPreview: null,
    selectedItemId: null,
    sceneMessages: [],
    hintsEnabled: Boolean(gameData.hintsEnabledByDefault),
    hintTimer: null,
    solveFlashTimer: null,
    hintCursorByScene: {},
    winMessage: '',
    won: false
  };

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[\u2018\u2019']/g, '')
      .replace(/[_-]+/g, ' ')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getLayoutName(value) {
    const normalized = normalize(value).replace(/\s+/g, '-');
    return normalized === 'vertical-carnival' ? 'vertical-carnival' : 'standard';
  }

  if (document.body) {
    const layoutName = getLayoutName(gameData.layout);
    document.body.classList.add('openclaw-game');
    document.body.classList.toggle('layout-standard', layoutName === 'standard');
    document.body.classList.toggle('layout-vertical-carnival', layoutName === 'vertical-carnival');
    document.body.dataset.layout = layoutName;
  }

  function ensureIndexLink() {
    const existingLink = document.querySelector('[data-openclaw-index-link]');
    if (existingLink) {
      return;
    }

    const link = document.createElement('a');
    link.href = '../index.html';
    link.textContent = 'GAME INDEX';
    link.className = 'utility-btn utility-link';
    link.setAttribute('data-openclaw-index-link', 'true');

    const utilityBar = document.querySelector('.utility-bar');
    if (utilityBar) {
      utilityBar.appendChild(link);
      return;
    }

    const footer = document.querySelector('footer');
    if (footer) {
      footer.appendChild(document.createTextNode(' | '));
      footer.appendChild(link);
    }
  }

  ensureIndexLink();

  function getCurrentGameId() {
    const pathParts = String(window.location.pathname || '').split('/').filter(Boolean);
    if (pathParts.length >= 2 && pathParts[pathParts.length - 1] === 'game.html') {
      return pathParts[pathParts.length - 2];
    }

    const number = String(gameData.number || '').replace(/\D+/g, '').padStart(3, '0');
    const slug = String(gameData.slug || '').trim();
    if (number && slug) {
      return `${number}-${slug}`;
    }

    return slug || number || null;
  }

  function loadProgressStore() {
    try {
      const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (!raw) {
        return { completedGames: {} };
      }

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') {
        return { completedGames: {} };
      }

      if (!parsed.completedGames || typeof parsed.completedGames !== 'object') {
        parsed.completedGames = {};
      }

      return parsed;
    } catch {
      return { completedGames: {} };
    }
  }

  function saveProgressStore(store) {
    try {
      window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(store));
    } catch {
      // Ignore storage failures and keep gameplay uninterrupted.
    }
  }

  function recordCompletion() {
    const gameId = getCurrentGameId();
    if (!gameId) {
      return;
    }

    const store = loadProgressStore();
    store.completedGames[gameId] = {
      title: gameData.title || gameId,
      number: gameData.number || null,
      slug: gameData.slug || null,
      completedAt: new Date().toISOString()
    };
    saveProgressStore(store);
  }

  function titleCase(value) {
    return String(value || '')
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function isSceneId(value) {
    return sceneMap.has(value);
  }

  function findScene(sceneId) {
    return sceneMap.get(sceneId) || null;
  }

  function findItem(itemId) {
    return itemMap.get(itemId) || null;
  }

  function currentScene() {
    return findScene(state.currentScene);
  }

  function isItemRevealed(itemId) {
    const revealers = itemRevealers.get(itemId) || [];
    if (revealers.length === 0) {
      return true;
    }

    return revealers.some((puzzleId) => state.solvedPuzzles.includes(puzzleId));
  }

  function getVisibleSceneItemIds(scene) {
    const declaredInScene = Array.isArray(scene.items) ? scene.items : [];
    const foundInScene = [];

    itemMap.forEach((item) => {
      if (item.foundIn === scene.id) {
        foundInScene.push(item.id);
      }
    });

    const visibleIds = Array.from(new Set(declaredInScene.concat(foundInScene)));
    return visibleIds.filter((itemId) => {
      if (state.inventory.includes(itemId)) {
        return false;
      }

      const item = findItem(itemId);
      if (item && item.foundIn && item.foundIn !== scene.id) {
        return false;
      }

      return isItemRevealed(itemId);
    });
  }

  function addSceneMessage(text, className) {
    state.sceneMessages.push({
      text: String(text || ''),
      className: className || '',
      fresh: true
    });
  }

  function clearSceneMessages() {
    state.sceneMessages = [];
  }

  function clearElement(element) {
    if (!element) {
      return;
    }

    element.innerHTML = '';
  }

  function appendParagraph(element, text, className, isFresh) {
    if (!element) {
      return;
    }

    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    if (className) {
      paragraph.className = className;
    }
    if (isFresh) {
      paragraph.classList.add('fresh-line');
    }
    element.appendChild(paragraph);
  }

  function buildArtCandidates(id, type) {
    const raw = String(id || '');
    const stripped = raw.replace(/^(scene|item)-/i, '');
    const dash = raw.replace(/_/g, '-');
    const underscore = raw.replace(/-/g, '_');
    const strippedDash = stripped.replace(/_/g, '-');
    const strippedUnderscore = stripped.replace(/-/g, '_');
    const prefix = type === 'item' ? 'item-' : 'scene-';
    const candidates = [
      raw,
      raw.toLowerCase(),
      raw.toUpperCase(),
      stripped,
      stripped.toLowerCase(),
      stripped.toUpperCase(),
      dash,
      dash.toLowerCase(),
      underscore,
      underscore.toLowerCase(),
      strippedDash,
      strippedDash.toLowerCase(),
      strippedUnderscore,
      strippedUnderscore.toLowerCase(),
      prefix + raw,
      (prefix + raw).toLowerCase(),
      prefix + stripped,
      (prefix + stripped).toLowerCase()
    ];

    return Array.from(new Set(candidates.filter(Boolean)));
  }

  function getArtHtml(id, type) {
    const candidates = buildArtCandidates(id, type);
    for (const candidate of candidates) {
      if (Object.prototype.hasOwnProperty.call(gameArt, candidate)) {
        return gameArt[candidate];
      }
    }
    return null;
  }

  function setArtPreview(preview) {
    state.artPreview = preview || null;
  }

  function clearArtPreview() {
    setArtPreview(null);
  }

  function resolveArtPreview(id, preferredType, label) {
    const types = preferredType === 'item' ? ['item', 'scene'] : ['scene', 'item'];

    for (const type of types) {
      const html = getArtHtml(id, type);
      if (html) {
        return {
          id,
          label: label || id,
          kind: type,
          html
        };
      }
    }

    return null;
  }

  function renderArt(scene) {
    if (!dom.artDisplay) {
      return;
    }

    const sceneArtHtml = getArtHtml(scene.id, 'scene') || '<span class="no-art">[ ' + escapeHtml(scene.name.toUpperCase()) + ' ]</span>';
    const previewHtml = !state.won && state.activeCommand === 'examine' && state.artPreview && state.artPreview.html
      ? `<div class="art-preview-overlay" data-preview-kind="${escapeHtml(state.artPreview.kind || 'detail')}" data-preview-label="${escapeHtml(state.artPreview.label || '')}"><div class="art-preview-window">${state.artPreview.html}</div></div>`
      : '';
    const winOverlayHtml = state.won
      ? `<div class="win-overlay"><div class="win-modal"><div class="win-kicker">CASE CLOSED</div><h2 class="win-title">YOU SURVIVED</h2><p class="win-subtitle">${escapeHtml(gameData.title || 'OpenClaw Adventure')} complete.</p><p class="win-message">${escapeHtml(state.winMessage || winCondition.description || 'You made it out alive.')}</p><div class="win-actions"><a href="../index.html" class="utility-btn utility-link">BACK TO INDEX</a><button type="button" class="utility-btn" data-win-reset="true">PLAY AGAIN</button></div></div></div>`
      : '';

    dom.artDisplay.innerHTML = `<div class="art-scene-layer">${sceneArtHtml}</div>${previewHtml}${winOverlayHtml}`;
  }

  function triggerSolveFlash() {
    const flashTarget = dom.artPanel || document.body;
    if (!flashTarget) {
      return;
    }

    flashTarget.classList.remove('solve-flash');
    void flashTarget.offsetWidth;
    flashTarget.classList.add('solve-flash');

    if (state.solveFlashTimer) {
      clearTimeout(state.solveFlashTimer);
    }

    state.solveFlashTimer = setTimeout(() => {
      flashTarget.classList.remove('solve-flash');
      state.solveFlashTimer = null;
    }, 650);
  }

  function renderText(scene) {
    clearElement(dom.textDisplay);
    if (!dom.textDisplay) {
      return;
    }

    const proseBlocks = String(scene.prose || '')
      .split(/\n+/)
      .map((block) => block.trim())
      .filter(Boolean);

    proseBlocks.forEach((block) => appendParagraph(dom.textDisplay, block));

    state.sceneMessages.forEach((message) => {
      appendParagraph(dom.textDisplay, message.text, message.className, message.fresh);
      message.fresh = false;
    });

    dom.textDisplay.scrollTop = dom.textDisplay.scrollHeight;
  }

  function clearHintTimer() {
    if (state.hintTimer) {
      clearTimeout(state.hintTimer);
      state.hintTimer = null;
    }
  }

  function getSceneHintEntries(sceneId) {
    const scene = findScene(sceneId);
    const sceneHints = Array.isArray(scene && scene.hints) ? scene.hints : [];
    const rootHints = Array.isArray(gameData.hints && gameData.hints[sceneId]) ? gameData.hints[sceneId] : [];
    const source = sceneHints.length > 0 ? sceneHints : rootHints;

    return source
      .map((entry) => {
        if (typeof entry === 'string') {
          return {
            text: entry,
            delay: 14
          };
        }

        if (!entry || typeof entry !== 'object' || !String(entry.text || '').trim()) {
          return null;
        }

        return {
          text: String(entry.text).trim(),
          delay: Math.max(4, Number(entry.delay) || 14)
        };
      })
      .filter(Boolean);
  }

  function formatItemList(itemIds) {
    return itemIds
      .map((itemId) => {
        const item = findItem(itemId);
        return item ? item.name : itemId;
      })
      .join(', ');
  }

  function buildFallbackHints(scene) {
    if (!scene) {
      return [];
    }

    const hints = [];
    const seen = new Set();
    const visibleItems = getVisibleSceneItemIds(scene);
    const scenePuzzles = puzzles.filter((puzzle) =>
      !state.solvedPuzzles.includes(puzzle.id) && normalize(puzzle.scene) === normalize(scene.id)
    );

    function addHint(text, delay) {
      const normalizedText = String(text || '').trim();
      if (!normalizedText || seen.has(normalizedText)) {
        return;
      }

      seen.add(normalizedText);
      hints.push({
        text: normalizedText,
        delay: delay || 14
      });
    }

    if (visibleItems.length > 0) {
      addHint('There is still something useful here: ' + formatItemList(visibleItems) + '.', 10);
    }

    scenePuzzles.forEach((puzzle) => {
      const requiredItems = Array.isArray(puzzle.requires) ? puzzle.requires : [];
      const missingItems = requiredItems.filter((itemId) => !state.inventory.includes(itemId));
      const blockedExit = getBlockedExitConfig(puzzle);

      if (missingItems.length > 0) {
        addHint('You still need ' + formatItemList(missingItems) + ' to solve this room.', 14);
        return;
      }

      if (blockedExit) {
        addHint('You already have what this room needs. The ' + titleCase(blockedExit.direction) + ' path is tied to the current puzzle.', 14);
      }

      if (requiredItems.length > 0) {
        addHint('Try USE with ' + formatItemList(requiredItems) + ' in this room.', 12);
      }
    });

    if (state.activeCommand === 'use' && state.selectedItemId) {
      const selectedItem = findItem(state.selectedItemId);
      if (selectedItem) {
        addHint('Try ' + selectedItem.name + ' on a highlighted target in this scene.', 8);
      }
    }

    if (hints.length === 0) {
      const openExits = Object.keys(scene.exits || {}).filter((direction) => {
        if (!scene.exits[direction]) {
          return false;
        }

        return !getBlockingPuzzle(scene.id, direction);
      });

      if (openExits.length > 0) {
        addHint('If this room is spent, try another path: ' + openExits.map(titleCase).join(', ') + '.', 14);
      } else {
        addHint('Examine the current targets and look for a missing item or object clue.', 14);
      }
    }

    return hints;
  }

  function getHintsForScene(sceneId) {
    const explicitHints = getSceneHintEntries(sceneId);
    if (explicitHints.length > 0) {
      return explicitHints;
    }

    return buildFallbackHints(findScene(sceneId));
  }

  function showHint(sceneId, hintIndex) {
    if (!state.hintsEnabled || state.won || state.currentScene !== sceneId) {
      return;
    }

    const hints = getHintsForScene(sceneId);
    if (hintIndex >= hints.length) {
      return;
    }

    addSceneMessage(hints[hintIndex].text, 'hint');
    state.hintCursorByScene[sceneId] = hintIndex + 1;
    renderAll();
  }

  function startHintCycle(sceneId, immediate) {
    clearHintTimer();

    if (!state.hintsEnabled || state.won || !sceneId || state.currentScene !== sceneId) {
      return;
    }

    const hints = getHintsForScene(sceneId);
    const nextIndex = state.hintCursorByScene[sceneId] || 0;
    if (nextIndex >= hints.length) {
      return;
    }

    const delay = immediate ? 0 : Math.max(4, Number(hints[nextIndex].delay) || 14) * 1000;
    state.hintTimer = setTimeout(() => showHint(sceneId, nextIndex), delay);
  }

  function renderHintToggle() {
    if (!dom.hintToggle) {
      return;
    }

    dom.hintToggle.textContent = state.hintsEnabled ? 'HINTS: ON' : 'HINTS: OFF';
    dom.hintToggle.classList.toggle('active', state.hintsEnabled);
  }

  function renderCommandBar() {
    dom.commandButtons.forEach((button) => {
      button.classList.toggle('active', button.dataset.cmd === state.activeCommand);
    });

    if (!dom.commandStatus) {
      return;
    }

    if (state.won) {
      dom.commandStatus.textContent = 'Victory recorded. Choose BACK TO INDEX or PLAY AGAIN.';
      return;
    }

    if (state.activeCommand === 'use') {
      if (state.selectedItemId) {
        const selectedItem = findItem(state.selectedItemId);
        dom.commandStatus.textContent = 'USE ' + (selectedItem ? selectedItem.name : state.selectedItemId) + ' on a target.';
      } else {
        dom.commandStatus.textContent = 'USE mode: select an inventory item, then choose a target.';
      }
      return;
    }

    if (state.activeCommand === 'examine') {
      if (state.artPreview && state.artPreview.label) {
        dom.commandStatus.textContent = 'EXAMINE mode: previewing ' + state.artPreview.label + '.';
      } else {
        dom.commandStatus.textContent = 'EXAMINE mode: choose a target or inventory item for a close-up.';
      }
      return;
    }

    dom.commandStatus.textContent = state.activeCommand.toUpperCase() + ' mode: choose a target.';
  }

  function renderTargets(scene) {
    clearElement(dom.targetsBar);
    if (!dom.targetsBar) {
      return;
    }

    const buttons = [];
    const seen = new Set();
    const lookDescriptions = scene.lookDescriptions || {};
    const visibleItems = getVisibleSceneItemIds(scene);

    visibleItems.forEach((itemId) => {
      const item = findItem(itemId);
      if (!item) {
        return;
      }

      const key = 'item:' + itemId;
      seen.add(normalize(item.name));
      buttons.push({
        key,
        label: item.name,
        kind: 'item',
        itemId,
        description: item.description || ''
      });
    });

    Object.entries(lookDescriptions).forEach(([targetKey, description]) => {
      const normalizedLabel = normalize(targetKey);
      if (seen.has(normalizedLabel)) {
        return;
      }

      buttons.push({
        key: 'target:' + targetKey,
        label: titleCase(targetKey),
        kind: 'target',
        targetKey,
        description
      });
    });

    if (buttons.length === 0) {
      const empty = document.createElement('span');
      empty.className = 'empty-state';
      empty.textContent = 'Nothing interactive here yet.';
      dom.targetsBar.appendChild(empty);
      return;
    }

    buttons.forEach((target) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'target-btn' + (target.kind === 'item' ? ' target-item' : '');
      button.textContent = target.label;
      button.dataset.kind = target.kind;
      if (target.itemId) {
        button.dataset.itemId = target.itemId;
      }
      if (target.targetKey) {
        button.dataset.targetKey = target.targetKey;
      }

      button.addEventListener('click', () => handleTargetClick(target));
      dom.targetsBar.appendChild(button);
    });
  }

  function renderInventory() {
    clearElement(dom.inventoryBar);
    if (!dom.inventoryBar) {
      return;
    }

    if (state.inventory.length === 0) {
      const empty = document.createElement('span');
      empty.className = 'empty-state';
      empty.textContent = '(empty)';
      dom.inventoryBar.appendChild(empty);
      return;
    }

    state.inventory.forEach((itemId) => {
      const item = findItem(itemId);
      if (!item) {
        return;
      }

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'inv-item';
      button.textContent = item.name;
      button.title = item.description || item.name;
      button.classList.toggle('selected', state.selectedItemId === itemId);
      button.addEventListener('click', () => handleInventoryClick(itemId));
      dom.inventoryBar.appendChild(button);
    });
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
        blockedMessage: puzzle.blockedMessage || 'That way is blocked.'
      };
    }

    if (typeof puzzle.blocksExit === 'object') {
      if (!normalize(puzzle.blocksExit.direction)) {
        return null;
      }

      return {
        scene: puzzle.blocksExit.scene || puzzle.scene,
        direction: puzzle.blocksExit.direction,
        blockedMessage: puzzle.blocksExit.blockedMessage || puzzle.blockedMessage || 'That way is blocked.'
      };
    }

    return null;
  }

  function getBlockingPuzzle(sceneId, direction) {
    return puzzles.find((puzzle) => {
      if (state.solvedPuzzles.includes(puzzle.id)) {
        return false;
      }

      const blockedExit = getBlockedExitConfig(puzzle);
      if (!blockedExit) {
        return false;
      }

      return normalize(blockedExit.scene) === normalize(sceneId) &&
        normalize(blockedExit.direction) === normalize(direction);
    }) || null;
  }

  function canExit(sceneId, direction) {
    return !getBlockingPuzzle(sceneId, direction);
  }

  function renderExits(scene) {
    clearElement(dom.exitsBar);
    if (!dom.exitsBar) {
      return;
    }

    const exits = scene.exits || {};
    const directions = Object.keys(exits).filter((direction) => Boolean(exits[direction]));
    if (directions.length === 0) {
      const empty = document.createElement('span');
      empty.className = 'empty-state';
      empty.textContent = state.won ? 'No exits needed.' : 'No exits available.';
      dom.exitsBar.appendChild(empty);
      return;
    }

    directions.forEach((direction) => {
      const button = document.createElement('button');
      const blockedBy = getBlockingPuzzle(scene.id, direction);
      button.type = 'button';
      button.className = 'exit-btn' + (blockedBy ? ' blocked' : ' available');
      button.textContent = direction.replace(/[_-]+/g, ' ').toUpperCase();
      button.disabled = Boolean(blockedBy);
      button.addEventListener('click', () => {
        if (blockedBy) {
          return;
        }
        moveToExit(direction);
      });
      dom.exitsBar.appendChild(button);
    });
  }

  function renderAll() {
    const scene = currentScene();
    if (!scene) {
      return;
    }

    if (dom.sceneName) {
      dom.sceneName.textContent = scene.name.toUpperCase();
    }

    renderArt(scene);
    renderText(scene);
    renderCommandBar();
    renderHintToggle();
    renderTargets(scene);
    renderInventory();
    renderExits(scene);
    bindWinOverlayActions();

    if (state.won) {
      clearHintTimer();
      return;
    }

    startHintCycle(scene.id);
  }

  function requirementsMet(puzzle) {
    const requiredItems = puzzle.requires || [];
    return requiredItems.every((itemId) => state.inventory.includes(itemId));
  }

  function itemMatchesTarget(itemId, targetKey) {
    const item = findItem(itemId);
    if (!item) {
      return false;
    }

    const targetNormalized = normalize(targetKey);
    const usedOn = normalize(item.usedOn || '');
    if (usedOn && (usedOn === targetNormalized || usedOn.includes(targetNormalized) || targetNormalized.includes(usedOn))) {
      return true;
    }

    return false;
  }

  function puzzleMatchesTarget(puzzle, targetKey) {
    const targetNormalized = normalize(targetKey);
    if (!targetNormalized) {
      return false;
    }

    const candidateValues = [puzzle.target, puzzle.usedOn];
    (puzzle.requires || []).forEach((itemId) => {
      const item = findItem(itemId);
      if (item) {
        candidateValues.push(item.usedOn);
      }
    });

    return candidateValues.some((candidate) => {
      const normalizedCandidate = normalize(candidate);
      return normalizedCandidate && (
        normalizedCandidate === targetNormalized ||
        normalizedCandidate.includes(targetNormalized) ||
        targetNormalized.includes(normalizedCandidate)
      );
    });
  }

  function choosePuzzleForTarget(targetKey) {
    const scene = currentScene();
    if (!scene) {
      return null;
    }

    const scenePuzzles = puzzles.filter((puzzle) =>
      !state.solvedPuzzles.includes(puzzle.id) && normalize(puzzle.scene) === normalize(scene.id)
    );

    if (scenePuzzles.length === 0) {
      return null;
    }

    if (state.selectedItemId) {
      const directMatches = scenePuzzles.filter((puzzle) =>
        (puzzle.requires || []).includes(state.selectedItemId) && requirementsMet(puzzle) && puzzleMatchesTarget(puzzle, targetKey)
      );
      if (directMatches.length === 1) {
        return directMatches[0];
      }

      const selectedItemMatches = scenePuzzles.filter((puzzle) =>
        (puzzle.requires || []).includes(state.selectedItemId) && requirementsMet(puzzle)
      );
      if (selectedItemMatches.length === 1) {
        return selectedItemMatches[0];
      }
    }

    const targetMatches = scenePuzzles.filter((puzzle) => requirementsMet(puzzle) && puzzleMatchesTarget(puzzle, targetKey));
    if (targetMatches.length === 1) {
      return targetMatches[0];
    }

    const autoMatches = scenePuzzles.filter((puzzle) => requirementsMet(puzzle));
    if (autoMatches.length === 1) {
      return autoMatches[0];
    }

    return null;
  }

  function shouldWinAfterPuzzle(puzzle) {
    const resultText = String(puzzle.result || '');
    if (/\b(victory|you win|freedom)\b/i.test(resultText)) {
      return true;
    }

    if (winCondition.scene && normalize(winCondition.scene) === normalize(state.currentScene) && winRequirementsMet()) {
      return true;
    }

    if (winCondition.scene && !sceneMap.has(winCondition.scene) && winRequirementsMet()) {
      return true;
    }

    return false;
  }

  function winRequirementsMet() {
    const required = Array.isArray(winCondition.requires) ? winCondition.requires : [];
    return required.every((itemId) => state.inventory.includes(itemId));
  }

  function announceReveal(revealId) {
    if (itemMap.has(revealId)) {
      const item = findItem(revealId);
      addSceneMessage(item.name + ' is now accessible.', 'system');
      return;
    }

    if (sceneMap.has(revealId)) {
      const scene = findScene(revealId);
      addSceneMessage('A path to ' + scene.name + ' is now open.', 'system');
    }
  }

  function markWon(message) {
    if (state.won) {
      return;
    }

    state.won = true;
    state.winMessage = message || winCondition.description || 'You made it out alive.';
    clearHintTimer();
    recordCompletion();
    addSceneMessage(state.winMessage, 'success');
    renderAll();
  }

  function bindWinOverlayActions() {
    const resetButton = document.querySelector('[data-win-reset="true"]');
    if (!resetButton || resetButton.dataset.bound === 'true') {
      return;
    }

    resetButton.dataset.bound = 'true';
    resetButton.addEventListener('click', resetGame);
  }

  function moveToRevealedWinScene(puzzle) {
    const winSceneId = winCondition.scene;
    if (!winSceneId || !sceneMap.has(winSceneId)) {
      return;
    }

    if (!Array.isArray(puzzle.reveals) || !puzzle.reveals.includes(winSceneId)) {
      return;
    }

    state.currentScene = winSceneId;
    if (!state.visitedScenes.includes(winSceneId)) {
      state.visitedScenes.push(winSceneId);
    }
  }

  function solvePuzzle(puzzle) {
    if (state.solvedPuzzles.includes(puzzle.id)) {
      return;
    }

    state.solvedPuzzles.push(puzzle.id);
    triggerSolveFlash();
    addSceneMessage(puzzle.result || 'Something changes in the room.', 'success');

    (puzzle.reveals || []).forEach(announceReveal);
    state.selectedItemId = null;

    if (shouldWinAfterPuzzle(puzzle)) {
      moveToRevealedWinScene(puzzle);
      markWon(winCondition.description || puzzle.result || 'You survived.');
      return;
    }

    renderAll();
  }

  function takeItem(itemId) {
    const scene = currentScene();
    const visibleItemIds = scene ? getVisibleSceneItemIds(scene) : [];
    if (!visibleItemIds.includes(itemId)) {
      addSceneMessage('There is nothing here to take.', 'locked');
      renderAll();
      return;
    }

    const item = findItem(itemId);
    if (!item) {
      return;
    }

    state.inventory.push(itemId);
    addSceneMessage('Taken: ' + item.name + '.', 'success');

    const takeTriggeredPuzzle = puzzles.find((puzzle) =>
      !state.solvedPuzzles.includes(puzzle.id) &&
      normalize(puzzle.scene) === normalize(state.currentScene) &&
      (puzzle.requires || []).includes(itemId) &&
      /\b(take|get|pick up|acquire)\b/i.test(String(puzzle.action || ''))
    );

    if (takeTriggeredPuzzle && requirementsMet(takeTriggeredPuzzle)) {
      solvePuzzle(takeTriggeredPuzzle);
      return;
    }

    renderAll();
  }

  function describeTarget(target, showArtPreview) {
    if (showArtPreview) {
      if (target.kind === 'item') {
        setArtPreview(resolveArtPreview(target.itemId, 'item', target.label));
      } else {
        setArtPreview(resolveArtPreview(target.targetKey || target.label, 'item', target.label));
      }
    } else {
      clearArtPreview();
    }

    if (target.kind === 'item') {
      const item = findItem(target.itemId);
      addSceneMessage(item ? item.description || item.name : 'Nothing unusual.', 'system');
      renderAll();
      return;
    }

    addSceneMessage(target.description || 'Nothing unusual.', 'system');
    renderAll();
  }

  function handleTargetClick(target) {
    if (state.won) {
      return;
    }

    if (state.activeCommand === 'look') {
      describeTarget(target, false);
      return;
    }

    if (state.activeCommand === 'examine') {
      describeTarget(target, true);
      return;
    }

    if (state.activeCommand === 'take') {
      if (target.kind !== 'item') {
        addSceneMessage('You cannot take that.', 'locked');
        renderAll();
        return;
      }

      takeItem(target.itemId);
      return;
    }

    if (state.activeCommand === 'use') {
      const puzzle = choosePuzzleForTarget(target.targetKey || target.itemId || target.label);
      if (!state.selectedItemId && target.kind === 'item' && state.inventory.includes(target.itemId)) {
        state.selectedItemId = target.itemId;
        renderAll();
        return;
      }

      if (!puzzle) {
        addSceneMessage('Nothing useful happens.', 'locked');
        renderAll();
        return;
      }

      solvePuzzle(puzzle);
    }
  }

  function handleInventoryClick(itemId) {
    const item = findItem(itemId);
    if (!item) {
      return;
    }

    if (state.won) {
      return;
    }

    if (state.activeCommand === 'use') {
      state.selectedItemId = state.selectedItemId === itemId ? null : itemId;
      renderAll();
      return;
    }

    if (state.activeCommand === 'examine') {
      setArtPreview(resolveArtPreview(itemId, 'item', item.name));
      addSceneMessage(item.description || item.name, 'system');
      renderAll();
      return;
    }

    clearArtPreview();
    addSceneMessage(item.description || item.name, 'system');
    renderAll();
  }

  function moveToExit(direction) {
    const scene = currentScene();
    if (!scene || !scene.exits || !scene.exits[direction]) {
      return;
    }

    const blocker = getBlockingPuzzle(scene.id, direction);
    if (blocker) {
      const blockedExit = getBlockedExitConfig(blocker);
      addSceneMessage((blockedExit && blockedExit.blockedMessage) || 'That way is blocked.', 'locked');
      renderAll();
      return;
    }

    const targetSceneId = scene.exits[direction];
    if (!isSceneId(targetSceneId)) {
      if (winCondition.scene && normalize(winCondition.scene) === normalize(targetSceneId) && winRequirementsMet()) {
        markWon(winCondition.description || 'You escaped.');
      }
      return;
    }

    state.currentScene = targetSceneId;
    clearArtPreview();
    state.selectedItemId = null;
    clearSceneMessages();
    if (!state.visitedScenes.includes(targetSceneId)) {
      state.visitedScenes.push(targetSceneId);
    }

    renderAll();
    if (winCondition.scene && normalize(winCondition.scene) === normalize(targetSceneId) && winRequirementsMet()) {
      markWon(winCondition.description || 'You escaped.');
    }
  }

  function setActiveCommand(command) {
    state.activeCommand = command;
    if (command !== 'use') {
      state.selectedItemId = null;
    }
    if (command !== 'examine') {
      clearArtPreview();
    }
    renderAll();
  }

  function resetGame() {
    clearHintTimer();
    if (state.solveFlashTimer) {
      clearTimeout(state.solveFlashTimer);
      state.solveFlashTimer = null;
    }
    if (dom.artPanel) {
      dom.artPanel.classList.remove('solve-flash');
    }
    if (document.body) {
      document.body.classList.remove('solve-flash');
    }
    state.currentScene = gameData.scenes[0].id;
    state.inventory = [];
    state.solvedPuzzles = [];
    state.visitedScenes = [gameData.scenes[0].id];
    state.activeCommand = 'look';
    clearArtPreview();
    state.selectedItemId = null;
    state.sceneMessages = [];
    state.hintsEnabled = Boolean(gameData.hintsEnabledByDefault);
    state.hintCursorByScene = {};
    state.winMessage = '';
    state.won = false;
    renderAll();
  }

  function bindEvents() {
    dom.commandButtons.forEach((button) => {
      button.addEventListener('click', () => setActiveCommand(button.dataset.cmd));
    });

    if (dom.resetButton) {
      dom.resetButton.addEventListener('click', resetGame);
    }

    if (dom.hintToggle) {
      dom.hintToggle.addEventListener('click', () => {
        state.hintsEnabled = !state.hintsEnabled;
        if (!state.hintsEnabled) {
          clearHintTimer();
          renderAll();
          return;
        }

        state.hintCursorByScene[state.currentScene] = 0;
        renderAll();
        startHintCycle(state.currentScene, true);
      });
    }
  }

  bindEvents();
  renderAll();
})();