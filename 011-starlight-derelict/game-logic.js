// ============================================================
// STARLIGHT DERELICT - GAME LOGIC
// Produced by Gameplay Coder (Hex Corbin)
// ============================================================

// Game data will be embedded by the Game Assembler
const GAME_DATA = {}; // Replace with actual game-script.json contents

// ---- Game State ----
const state = {
  currentScene: 'airlock',
  inventory: [],
  solvedPuzzles: [],
  visitedScenes: ['airlock'],
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

// ---- Display Functions ----
function addText(text, cls = '') {
  const p = document.createElement('p');
  p.className = cls;
  p.innerHTML = text;
  textDisplay.appendChild(p);
  textDisplay.scrollTop = textDisplay.scrollHeight;
}

function clearText() { textDisplay.innerHTML = ''; }

function renderScene(sceneId) {
  const scene = GAME_DATA.scenes.find(s => s.id === sceneId);
  if (!scene) { addText('ERROR: Scene not found!', 'error'); return; }

  state.currentScene = sceneId;
  if (!state.visitedScenes.includes(sceneId)) state.visitedScenes.push(sceneId);

  // Update scene name
  sceneName.textContent = scene.name.toUpperCASE();

  // Update art
  const artKey = sceneId;
  let artHtml = null;
  if (typeof GAME_ART !== 'undefined' && GAME_ART[artKey]) {
    artHtml = GAME_ART[artKey];
  } else if (window.GAME_ART && window.GAME_ART[artKey]) {
    artHtml = window.GAME_ART[artKey];
  } else if (typeof GAME_ART !== 'undefined' && GAME_ART[sceneId]) {
    artHtml = GAME_ART[sceneId];
  } else if (window.GAME_ART && window.GAME_ART[sceneId]) {
    artHtml = window.GAME_ART[sceneId];
  }

  if (artHtml) {
    artDisplay.innerHTML = artHtml;
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

  // Show unsolved puzzles
  const scenePuzzles = (scene.puzzles || []).filter(pid =>
    !state.solvedPuzzles.includes(pid)
  );
  scenePuzzles.forEach(pid => {
    const puzzle = GAME_DATA.puzzles.find(p => p.id === pid);
    if (puzzle) {
      addText('There is something here that catches your attention...', 'system');
    }
  });

  // Render exits
  renderExits(scene.exits || {});

  // Render inventory
  renderInventory();

  // Check win condition
  checkWin();

  // Save state
  saveState();
}

function canExit(sceneId, direction) {
  const exit = GAME_DATA.scenes.find(s => s.id === sceneId)?.exits?.[direction];
  if (!exit) return false;
  
  // Check if any unsolved puzzle blocks this exit
  const blocker = GAME_DATA.puzzles.find(p =>
    p.blocksExit?.scene === sceneId &&
    p.blocksExit?.direction === direction &&
    !state.solvedPuzzles.includes(p.id)
  );
  
  if (blocker) {
    addText(`[The way ${direction} is blocked. ${blocker.blockedMessage || 'Something prevents you from going that way.'}]`, 'locked');
    return false;
  }
  
  return true;
}

function renderExits(exits) {
  exitsBar.innerHTML = '';
  const directions = ['north', 'south', 'east', 'west'];
  directions.forEach(dir => {
    const btn = document.createElement('button');
    btn.className = 'exit-btn' + (exits[dir] ? ' available' : '');
    btn.textContent = dir.toUpperCase();
    btn.disabled = !exits[dir];
    if (exits[dir] && canExit(state.currentScene, dir)) {
      btn.onclick = () => go(exits[dir]);
    }
    exitsBar.appendChild(btn);
  });
}

function renderInventory() {
  const items = invBar.querySelectorAll('.inv-item');
  items.forEach(el => el.remove());
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
      addText('Select an item from your inventory, then click what to use it on.', 'system');
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
    addText(`Selected: ${item.name}. Click USE, then a target.`, 'system');
  }
}

function takeItem(itemId) {
  if (state.inventory.includes(itemId)) return;
  const item = GAME_DATA.items.find(i => i.id === itemId);
  if (!item) return;
  const scene = GAME_DATA.scenes.find(s => s.id === state.currentScene);
  if (!scene || !(scene.items || []).includes(itemId)) return;

  state.inventory.push(itemId);
  addText(`You picked up: ${item.name} — ${item.description}`, 'success');
  renderInventory();
  saveState();
  
  // Apply item glow effect for newly acquired items
  setTimeout(() => {
    const itemElements = invBar.querySelectorAll('.inv-item');
    itemElements.forEach(el => {
      if (el.textContent === item.name) {
        el.classList.add('item-new');
        setTimeout(() => el.classList.remove('item-new'), 2000);
      }
    });
  }, 100);
}

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

function useItemOn(itemId, targetId) {
  const puzzle = GAME_DATA.puzzles.find(p =>
    p.scene === state.currentScene &&
    p.requires.includes(itemId) &&
    p.id === targetId &&
    !state.solvedPuzzles.includes(p.id)
  );

  if (puzzle && puzzle.requires.every(req => state.inventory.includes(req))) {
    state.solvedPuzzles.push(puzzle.id);
    addText(puzzle.result, 'success');
    
    // Apply puzzle solved flash effect
    artDisplay.classList.add('puzzle-solved');
    setTimeout(() => artDisplay.classList.remove('puzzle-solved'), 600);
    
    // Reveal items or unlock scenes
    (puzzle.reveals || []).forEach(revealId => {
      const revealItem = GAME_DATA.items.find(i => i.id === revealId);
      if (revealItem) {
        state.inventory.push(revealId);
        addText(`You found: ${revealItem.name}!`, 'success');
        
        // Apply item glow for newly revealed items
        setTimeout(() => {
          const itemElements = invBar.querySelectorAll('.inv-item');
          itemElements.forEach(el => {
            if (el.textContent === revealItem.name) {
              el.classList.add('item-new');
              setTimeout(() => el.classList.remove('item-new'), 2000);
            }
          });
        }, 100);
      }
    });
    
    renderInventory();
    
    // Update exit buttons for newly unlocked exits
    const exitButtons = exitsBar.querySelectorAll('.exit-btn');
    exitButtons.forEach(btn => {
      if (btn.classList.contains('available')) {
        btn.classList.add('newly-unlocked');
        setTimeout(() => btn.classList.remove('newly-unlocked'), 3000);
      }
    });
    
    checkWin();
    saveState();
  } else {
    addText("That doesn't seem to work.", 'system');
  }
}

function go(sceneId) {
  if (!canExit(state.currentScene, getDirectionToScene(sceneId))) {
    return; // canExit already shows the message
  }
  addText('---', 'system');
  renderScene(sceneId);
}

function getDirectionToScene(targetSceneId) {
  const currentScene = GAME_DATA.scenes.find(s => s.id === state.currentScene);
  if (!currentScene || !currentScene.exits) return null;
  
  for (const [direction, sceneId] of Object.entries(currentScene.exits)) {
    if (sceneId === targetSceneId) {
      return direction;
    }
  }
  return null;
}

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

// ---- Initialize ----
function init() {
  if (Object.keys(GAME_DATA).length === 0) {
    addText('ERROR: No game data loaded. This is a template file.', 'error');
    addText('The Gameplay Coder will embed game data here.', 'system');
    return;
  }

  addText('=== ' + GAME_DATA.title.toUpperCase() + ' ===', 'success');
  addText(GAME_DATA.setting, 'system');
  addText('', '');
  addText('Commands: LOOK | TAKE | USE | EXAMINE', 'system');
  addText('Click exits to move between rooms.', 'system');
  addText('---', 'system');

  if (!loadState()) {
    renderScene('airlock');
  } else {
    renderScene(state.currentScene);
    addText('[Game restored from save]', 'system');
  }
}

init();