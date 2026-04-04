// game-logic.js for 030-the-midnight-arcade
// Engine by Hex Corbin
// Data-driven from game-script.json

// The global GAME_DATA and GAME_ART must be defined before this script runs.
// GAME_DATA: { title, slug, scenes[], items[], puzzles[], winCondition }
// GAME_ART: optional map of scene IDs to HTML/SVG art.

// Game State
const state = {
  currentScene: 'exterior', // default, will be overridden by load or first scene
  inventory: [],
  solvedPuzzles: [],
  visitedScenes: [],
  activeCommand: null,
  selectedItem: null,
  won: false,
  // Transient UI state
  newlyUnlockedExit: null,
  newItems: []
};

// DOM element cache
const artDisplay = document.getElementById('art-display');
const sceneNameEl = document.getElementById('scene-name');
const textDisplay = document.getElementById('text-display');
const invBar = document.getElementById('inventory-bar');
const exitsBar = document.getElementById('exits-bar');

// ==================================================
// Utility Functions
// ==================================================

function addText(text, cls = '') {
  const p = document.createElement('p');
  p.className = cls;
  p.innerHTML = text;
  textDisplay.appendChild(p);
  textDisplay.scrollTop = textDisplay.scrollHeight;
}

function clearText() {
  textDisplay.innerHTML = '';
}

// ==================================================
// Rendering
// ==================================================

function renderScene(sceneId) {
  const scene = GAME_DATA.scenes.find(s => s.id === sceneId);
  if (!scene) {
    addText('ERROR: Scene not found!', 'error');
    return;
  }

  state.currentScene = sceneId;
  if (!state.visitedScenes.includes(sceneId)) {
    state.visitedScenes.push(sceneId);
  }

  // Scene name
  sceneNameEl.textContent = scene.name.toUpperCase();

  // Art
  let artHtml = null;
  if (typeof GAME_ART !== 'undefined') {
    if (GAME_ART[sceneId]) artHtml = GAME_ART[sceneId];
    else if (GAME_ART['scene-' + sceneId]) artHtml = GAME_ART['scene-' + sceneId];
  }
  if (artHtml) {
    artDisplay.innerHTML = artHtml;
  } else {
    artDisplay.innerHTML = '<span class="no-art">[ ' + scene.name.toUpperCase() + ' ]</span>';
  }

  // Prose
  clearText();
  addText(scene.prose);

  // Items present in the scene that haven't been taken
  const availableItems = (scene.items || []).filter(itemId => !state.inventory.includes(itemId));
  if (availableItems.length > 0) {
    const itemSpans = availableItems.map(id => {
      const item = GAME_DATA.items.find(i => i.id === id);
      return item ? `<span class="look-target" data-look="${id}">${item.name}</span>` : id;
    });
    addText('You notice: ' + itemSpans.join(', '), 'system');
  }

  // Exits
  renderExits(scene.exits || {});

  // Inventory
  renderInventory();

  // Win check
  checkWin();

  // Save
  saveState();
}

function renderExits(exits) {
  exitsBar.innerHTML = '';
  const directions = ['north', 'south', 'east', 'west'];
  directions.forEach(dir => {
    const btn = document.createElement('button');
    const hasExit = !!exits[dir];
    if (hasExit) {
      const blocked = isExitBlocked(state.currentScene, dir);
      btn.className = 'exit-btn' + (blocked ? ' locked' : ' available');
      btn.disabled = blocked;
      if (!blocked) {
        btn.onclick = () => go(dir);
      } else {
        // Tooltip
        const blocker = getBlockingPuzzle(state.currentScene, dir);
        let tip = 'The way is blocked.';
        if (blocker) {
          if (typeof blocker.blocksExit === 'object' && blocker.blocksExit.blockedMessage) {
            tip = blocker.blocksExit.blockedMessage;
          }
        }
        btn.title = tip;
      }
    } else {
      btn.className = 'exit-btn';
      btn.disabled = true;
    }
    btn.textContent = dir.toUpperCase();
    if (!btn.disabled && state.newlyUnlockedExit === dir) {
      btn.classList.add('newly-unlocked');
      state.newlyUnlockedExit = null;
    }
    exitsBar.appendChild(btn);
  });
}

function renderInventory() {
  // Remove old inventory items
  invBar.querySelectorAll('.inv-item').forEach(el => el.remove());
  const empty = document.getElementById('inv-empty');

  if (state.inventory.length === 0) {
    empty.style.display = '';
  } else {
    empty.style.display = 'none';
    state.inventory.forEach(itemId => {
      const item = GAME_DATA.items.find(i => i.id === itemId);
      if (!item) return;
      const el = document.createElement('span');
      el.className = 'inv-item' + (state.selectedItem === itemId ? ' selected' : '');
      if (state.newItems.includes(itemId)) {
        el.classList.add('item-new');
      }
      el.textContent = item.name;
      el.onclick = () => selectItem(itemId);
      invBar.appendChild(el);
    });
    // Reset new items glow flag
    state.newItems = [];
  }
}

