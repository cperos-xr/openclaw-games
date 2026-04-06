// Haunted Library Horror - Game Logic
// Hex Corbin

// ======================
// Game State
// ======================
const state = {
  currentScene: null,
  inventory: [],
  solvedPuzzles: [],
  visitedScenes: [],
  selectedItem: null,
  won: false,
  lastExitDirections: [] // for exit animation
};

let currentVerb = 'look';
let GAME_DATA = null;

// ======================
// DOM References
// ======================
let artDisplay, sceneNameEl, textDisplay, commandBar, exitBar, inventoryBar, invEmpty;

// ======================
// Initialization
// ======================
function init(data) {
  GAME_DATA = data;
  
  // Cache DOM elements
  cacheDOM();
  
  // Setup command buttons
  setupCommandButtons();
  
  // Add visual effects CSS
  addVisualEffectsCSS();
  
  // Initial text
  if (Object.keys(GAME_DATA).length === 0) {
    addText('ERROR: No game data loaded.', 'error');
    return;
  }
  addText('=== ' + GAME_DATA.title.toUpperCase() + ' ===', 'success');
  addText(GAME_DATA.setting, 'system');
  addText('');
  addText('Commands: LOOK | TAKE | USE | EXAMINE', 'system');
  addText('Click exit buttons to move.', 'system');
  addText('---', 'system');
  
  // Load saved state or start fresh
  if (loadState()) {
    renderScene(state.currentScene);
  } else {
    // Start at first defined scene
    state.currentScene = GAME_DATA.scenes[0].id;
    renderScene(state.currentScene);
  }
  
  // Event delegation for text clicks (items and look targets)
  textDisplay.addEventListener('click', handleTextClick);
}

function cacheDOM() {
  artDisplay = document.getElementById('art-display');
  sceneNameEl = document.getElementById('scene-name');
  textDisplay = document.getElementById('text-display');
  commandBar = document.getElementById('command-bar');
  exitBar = document.getElementById('exits-bar');
  inventoryBar = document.getElementById('inventory-bar');
  invEmpty = document.getElementById('inv-empty');
}

// ======================
// Command Buttons
// ======================
function setupCommandButtons() {
  const verbs = [
    { id: 'look', label: 'LOOK' },
    { id: 'take', label: 'TAKE' },
    { id: 'use', label: 'USE' },
    { id: 'examine', label: 'EXAMINE' }
  ];
  verbs.forEach(verb => {
    const btn = document.createElement('button');
    btn.className = 'cmd-btn';
    btn.textContent = verb.label;
    btn.dataset.verb = verb.id;
    btn.addEventListener('click', () => setVerb(verb.id));
    commandBar.appendChild(btn);
  });
}

function setVerb(verb) {
  currentVerb = verb;
  commandBar.querySelectorAll('.cmd-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.verb === verb);
  });
  // Deselect item if not using USE
  if (verb !== 'use' && state.selectedItem) {
    state.selectedItem = null;
    renderInventory();
  }
}

// ======================
// Rendering
// ======================
function renderScene(sceneId) {
  const scene = GAME_DATA.scenes.find(s => s.id === sceneId);
  if (!scene) {
    addText(`[ERROR: Scene '${sceneId}' not found!]`, 'error');
    return;
  }
  
  state.currentScene = sceneId;
  if (!state.visitedScenes.includes(sceneId)) state.visitedScenes.push(sceneId);
  
  // Scene name
  sceneNameEl.textContent = scene.name.toUpperCase();
  
  // Art display
  if (artDisplay) {
    if (typeof GAME_ART !== 'undefined' && GAME_ART[sceneId]) {
      artDisplay.innerHTML = GAME_ART[sceneId];
    } else if (window.GAME_ART && window.GAME_ART[sceneId]) {
      artDisplay.innerHTML = window.GAME_ART[sceneId];
    } else {
      artDisplay.innerHTML = `<span class="no-art">[NO ART: ${scene.name}]</span>`;
    }
  }
  
  // Clear and show prose
  clearText();
  addText(scene.prose);
  
  // Visible items (not yet taken)
  const sceneItemIds = (scene.items || []).filter(id => !state.inventory.includes(id));
  if (sceneItemIds.length > 0) {
    const itemButtons = sceneItemIds.map(id => {
      const item = GAME_DATA.items.find(i => i.id === id);
      return item ? `<button class="scene-item" data-item-id="${id}">${item.name}</button>` : id;
    }).join(', ');
    addText(`You see: ${itemButtons}`, 'system');
  }
  
  // Look descriptions
  if (scene.lookDescriptions) {
    Object.keys(scene.lookDescriptions).forEach(key => {
      addText(`<button class="look-target" data-look="${key}">${key}</button>`);
    });
  }
  
  // Update exits and inventory
  updateExits();
  renderInventory();
  
  // Win check
  checkWin();
  
  // Save state
  saveState();
}

