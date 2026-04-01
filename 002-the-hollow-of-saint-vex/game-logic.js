/**
 * THE HOLLOW OF SAINT VEX — Game Logic (v2 Fixed)
 * Fixed by Valerius — proper puzzle resolution with target validation
 */

const state = {
  currentScene: 'scene-1-entrance',
  inventory: [],
  solvedPuzzles: [],
  visitedScenes: ['scene-1-entrance'],
  activeCommand: null,
  selectedItem: null,
  won: false
};

const artDisplay = document.getElementById('art-display');
const sceneName = document.getElementById('scene-name');
const textDisplay = document.getElementById('text-display');
const invBar = document.getElementById('inventory-bar');
const exitsBar = document.getElementById('exits-bar');

function addText(text, cls = '') {
  const p = document.createElement('p');
  p.className = cls;
  p.innerHTML = text;
  textDisplay.appendChild(p);
  textDisplay.scrollTop = textDisplay.scrollHeight;
}

function clearText() { textDisplay.innerHTML = ''; }

// Find a puzzle in current scene that can be solved with the given item(s)
function findSolvablePuzzle(itemId) {
  return GAME_DATA.puzzles.find(p =>
    p.scene === state.currentScene &&
    !state.solvedPuzzles.includes(p.id) &&
    p.requires.includes(itemId) &&
    p.requires.every(req => state.inventory.includes(req))
  );
}

// Check if any puzzle blocks an exit from the current scene
function isExitBlocked(sceneId, direction) {
  return GAME_DATA.puzzles.some(p =>
    p.scene === sceneId &&
    p.blocksExit &&
    p.blocksExit.direction === direction &&
    !state.solvedPuzzles.includes(p.id)
  );
}

// Get the blocked message for an exit
function getBlockedMessage(sceneId, direction) {
  const puzzle = GAME_DATA.puzzles.find(p =>
    p.scene === sceneId &&
    p.blocksExit &&
    p.blocksExit.direction === direction &&
    !state.solvedPuzzles.includes(p.id)
  );
  return puzzle ? (puzzle.blocksExit.blockedMessage || 'Something blocks the way.') : '';
}

function renderScene(sceneId) {
  const scene = GAME_DATA.scenes.find(s => s.id === sceneId);
  if (!scene) { addText('ERROR: Scene not found!', 'error'); return; }

  state.currentScene = sceneId;
  if (!state.visitedScenes.includes(sceneId)) state.visitedScenes.push(sceneId);

  sceneName.textContent = scene.name.toUpperCase();

  if (window.GAME_ART && window.GAME_ART[sceneId]) {
    artDisplay.innerHTML = window.GAME_ART[sceneId];
  } else {
    artDisplay.innerHTML = `<span class="no-art">[ ${scene.name.toUpperCase()} ]</span>`;
  }

  clearText();
  addText(scene.prose);

  const availableItems = (scene.items || []).filter(itemId => !state.inventory.includes(itemId));
  if (availableItems.length > 0) {
    const itemLinks = availableItems.map(id => {
      const item = GAME_DATA.items.find(i => i.id === id);
      return `<span class="look-target" data-look="${id}">${item.name}</span>`;
    });
    addText('You notice: ' + itemLinks.join(', '), 'system');
  }

  if (scene.lookDescriptions) {
    addText('You can also examine: ' + Object.keys(scene.lookDescriptions).map(t => 
      `<span class="look-target" data-look="${t}">${t}</span>`
    ).join(', '), 'system');
  }

  renderExits(scene.exits || {});
  renderInventory();
  checkWin();
}

function renderExits(exits) {
  exitsBar.innerHTML = '';
  ['north', 'south', 'east', 'west'].forEach(dir => {
    const targetId = exits[dir];
    const blocked = targetId && isExitBlocked(state.currentScene, dir);
    const btn = document.createElement('button');
    btn.className = 'exit-btn' + (targetId && !blocked ? ' available' : '');
    btn.textContent = dir.toUpperCase();
    btn.disabled = !targetId || blocked;
    if (blocked) {
      btn.title = getBlockedMessage(state.currentScene, dir);
    }
    if (targetId && !blocked) {
      btn.onclick = () => { addText('---', 'system'); renderScene(targetId); };
    }
    exitsBar.appendChild(btn);
  });
}

