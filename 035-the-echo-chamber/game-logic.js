// The Echo Chamber - Game Logic
// Implemented by Hex Corbin (subagent)

// Game state
const state = {
  currentScene: 'lobby', // start scene
  inventory: [],
  solvedPuzzles: [],
  visitedScenes: ['lobby'],
  gameOver: false,
  won: false
};

let GAME_DATA = null; // will hold the loaded JSON script

// DOM references (filled in initGame)
let artDisplay = null;
let textDisplay = null;
let exitBar = null;
let inventoryBar = null;
let verbMenu = null;

// Current verb (default LOOK)
let currentVerb = 'LOOK';

// ---------------------------------------------------------------------------
// Initialization
function initGame(data) {
  GAME_DATA = data;
  // Grab required DOM elements (must match template IDs)
  artDisplay = document.getElementById('art-display');
  textDisplay = document.getElementById('text-display');
  exitBar = document.getElementById('exit-bar');
  inventoryBar = document.getElementById('inventory-bar');
  verbMenu = document.getElementById('verb-menu');

  // Verb buttons (LOOK, TAKE, USE, GO, EXAMINE)
  const verbs = ['LOOK', 'TAKE', 'USE', 'GO', 'EXAMINE'];
  verbs.forEach(v => {
    const btn = document.createElement('button');
    btn.className = 'verb-btn';
    btn.textContent = v;
    btn.addEventListener('click', () => selectVerb(v));
    verbMenu.appendChild(btn);
  });

  addVisualEffects();
  renderScene();
  updateExits();
  updateInventory();
}