function clearText() {
  textDisplay.innerHTML = '';
}

function addText(html, className = '') {
  const p = document.createElement('p');
  if (className) p.className = className;
  if (typeof html === 'string' && html.includes('<')) {
    p.innerHTML = html;
  } else {
    p.textContent = html;
  }
  textDisplay.appendChild(p);
  textDisplay.scrollTop = textDisplay.scrollHeight;
}

// ======================
// Exits
// ======================
function updateExits() {
  const scene = GAME_DATA.scenes.find(s => s.id === state.currentScene);
  if (!scene) return;
  
  exitBar.innerHTML = '';
  const directions = ['north','south','east','west','up','down','northeast','northwest','southeast','southwest'];
  const exits = scene.exits || {};
  const currentAvailable = [];
  
  directions.forEach(dir => {
    if (exits[dir]) {
      if (canExit(state.currentScene, dir)) {
        currentAvailable.push(dir);
        const btn = document.createElement('button');
        btn.className = 'exit-btn available';
        btn.textContent = dir.toUpperCase();
        btn.dataset.direction = dir;
        btn.addEventListener('click', () => go(dir));
        if (!state.lastExitDirections.includes(dir)) {
          btn.classList.add('newly-unlocked');
        }
        exitBar.appendChild(btn);
      }
    }
  });
  
  state.lastExitDirections = currentAvailable;
}

function canExit(sceneId, direction) {
  const sceneObj = GAME_DATA.scenes.find(s => s.id === sceneId);
  if (!sceneObj || !sceneObj.exits || !sceneObj.exits[direction]) return false;
  
  const blocker = GAME_DATA.puzzles.find(p =>
    p.blocksExit &&
    p.blocksExit.scene === sceneId &&
    p.blocksExit.direction === direction &&
    !state.solvedPuzzles.includes(p.id)
  );
  
  if (blocker) {
    addText(`[The way ${direction} is blocked. ${blocker.blockedMessage || 'Something prevents you from going that way.'}]`, 'locked');
    return false;
  }
  
  return true;
}

function go(direction) {
  if (state.won) return;
  
  if (!canExit(state.currentScene, direction)) return;
  
  const scene = GAME_DATA.scenes.find(s => s.id === state.currentScene);
  const nextSceneId = scene.exits[direction];
  if (!nextSceneId) return;
  
  state.currentScene = nextSceneId;
  addText(`You go ${direction}.`, 'navigation');
  renderScene(nextSceneId);
}

// ======================
// Inventory
// ======================
function renderInventory() {
  // Remove old item elements (keep label and empty)
  const oldItems = inventoryBar.querySelectorAll('.inv-item, .inv-label');
  oldItems.forEach(el => el.remove());
  
  if (state.inventory.length === 0) {
    invEmpty.style.display = '';
    return;
  }
  
  invEmpty.style.display = 'none';
  
  const label = document.createElement('span');
  label.className = 'inv-label';
  label.textContent = 'Inventory:';
  inventoryBar.appendChild(label);
  
  state.inventory.forEach(itemId => {
    const item = GAME_DATA.items.find(i => i.id === itemId);
    if (!item) return;
    const btn = document.createElement('button');
    btn.className = 'inv-item' + (state.selectedItem === itemId ? ' selected' : '');
    btn.textContent = item.name;
    btn.dataset.itemId = itemId;
    btn.addEventListener('click', () => handleInventoryClick(itemId));
    inventoryBar.appendChild(btn);
  });
}

