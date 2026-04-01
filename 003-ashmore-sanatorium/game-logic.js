// ============================================================
// THE ASHMORE SANATORIUM — Game Logic
// Engine: Vanilla JS point-and-click adventure
// Author: Hex Corbin
// ============================================================

// ---- Game State ----
const state = {
  currentScene: 'foyer',
  inventory: [],
  solvedPuzzles: [],
  visitedScenes: ['foyer'],
  activeCommand: null,
  selectedItem: null,
  won: false
};

// ---- DOM References ----
const artDisplay = document.getElementById('art-display');
const sceneName = document.getElementById('scene-name');
const textDisplay = document.getElementById('text-display');
const invBar = document.getElementById('inventory-bar');
const exitsBar = document.getElementById('exits-bar');

// ---- Display Helpers ----
function addText(text, cls = '') {
  const p = document.createElement('p');
  p.className = cls;
  p.innerHTML = text;
  textDisplay.appendChild(p);
  textDisplay.scrollTop = textDisplay.scrollHeight;
}

function clearText() { textDisplay.innerHTML = ''; }

// ---- Visual Feedback: Puzzle Solved ----
function flashPuzzleSolved() {
  artDisplay.classList.add('puzzle-solved');
  setTimeout(() => artDisplay.classList.remove('puzzle-solved'), 600);
}

// ---- Visual Feedback: Item Glow ----
function flashItemNew() {
  const invItems = invBar.querySelectorAll('.inv-item');
  invItems.forEach(el => {
    el.classList.add('item-new');
    setTimeout(() => el.classList.remove('item-new'), 2000);
  });
}

// ---- Locked Exit Check ----
// CRITICAL: Every movement must call this first
function canExit(sceneId, direction) {
  const scene = GAME_DATA.scenes.find(s => s.id === sceneId);
  if (!scene || !scene.exits || !scene.exits[direction]) return false;

  // Check if any unsolved puzzle blocks this exit
  const blocker = GAME_DATA.puzzles.find(p =>
    p.blocksExit &&
    p.blocksExit.scene === sceneId &&
    p.blocksExit.direction === direction &&
    !state.solvedPuzzles.includes(p.id)
  );

  if (blocker) {
    const msg = blocker.blockedMessage || blocker.blocked ||
      'Something prevents you from going that way.';
    addText(`[The way ${direction} is blocked. ${msg}]`, 'locked');
    return false;
  }
  return true;
}

// ---- Scene Rendering ----
function renderScene(sceneId) {
  const scene = GAME_DATA.scenes.find(s => s.id === sceneId);
  if (!scene) { addText('ERROR: Scene not found!', 'error'); return; }

  state.currentScene = sceneId;
  if (!state.visitedScenes.includes(sceneId)) state.visitedScenes.push(sceneId);

  // Update scene name
  sceneName.textContent = scene.name.toUpperCase();

  // Update art
  const artKey = 'scene-' + sceneId.replace('scene-', '');
  if (window.GAME_ART && window.GAME_ART[artKey]) {
    artDisplay.innerHTML = window.GAME_ART[artKey];
  } else {
    artDisplay.innerHTML = '<span class="no-art">[ ' + scene.name.toUpperCase() + ' ]</span>';
  }

  // Display prose
  clearText();
  addText(scene.prose);

  // Show available items (not yet taken)
  const availableItems = (scene.items || []).filter(itemId =>
    !state.inventory.includes(itemId)
  );
  if (availableItems.length > 0) {
    const itemNames = availableItems.map(id => {
      const item = GAME_DATA.items.find(i => i.id === id);
      return item ? `<span class="look-target" data-look="${id}">${item.name}</span>` : id;
    });
    addText('You notice: ' + itemNames.join(', '), 'system');
  }

  // Show unsolved puzzles as interactive targets
  const scenePuzzles = (scene.puzzles || []).filter(pid =>
    !state.solvedPuzzles.includes(pid)
  );
  scenePuzzles.forEach(pid => {
    const puzzle = GAME_DATA.puzzles.find(p => p.id === pid);
    if (puzzle) {
      // Make the puzzle a clickable target for the USE command
      addText(`There is something here that catches your attention... <span class="look-target" data-look="${pid}">[investigate]</span>`, 'system');
    }
  });

  // Render exits (with locked/unlocked state)
  renderExits(scene.exits || {});

  // Render inventory
  renderInventory();

  // Check win condition
  checkWin();

  // Save state
  saveState();
}

// ---- Exit Rendering ----
function renderExits(exits) {
  exitsBar.innerHTML = '';
  const directions = ['north', 'south', 'east', 'west'];
  directions.forEach(dir => {
    const btn = document.createElement('button');
    const targetScene = exits[dir];
    const blocked = targetScene && !canExit(state.currentScene, dir);
    const available = targetScene && !blocked;

    btn.className = 'exit-btn' + (available ? ' available' : '');
    btn.textContent = dir.toUpperCase();
    btn.disabled = !available;

    if (available) {
      btn.onclick = () => go(targetScene);
    }
    exitsBar.appendChild(btn);
  });
}

// ---- Inventory Rendering ----
function renderInventory() {
  // Remove existing item elements (keep the label)
  const existing = invBar.querySelectorAll('.inv-item');
  existing.forEach(el => el.remove());
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
      el.textContent = item.name;
      el.onclick = () => selectItem(itemId);
      invBar.appendChild(el);
    });
  }
}