function renderInventory() {
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

function selectItem(itemId) {
  state.selectedItem = (state.selectedItem === itemId) ? null : itemId;
  renderInventory();
  if (state.selectedItem) {
    const item = GAME_DATA.items.find(i => i.id === itemId);
    addText(`Selected: ${item.name}. Ready to USE.`, 'system');
  }
}

function handleCommand(cmd) {
  state.activeCommand = cmd;
  document.querySelectorAll('.cmd-btn').forEach(b => b.classList.toggle('active', b.dataset.cmd === cmd));
  
  if (cmd === 'take') {
    const scene = GAME_DATA.scenes.find(s => s.id === state.currentScene);
    const available = (scene.items || []).filter(id => !state.inventory.includes(id));
    if (available.length > 0) {
      available.forEach(id => {
        if (!state.inventory.includes(id)) {
          state.inventory.push(id);
          const item = GAME_DATA.items.find(i => i.id === id);
          addText(`Taken: ${item.name}`, 'success');
        }
      });
      renderInventory();
      renderScene(state.currentScene);
    } else {
      addText('Nothing here to take.', 'system');
    }
  } else if (cmd === 'use') {
    if (state.inventory.length > 0) {
      addText('Select an item from inventory, then click a target in the scene.', 'system');
    } else {
      addText('You have nothing to use.', 'system');
    }
  }
}

function lookAt(target) {
  const scene = GAME_DATA.scenes.find(s => s.id === state.currentScene);
  if (scene.lookDescriptions && scene.lookDescriptions[target]) {
    addText(scene.lookDescriptions[target]);
  } else {
    const item = GAME_DATA.items.find(i => i.id === target || i.name.toLowerCase() === target.toLowerCase());
    if (item) addText(item.description);
    else addText("You don't see anything special about that.");
  }
}

// Main use handler — called when player clicks a look-target while in USE mode
function useItemOn(targetId) {
  if (!state.selectedItem) {
    addText('Select an item from your inventory first.', 'system');
    return;
  }

  const item = GAME_DATA.items.find(i => i.id === state.selectedItem);
  const puzzle = findSolvablePuzzle(state.selectedItem);

  if (puzzle) {
    // Special handling for the bell puzzle (requires all bells + book)
    if (puzzle.id === 'puzzle-ring-bells') {
      if (puzzle.requires.every(req => state.inventory.includes(req))) {
        state.solvedPuzzles.push(puzzle.id);
        addText(puzzle.result, 'success');
      } else {
        addText("You have some of the bells, but the ritual requires the full set and the book.", 'system');
        return;
      }
    } else {
      state.solvedPuzzles.push(puzzle.id);
      addText(puzzle.result, 'success');

      // Reveal items or scenes
      (puzzle.reveals || []).forEach(rid => {
        const revealItem = GAME_DATA.items.find(i => i.id === rid);
        if (revealItem && !state.inventory.includes(rid)) {
          state.inventory.push(rid);
          addText(`You found: ${revealItem.name}`, 'success');
        }
      });
    }
    renderScene(state.currentScene);
  } else {
    // No matching puzzle — show description of what they clicked
    addText(`Using ${item.name} here doesn't seem to work.`, 'system');
    lookAt(targetId);
  }
}

function checkWin() {
  const wc = GAME_DATA.winCondition;
  if (state.currentScene === wc.scene && 
      wc.requires.every(r => state.inventory.includes(r)) && 
      state.solvedPuzzles.includes('puzzle-ring-bells')) {
    state.won = true;
    addText('*** ' + wc.description + ' ***', 'success');
  }
}

// Command buttons
document.querySelectorAll('.cmd-btn').forEach(btn => btn.onclick = () => handleCommand(btn.dataset.cmd));

// Click handler for look-targets
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('look-target')) {
    const target = e.target.dataset.look;
    if (state.activeCommand === 'use' && state.selectedItem) {
      useItemOn(target);
    } else {
      lookAt(target);
    }
  }
});

function init() {
  addText(`=== ${GAME_DATA.title.toUpperCase()} ===`, 'success');
  renderScene('scene-1-entrance');
}

window.onload = init;