function handleInventoryClick(itemId) {
  if (currentVerb === 'use') {
    attemptUseItem(itemId);
  } else {
    if (currentVerb === 'look' || currentVerb === 'examine') {
      examineItem(itemId);
    } else {
      // Toggle selection
      state.selectedItem = state.selectedItem === itemId ? null : itemId;
      renderInventory();
    }
  }
}

// ======================
// Interaction Handlers
// ======================
function handleTextClick(e) {
  const target = e.target;
  
  // Scene item click
  if (target.classList.contains('scene-item') || target.dataset.itemId) {
    const itemId = target.dataset.itemId;
    if (!itemId) return;
    
    if (currentVerb === 'look' || currentVerb === 'examine') {
      examineItem(itemId);
    } else if (currentVerb === 'take') {
      takeItem(itemId);
    }
    // USE not supported for scene items directly; must use inventory
    return;
  }
  
  // Look target click
  if (target.classList.contains('look-target') || target.dataset.look) {
    const lookKey = target.dataset.look;
    if (currentVerb === 'look' || currentVerb === 'examine') {
      examineLook(lookKey);
    } else if (currentVerb === 'use') {
      // Not typical; ignore or hint
      addText('Select an item from inventory, then use it here.', 'system');
    }
  }
}

function examineItem(itemId) {
  const item = GAME_DATA.items.find(i => i.id === itemId);
  if (item) {
    addText(item.description);
  } else {
    addText('You see nothing special.', 'system');
  }
}

function examineLook(lookKey) {
  const scene = GAME_DATA.scenes.find(s => s.id === state.currentScene);
  if (scene && scene.lookDescriptions && scene.lookDescriptions[lookKey]) {
    addText(scene.lookDescriptions[lookKey]);
  } else {
    addText('You see nothing special about that.', 'system');
  }
}

function takeItem(itemId) {
  if (state.inventory.includes(itemId)) {
    addText('You already have that.', 'system');
    return;
  }
  const scene = GAME_DATA.scenes.find(s => s.id === state.currentScene);
  if (!scene || !(scene.items || []).includes(itemId)) {
    addText('That\'s not here.', 'system');
    return;
  }
  const item = GAME_DATA.items.find(i => i.id === itemId);
  if (!item) return;
  
  state.inventory.push(itemId);
  addText(`You take the ${item.name}.`, 'success');
  
  // Re-render scene to remove item, and inventory to show new item
  renderScene(state.currentScene);
  // Inventory already updated in renderScene; we need to highlight new item
  setTimeout(() => {
    const btn = inventoryBar.querySelector(`.inv-item[data-item-id="${itemId}"]`);
    if (btn) btn.classList.add('item-new');
  }, 0);
  setTimeout(() => {
    const btn = inventoryBar.querySelector(`.inv-item[data-item-id="${itemId}"]`);
    if (btn) btn.classList.remove('item-new');
  }, 2000);
  
  saveState();
}

// ======================
// Puzzle Solving
// ======================
function attemptUseItem(itemId) {
  const puzzle = GAME_DATA.puzzles.find(p =>
    p.scene === state.currentScene &&
    p.requires.includes(itemId) &&
    !state.solvedPuzzles.includes(p.id)
  );
  
  if (puzzle) {
    // Check all required items are in inventory
    if (puzzle.requires.every(req => state.inventory.includes(req))) {
      solvePuzzle(puzzle.id);
      state.selectedItem = null;
      renderInventory();
    } else {
      addText(`You need all required items to solve this.`, 'system');
    }
  } else {
    addText(`You can't use the ${GAME_DATA.items.find(i=>i.id===itemId).name} here.`, 'system');
  }
}