// ---- Command Handlers ----
function setCommand(cmd) {
  state.activeCommand = cmd;
  document.querySelectorAll('.cmd-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.cmd === cmd);
  });

  if (cmd === 'look') {
    const scene = GAME_DATA.scenes.find(s => s.id === state.currentScene);
    if (scene && scene.lookDescriptions) {
      const targets = Object.keys(scene.lookDescriptions);
      if (targets.length > 0) {
        addText('You can examine: ' + targets.map(t =>
          `<span class="look-target" data-look="${t}">${t}</span>`
        ).join(', '), 'system');
      }
    }
  } else if (cmd === 'use') {
    if (state.inventory.length > 0) {
      addText('Select an item from your inventory, then click USE, then a target.', 'system');
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

// ---- Item Selection ----
function selectItem(itemId) {
  state.selectedItem = state.selectedItem === itemId ? null : itemId;
  renderInventory();
  if (state.selectedItem) {
    const item = GAME_DATA.items.find(i => i.id === itemId);
    addText(`Selected: ${item.name}. Now choose a target or action.`, 'system');
  }
}

// ---- Take Item ----
function takeItem(itemId) {
  if (state.inventory.includes(itemId)) return;
  const item = GAME_DATA.items.find(i => i.id === itemId);
  if (!item) return;
  const scene = GAME_DATA.scenes.find(s => s.id === state.currentScene);
  if (!scene || !(scene.items || []).includes(itemId)) return;

  state.inventory.push(itemId);
  addText(`You picked up: ${item.name}`, 'success');
  renderInventory();
  flashItemNew();
  saveState();
}

// ---- Look At Target ----
function lookAt(target) {
  const scene = GAME_DATA.scenes.find(s => s.id === state.currentScene);
  if (scene && scene.lookDescriptions && scene.lookDescriptions[target]) {
    addText(scene.lookDescriptions[target]);
  } else {
    // Check if it's an item
    const item = GAME_DATA.items.find(i => i.id === target);
    if (item) {
      addText(item.description);
    } else {
      addText('Nothing interesting about that.', 'system');
    }
  }
}

// ---- Use Item On Target ----
function useItemOn(itemId, targetId) {
  // Find a puzzle in the current scene that:
  // 1. Requires this item
  // 2. Has not been solved yet
  // 3. The target matches the puzzle id (targetId should be the puzzle id from item's usedOn)
  const puzzle = GAME_DATA.puzzles.find(p =>
    p.scene === state.currentScene &&
    p.requires.includes(itemId) &&
    !state.solvedPuzzles.includes(p.id) &&
    p.id === targetId
  );

  if (puzzle && puzzle.requires.every(req => state.inventory.includes(req))) {
    state.solvedPuzzles.push(puzzle.id);
    addText(puzzle.result, 'success');
    flashPuzzleSolved();

    // Reveal items or unlock scenes
    (puzzle.reveals || []).forEach(revealId => {
      const revealItem = GAME_DATA.items.find(i => i.id === revealId);
      if (revealItem && !state.inventory.includes(revealId)) {
        state.inventory.push(revealId);
        addText(`You found: ${revealItem.name}!`, 'success');
      }
    });

    renderInventory();
    renderExits(GAME_DATA.scenes.find(s => s.id === state.currentScene).exits || {});
    flashItemNew();
    checkWin();
    saveState();
  } else {
    addText("That doesn't seem to work.", 'system');
  }
}

// ---- Movement ----
function go(sceneId) {
  if (!canExit(state.currentScene, Object.keys(GAME_DATA.scenes.find(s => s.id === state.currentScene).exits || {}).find(k => GAME_DATA.scenes.find(s => s.id === state.currentScene).exits[k] === sceneId))) {
    return;
  }
  addText('---', 'system');
  renderScene(sceneId);
}

// ---- Win Condition ----
function checkWin() {
  if (state.won) return;
  const wc = GAME_DATA.winCondition;
  if (!wc) return;
  if (state.currentScene === wc.scene &&
      wc.requires.every(req => state.inventory.includes(req))) {
    state.won = true;
    addText('', '');
    addText('*** ' + wc.description + ' ***', 'success');
    addText('', '');
    addText('CONGRATULATIONS! YOU HAVE COMPLETED THE GAME!', 'success');
    addText('Type /restart to play again.', 'system');
    flashPuzzleSolved();
  }
}

// ---- Persistence ----
function saveState() {
  try {
    localStorage.setItem('game-' + GAME_DATA.slug, JSON.stringify(state));
  } catch(e) {}
}

function loadState() {
  try {
    const saved = localStorage.getItem('game-' + GAME_DATA.slug);
    if (saved) {
      const s = JSON.parse(saved);
      Object.assign(state, s);
      return true;
    }
  } catch(e) {}
  return false;
}

// ---- Event Listeners ----
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

// ---- Special Command: Restart ----
document.addEventListener('keydown', (e) => {
  if (e.key === '/' || (e.ctrlKey && e.key === 'r')) {
    e.preventDefault();
    try {
      localStorage.removeItem('game-' + GAME_DATA.slug);
    } catch(err) {}
    location.reload();
  }
});

// ---- Initialize ----
function init() {
  if (Object.keys(GAME_DATA).length === 0) {
    addText('ERROR: No game data loaded.', 'error');
    return;
  }

  addText('=== ' + GAME_DATA.title.toUpperCase() + ' ===', 'success');
  addText(GAME_DATA.setting, 'system');
  addText('', '');
  addText('Commands: LOOK | TAKE | USE | EXAMINE', 'system');
  addText('Click exits to move between rooms.', 'system');
  addText('---', 'system');

  if (!loadState()) {
    renderScene('foyer');
  } else {
    renderScene(state.currentScene);
    addText('[Game restored from save]', 'system');
  }
}

init();