// ==================================================
// Command Handling
// ==================================================

function setCommand(cmd) {
  state.activeCommand = cmd;
  document.querySelectorAll('.cmd-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cmd === cmd);
  });

  if (cmd === 'look' || cmd === 'examine') {
    const scene = GAME_DATA.scenes.find(s => s.id === state.currentScene);
    if (scene && scene.lookDescriptions) {
      const targets = Object.keys(scene.lookDescriptions);
      if (targets.length > 0) {
        addText('You can examine: ' + targets.map(t =>
          `<span class="look-target" data-look="${t}">${t.replace(/-/g, ' ')}</span>`
        ).join(', '), 'system');
      }
    }
  } else if (cmd === 'use') {
    if (state.inventory.length > 0) {
      addText('Select an item from your inventory, then click on an object in the scene.', 'system');
    } else {
      addText('You have nothing to use.', 'system');
    }
  } else if (cmd === 'take') {
    const scene = GAME_DATA.scenes.find(s => s.id === state.currentScene);
    const available = (scene.items || []).filter(id => !state.inventory.includes(id));
    if (available.length > 0) {
      available.forEach(id => takeItem(id));
    } else {
      addText('Nothing here to take.', 'system');
    }
  }
}

function selectItem(itemId) {
  state.selectedItem = state.selectedItem === itemId ? null : itemId;
  renderInventory();
  if (state.selectedItem) {
    const item = GAME_DATA.items.find(i => i.id === itemId);
    addText(`Selected: ${item.name}. Click USE, then click on an object.`, 'system');
  }
}

function takeItem(itemId) {
  if (state.inventory.includes(itemId)) return;
  const item = GAME_DATA.items.find(i => i.id === itemId);
  if (!item) return;
  const scene = GAME_DATA.scenes.find(s => s.id === state.currentScene);
  if (!scene || !(scene.items || []).includes(itemId)) return;

  state.inventory.push(itemId);
  addText(`You picked up: ${item.name}`, 'success');
  renderInventory();
  saveState();
}

function lookAt(target) {
  const scene = GAME_DATA.scenes.find(s => s.id === state.currentScene);
  if (scene && scene.lookDescriptions && scene.lookDescriptions[target]) {
    addText(scene.lookDescriptions[target]);
  } else {
    const item = GAME_DATA.items.find(i => i.id === target);
    if (item) {
      addText(item.description);
    } else {
      addText('You see nothing special.', 'system');
    }
  }
}

function useItemOn(itemId, targetId) {
  const item = GAME_DATA.items.find(i => i.id === itemId);
  if (!item) return;

  // Find the puzzle via item.usedOn
  const puzzleId = item.usedOn;
  if (!puzzleId) {
    addText("That doesn't seem to do anything.", 'system');
    return;
  }
  const puzzle = GAME_DATA.puzzles.find(p => p.id === puzzleId);
  if (!puzzle) {
    addText("That doesn't seem to do anything.", 'system');
    return;
  }

  // Validate scene
  if (puzzle.scene !== state.currentScene) {
    addText("You can't use that here.", 'system');
    return;
  }

  // Already solved?
  if (state.solvedPuzzles.includes(puzzle.id)) {
    addText("You already did that.", 'system');
    return;
  }

  // Check requirements
  if (!puzzle.requires.every(req => state.inventory.includes(req))) {
    addText("You're missing something needed.", 'system');
    return;
  }

  // Solve puzzle
  state.solvedPuzzles.push(puzzle.id);
  addText(puzzle.result, 'success');

  // Visual flash
  artDisplay.classList.add('puzzle-solved');
  setTimeout(() => artDisplay.classList.remove('puzzle-solved'), 600);

  // Reveal items
  if (puzzle.reveals && puzzle.reveals.length > 0) {
    puzzle.reveals.forEach(rid => {
      const revealItem = GAME_DATA.items.find(i => i.id === rid);
      if (revealItem) {
        state.inventory.push(rid);
        state.newItems.push(rid);
        addText(`You found: ${revealItem.name}!`, 'success');
      }
    });
  }

  // Unlock exit if blocked
  if (puzzle.blocksExit) {
    let blockDir, blockScene;
    if (typeof puzzle.blocksExit === 'string') {
      blockDir = puzzle.blocksExit;
      blockScene = puzzle.scene;
    } else if (typeof puzzle.blocksExit === 'object') {
      blockDir = puzzle.blocksExit.direction;
      blockScene = puzzle.blocksExit.scene;
    }
    if (blockDir && blockScene === state.currentScene) {
      state.newlyUnlockedExit = blockDir;
    }
  }

  // Update UI
  renderInventory();
  renderExits(GAME_DATA.scenes.find(s => s.id === state.currentScene).exits || {});

  checkWin();
  saveState();
}