// ---------------------------------------------------------------------------
// Visual feedback required by the style guide
function addVisualEffects() {
  const style = document.createElement('style');
  style.textContent = `
    .puzzle-solved { animation: solveFlash 0.6s ease; }
    @keyframes solveFlash { 0%,100%{filter:none} 50%{filter:brightness(2) saturate(2)} }
    .exit-btn.newly-unlocked { animation: unlockPulse 1s ease 3; }
    @keyframes unlockPulse { 0%,100%{border-color:#33ff33} 50%{border-color:#ffff33;box-shadow:0 0 12px #ffff33} }
    .item-new { animation: itemGlow 1s ease 2; }
    @keyframes itemGlow { 0%,100%{background:transparent} 50%{background:rgba(51,255,51,0.3)} }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Verb handling
function selectVerb(v) {
  currentVerb = v;
  // Highlight active verb button
  document.querySelectorAll('.verb-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === v);
  });
}

// ---------------------------------------------------------------------------
// Rendering current scene
function renderScene() {
  const scene = GAME_DATA.scenes.find(s => s.id === state.currentScene);
  if (!scene) return;

  // --- Art ---
  artDisplay.innerHTML = '';
  const img = document.createElement('img');
  img.src = `art/${GAME_DATA.slug}-${scene.id}.png`;
  img.alt = scene.name;
  img.onerror = () => { img.src = 'art/placeholder.png'; };
  artDisplay.appendChild(img);

  // --- Text ---
  textDisplay.innerHTML = '';
  const nameEl = document.createElement('div');
  nameEl.className = 'scene-name';
  nameEl.textContent = scene.name;
  textDisplay.appendChild(nameEl);

  const proseEl = document.createElement('div');
  proseEl.className = 'scene-prose';
  proseEl.textContent = scene.prose;
  textDisplay.appendChild(proseEl);

  // Items visible in the scene (not taken, not consumed)
  const visibleItems = GAME_DATA.items.filter(item => {
    const foundHere = item.foundIn === state.currentScene;
    const inInventory = state.inventory.includes(item.id);
    // Check if the item has been consumed (removed) by a solved puzzle
    const consumed = state.solvedPuzzles.some(pId => {
      const p = GAME_DATA.puzzles.find(pz => pz.id === pId);
      return p && p.consumes && p.consumes.includes(item.id);
    });
    return foundHere && !inInventory && !consumed;
  });

  if (visibleItems.length) {
    const itemsDiv = document.createElement('div');
    itemsDiv.className = 'scene-items';
    itemsDiv.innerHTML = '<strong>Items visible:</strong> ';
    visibleItems.forEach(it => {
      const btn = document.createElement('button');
      btn.className = 'scene-item-btn';
      btn.textContent = it.name;
      btn.dataset.itemId = it.id;
      btn.addEventListener('click', () => handleItemClick(it.id));
      itemsDiv.appendChild(btn);
      itemsDiv.appendChild(document.createTextNode(' '));
    });
    textDisplay.appendChild(itemsDiv);
  }

  // Mark scene as visited
  if (!state.visitedScenes.includes(state.currentScene)) {
    state.visitedScenes.push(state.currentScene);
  }
}

// ---------------------------------------------------------------------------
// Exit handling (including locked exits)
function canExit(sceneId, direction) {
  const target = GAME_DATA.scenes.find(s => s.id === sceneId)?.exits?.[direction];
  if (!target) return false;

  // Look for any unsolved puzzle that blocks this exit
  const blocker = GAME_DATA.puzzles.find(p => {
    if (state.solvedPuzzles.includes(p.id)) return false;
    if (!p.blocksExit) return false;
    // Style 1: explicit scene+direction fields
    if (p.blocksExit.scene && p.blocksExit.direction) {
      return p.blocksExit.scene === sceneId && p.blocksExit.direction === direction;
    }
    // Style 2: map of direction -> message (used by badge puzzle)
    if (p.scene === sceneId && typeof p.blocksExit === 'object' && p.blocksExit[direction]) {
      return true;
    }
    return false;
  });

  if (blocker) {
    // Determine message
    let msg = '';
    if (blocker.blockedMessage) {
      msg = blocker.blockedMessage;
    } else if (blocker.blocksExit && typeof blocker.blocksExit === 'object') {
      msg = blocker.blocksExit[direction] || '';
    }
    addText(`[The way ${direction} is blocked. ${msg}]`, 'locked');
    return false;
  }
  return true;
}

function updateExits() {
  exitBar.innerHTML = '';
  const scene = GAME_DATA.scenes.find(s => s.id === state.currentScene);
  if (!scene) return;
  const exits = scene.exits || {};

  Object.keys(exits).forEach(dir => {
    if (canExit(state.currentScene, dir)) {
      const btn = document.createElement('button');
      btn.className = 'exit-btn';
      btn.textContent = dir.toUpperCase();
      btn.dataset.direction = dir;
      btn.addEventListener('click', () => handleGo(dir));
      exitBar.appendChild(btn);
    }
  });

  if (!exitBar.hasChildNodes()) {
    const msg = document.createElement('div');
    msg.textContent = 'No exits available.';
    exitBar.appendChild(msg);
  }
}

function handleGo(direction) {
  if (state.gameOver) return;
  if (!canExit(state.currentScene, direction)) return;

  const scene = GAME_DATA.scenes.find(s => s.id === state.currentScene);
  const next = scene.exits[direction];

  // Check win condition if next scene is win scene and puzzle defines winCondition
  const winPuzzle = GAME_DATA.puzzles.find(p => p.winCondition && p.scene === state.currentScene && p.id && state.solvedPuzzles.includes(p.id));
  if (winPuzzle) {
    // already solved win puzzle – handled in solvePuzzle
  }

  state.currentScene = next;
  renderScene();
  updateExits();
  updateInventory();
  const targetName = GAME_DATA.scenes.find(s => s.id === next)?.name || next;
  addText(`You go ${direction} to ${targetName}.`, 'navigation');
}

// ---------------------------------------------------------------------------
// Inventory handling
function updateInventory() {
  inventoryBar.innerHTML = '';
  if (state.inventory.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'inventory-empty';
    empty.textContent = 'Inventory: empty';
    inventoryBar.appendChild(empty);
    return;
  }
  const label = document.createElement('div');
  label.className = 'inventory-label';
  label.textContent = 'Inventory:';
  inventoryBar.appendChild(label);
  state.inventory.forEach(id => {
    const item = GAME_DATA.items.find(i => i.id === id);
    if (!item) return;
    const btn = document.createElement('button');
    btn.className = 'inventory-item-btn';
    btn.textContent = item.name;
    btn.dataset.itemId = id;
    btn.addEventListener('click', () => handleInventoryItemClick(id));
    inventoryBar.appendChild(btn);
    inventoryBar.appendChild(document.createTextNode(' '));
  });
}

// ---------------------------------------------------------------------------
// Item interaction (scene items)
function handleItemClick(itemId) {
  if (state.gameOver) return;
  const item = GAME_DATA.items.find(i => i.id === itemId);
  if (!item) return;
  switch (currentVerb) {
    case 'LOOK':
      addText(`You look at the ${item.name}. ${item.description}`, 'item');
      break;
    case 'TAKE':
      takeItem(itemId);
      break;
    case 'USE':
      addText(`You hold the ${item.name}. Choose a target to use it on.`, 'item');
      break;
    case 'EXAMINE':
      addText(item.description, 'item');
      break;
    default:
      addText(`You look at the ${item.name}. ${item.description}`, 'item');
  }
}

function takeItem(itemId) {
  if (state.inventory.includes(itemId)) {
    addText('You already have that.', 'info');
    return;
  }
  const item = GAME_DATA.items.find(i => i.id === itemId);
  if (!item) return;
  state.inventory.push(itemId);
  addText(`You take the ${item.name}.`, 'success');
  // Visual cue in inventory
  setTimeout(() => {
    const btn = document.querySelector(`.inventory-item-btn[data-item-id="${itemId}"]`);
    if (btn) btn.classList.add('item-new');
  }, 0);
  setTimeout(() => {
    const btn = document.querySelector(`.inventory-item-btn[data-item-id="${itemId}"]`);
    if (btn) btn.classList.remove('item-new');
  }, 2000);
  renderScene();
  updateInventory();
}

// ---------------------------------------------------------------------------
// Inventory item click handling
function handleInventoryItemClick(itemId) {
  if (state.gameOver) return;
  const item = GAME_DATA.items.find(i => i.id === itemId);
  if (!item) return;
  switch (currentVerb) {
    case 'LOOK':
      addText(`You look at the ${item.name}. ${item.description}`, 'item');
      break;
    case 'USE':
      useItemInScene(itemId);
      break;
    case 'EXAMINE':
      addText(item.description, 'item');
      break;
    default:
      addText(`You look at the ${item.name}. ${item.description}`, 'item');
  }
}

// ---------------------------------------------------------------------------
// Using an item in the current scene
function useItemInScene(itemId) {
  if (state.gameOver) return;
  // Find a puzzle in this scene that requires this item and is unsolved
  const puzzle = GAME_DATA.puzzles.find(p => {
    return p.scene === state.currentScene &&
      p.requires && p.requires.includes(itemId) &&
      !state.solvedPuzzles.includes(p.id);
  });
  if (puzzle) {
    solvePuzzle(puzzle.id);
    return;
  }
  addText("You can't use that here.", 'info');
}

// ---------------------------------------------------------------------------
// Puzzle solving
function solvePuzzle(puzzleId) {
  if (state.solvedPuzzles.includes(puzzleId)) {
    addText('Already solved.', 'info');
    return;
  }
  const puzzle = GAME_DATA.puzzles.find(p => p.id === puzzleId);
  if (!puzzle) return;
  // Verify we have required items (already checked when called via useItemInScene)
  // Consume required items if listed in consumes
  if (puzzle.consumes && puzzle.consumes.length) {
    state.inventory = state.inventory.filter(id => !puzzle.consumes.includes(id));
    updateInventory();
  }
  state.solvedPuzzles.push(puzzleId);
  // Show result text (use description if result missing)
  const resultText = puzzle.result || puzzle.description || '';
  addText(resultText, 'puzzle');
  // Visual flash
  if (artDisplay) {
    artDisplay.classList.add('puzzle-solved');
    setTimeout(() => artDisplay.classList.remove('puzzle-solved'), 600);
  }
  // Reveal any new items (if reveals present)
  if (puzzle.reveals && puzzle.reveals.length) {
    puzzle.reveals.forEach(rid => {
      const it = GAME_DATA.items.find(i => i.id === rid);
      if (it) addText(`You discover: ${it.name}`, 'discovery');
    });
  }
  // Check win condition
  if (puzzle.winCondition) {
    handleWin();
    return;
  }
  // Refresh UI
  setTimeout(() => {
    renderScene();
    updateExits();
  }, 600);
}

// ---------------------------------------------------------------------------
// Win handling
function handleWin() {
  state.gameOver = true;
  state.won = true;
  textDisplay.innerHTML = '';
  const winTitle = document.createElement('div');
  winTitle.className = 'win-title';
  winTitle.textContent = 'VICTORY';
  textDisplay.appendChild(winTitle);
  const winDesc = document.createElement('div');
  winDesc.className = 'win-text';
  const desc = (GAME_DATA.winCondition && GAME_DATA.winCondition.description) || 'You have completed the game.';
  winDesc.textContent = desc;
  textDisplay.appendChild(winDesc);
  exitBar.innerHTML = '';
  const restart = document.createElement('button');
  restart.className = 'restart-btn';
  restart.textContent = 'Play Again';
  restart.addEventListener('click', () => {
    // Reset state to initial values
    state.currentScene = 'lobby';
    state.inventory = [];
    state.solvedPuzzles = [];
    state.visitedScenes = ['lobby'];
    state.gameOver = false;
    state.won = false;
    textDisplay.innerHTML = '';
    exitBar.innerHTML = '';
    renderScene();
    updateExits();
    updateInventory();
    addText('Game restarted.', 'info');
  });
  textDisplay.appendChild(restart);
}

// ---------------------------------------------------------------------------
// Utility for adding text to the display
function addText(txt, cls = '') {
  const div = document.createElement('div');
  div.className = `game-text ${cls}`.trim();
  div.textContent = txt;
  textDisplay.appendChild(div);
  textDisplay.scrollTop = textDisplay.scrollHeight;
}

// ---------------------------------------------------------------------------
// Keyboard shortcuts (WASD + arrow keys)
function handleKeyDown(e) {
  if (state.gameOver) return;
  switch (e.key) {
    case 'ArrowUp': case 'w': case 'W': handleGo('north'); break;
    case 'ArrowDown': case 's': case 'S': handleGo('south'); break;
    case 'ArrowLeft': case 'a': case 'A': handleGo('west'); break;
    case 'ArrowRight': case 'd': case 'D': handleGo('east'); break;
    case 'l': case 'L': selectVerb('LOOK'); break;
    case 't': case 'T': selectVerb('TAKE'); break;
    case 'u': case 'U': selectVerb('USE'); break;
    case 'g': case 'G': selectVerb('GO'); break;
    case 'e': case 'E': selectVerb('EXAMINE'); break;
  }
}

// ---------------------------------------------------------------------------
// Load the script data and start the game
document.addEventListener('DOMContentLoaded', () => {
  fetch('game-script.json')
    .then(r => r.json())
    .then(data => {
      initGame(data);
      document.addEventListener('keydown', handleKeyDown);
    })
    .catch(err => console.error('Failed to load game data:', err));
});

// Export for unit testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    state,
    initGame,
    handleGo,
    takeItem,
    useItemInScene,
    solvePuzzle,
    canExit,
    selectVerb,
    renderScene,
    updateExits,
    updateInventory,
    addText
  };
}