function solvePuzzle(puzzleId) {
  if (state.solvedPuzzles.includes(puzzleId)) return;
  
  const puzzle = GAME_DATA.puzzles.find(p => p.id === puzzleId);
  if (!puzzle) return;
  
  state.solvedPuzzles.push(puzzleId);
  addText(puzzle.result, 'success');
  
  // Visual flash on art
  artDisplay.classList.add('puzzle-solved');
  setTimeout(() => artDisplay.classList.remove('puzzle-solved'), 600);
  
  // Process reveals
  if (puzzle.reveals) {
    puzzle.reveals.forEach(rid => {
      const item = GAME_DATA.items.find(i => i.id === rid);
      if (item) {
        if (!state.inventory.includes(rid)) {
          state.inventory.push(rid);
          addText(`You found: ${item.name}!`, 'discovery');
        }
      } else {
        // Not an item (e.g., truth-revealed). Add to inventory as a marker.
        if (!state.inventory.includes(rid)) {
          state.inventory.push(rid);
          addText(`You obtain: ${rid}.`, 'discovery');
        }
      }
    });
    // Render inventory to show new items and apply glow
    setTimeout(() => {
      renderInventory();
      puzzle.reveals.forEach(rid => {
        const btn = inventoryBar.querySelector(`.inv-item[data-item-id="${rid}"]`);
        if (btn) {
          btn.classList.add('item-new');
          setTimeout(() => btn.classList.remove('item-new'), 2000);
        }
      });
    }, 0);
  }
  
  // Update exits (may unlock blocked exits)
  updateExits();
  
  // Check win condition
  checkWin();
  
  saveState();
}

// ======================
// Win Condition
// ======================
function checkWin() {
  if (state.won) return;
  const wc = GAME_DATA.winCondition;
  if (!wc) return;
  if (state.currentScene === wc.scene && wc.requires.every(req => state.inventory.includes(req))) {
    state.won = true;
    setTimeout(() => {
      addText('');
      addText('*** ' + wc.description + ' ***', 'success');
      addText('CONGRATULATIONS!', 'success');
      addText('Refresh to play again.', 'system');
    }, 500);
  }
}

// ======================
// Visual Effects CSS
// ======================
function addVisualEffectsCSS() {
  const style = document.createElement('style');
  style.textContent = `
    .puzzle-solved { animation: solveFlash 0.6s ease; }
    @keyframes solveFlash { 0%,100%{filter:none} 50%{filter:brightness(2) saturate(2)} }
    .exit-btn.newly-unlocked { animation: unlockPulse 1s ease 3; }
    @keyframes unlockPulse { 0%,100%{border-color:#33ff33} 50%{border-color:#ffff33;box-shadow:0 0 12px #ffff33} }
    .item-new { animation: itemGlow 1s ease 2; }
    @keyframes itemGlow { 0%,100%{box-shadow:none} 50%{box-shadow:0 0 16px #33ff33} }
  `;
  document.head.appendChild(style);
}

// ======================
// Persistence
// ======================
function saveState() {
  try {
    const save = {
      currentScene: state.currentScene,
      inventory: state.inventory,
      solvedPuzzles: state.solvedPuzzles,
      visitedScenes: state.visitedScenes,
      won: state.won
    };
    localStorage.setItem('game-' + GAME_DATA.slug, JSON.stringify(save));
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

// ======================
// Bootstrap
// ======================
document.addEventListener('DOMContentLoaded', () => {
  if (typeof GAME_DATA !== 'undefined' && GAME_DATA !== null) {
    init(GAME_DATA);
  } else {
    // Fallback: try to load game-script.json (should not be needed in production)
    fetch('game-script.json')
      .then(r => r.json())
      .then(data => {
        init(data);
      })
      .catch(err => {
        console.error('Game data not found', err);
        addText('ERROR: Game data not loaded.', 'error');
      });
  }
});