function go(direction) {
  const scene = GAME_DATA.scenes.find(s => s.id === state.currentScene);
  if (!scene) return;
  const targetId = scene.exits[direction];
  if (!targetId) {
    addText("You can't go that way.", 'system');
    return;
  }

  // Check if blocked
  if (isExitBlocked(state.currentScene, direction)) {
    const blocker = getBlockingPuzzle(state.currentScene, direction);
    let msg = 'Something prevents you from going that way.';
    if (blocker) {
      if (typeof blocker.blocksExit === 'object' && blocker.blocksExit.blockedMessage) {
        msg = blocker.blocksExit.blockedMessage;
      }
    }
    addText(`[The way ${direction} is blocked. ${msg}]`, 'locked');
    return;
  }

  addText('---', 'system');
  renderScene(targetId);
}

// ==================================================
// Helpers
// ==================================================

function isExitBlocked(sceneId, direction) {
  return !!getBlockingPuzzle(sceneId, direction);
}

function getBlockingPuzzle(sceneId, direction) {
  return GAME_DATA.puzzles.find(p => {
    if (state.solvedPuzzles.includes(p.id)) return false;
    let blockDir, blockScene;
    if (typeof p.blocksExit === 'string') {
      blockDir = p.blocksExit;
      blockScene = p.scene;
    } else if (typeof p.blocksExit === 'object') {
      blockDir = p.blocksExit.direction;
      blockScene = p.blocksExit.scene;
    } else {
      return false;
    }
    return blockScene === sceneId && blockDir === direction;
  });
}

function checkWin() {
  if (state.won) return;
  const wc = GAME_DATA.winCondition;
  if (!wc) return;
  if (state.currentScene === wc.scene && wc.requires.every(req => state.inventory.includes(req))) {
    state.won = true;
    addText('', '');
    addText('*** ' + wc.description + ' ***', 'success');
    addText('', '');
    addText('CONGRATULIONS! YOU HAVE COMPLETED THE GAME!', 'success');
    addText('Type /restart to play again.', 'system');
  }
}

// ==================================================
// Persistence
// ==================================================

function saveState() {
  try {
    const data = {
      currentScene: state.currentScene,
      inventory: state.inventory,
      solvedPuzzles: state.solvedPuzzles,
      visitedScenes: state.visitedScenes,
      won: state.won
    };
    localStorage.setItem('game-' + GAME_DATA.slug, JSON.stringify(data));
  } catch (e) {}
}

function loadState() {
  try {
    const saved = localStorage.getItem('game-' + GAME_DATA.slug);
    if (saved) {
      const s = JSON.parse(saved);
      state.currentScene = s.currentScene;
      state.inventory = s.inventory;
      state.solvedPuzzles = s.solvedPuzzles;
      state.visitedScenes = s.visitedScenes;
      state.won = s.won || false;
      return true;
    }
  } catch (e) {}
  return false;
}

// ==================================================
// Event Listeners
// ==================================================

document.querySelectorAll('.cmd-btn').forEach(btn => {
  btn.onclick = () => setCommand(btn.dataset.cmd);
});

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('look-target')) {
    const target = e.target.dataset.look;
    if (state.activeCommand === 'use' && state.selectedItem) {
      useItemOn(state.selectedItem, target);
    } else {
      lookAt(target);
    }
  }
});

// ==================================================
// Initialization
// ==================================================

function init() {
  if (typeof GAME_DATA === 'undefined' || !GAME_DATA.title) {
    addText('ERROR: GAME_DATA is missing. The game cannot start.', 'error');
    return;
  }

  addText('=== ' + GAME_DATA.title.toUpperCase() + ' ===', 'success');
  if (GAME_DATA.setting) {
    addText(GAME_DATA.setting, 'system');
  }
  addText('');
  addText('Commands: LOOK | TAKE | USE | EXAMINE', 'system');
  addText('Click exits to move between rooms.', 'system');
  addText('---', 'system');

  if (!loadState()) {
    // Determine starting scene: first scene in list
    const startScene = (GAME_DATA.scenes && GAME_DATA.scenes[0]) ? GAME_DATA.scenes[0].id : null;
    if (startScene) {
      renderScene(startScene);
    } else {
      addText('No scenes defined in GAME_DATA.', 'error');
    }
  } else {
    renderScene(state.currentScene);
    addText('[Game restored from save]', 'system');
  }
}

init();