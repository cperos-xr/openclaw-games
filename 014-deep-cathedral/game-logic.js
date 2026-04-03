// Deep Cathedral - Game Logic
// Hex Corbin's implementation

// Game state
const state = {
  currentScene: 'entrance-cavern',
  inventory: [],
  solvedPuzzles: [],
  visitedScenes: ['entrance-cavern'],
  gameOver: false,
  won: false
};

// Game data (will be loaded from the game-script.json)
let GAME_DATA = null;

// DOM elements
let artDisplay = null;
let textDisplay = null;
let exitBar = null;
let inventoryBar = null;
let verbMenu = null;

// Current verb
let currentVerb = 'LOOK';

// Initialize the game
function initGame(data) {
  GAME_DATA = data;
  
  // Get DOM elements
  artDisplay = document.getElementById('art-display');
  textDisplay = document.getElementById('text-display');
  exitBar = document.getElementById('exit-bar');
  inventoryBar = document.getElementById('inventory-bar');
  verbMenu = document.getElementById('verb-menu');
  
  // Set up verb buttons
  const verbs = ['LOOK', 'TAKE', 'USE', 'GO', 'EXAMINE'];
  verbs.forEach(verb => {
    const btn = document.createElement('button');
    btn.className = 'verb-btn';
    btn.textContent = verb;
    btn.addEventListener('click', () => selectVerb(verb));
    verbMenu.appendChild(btn);
  });
  
  // Add CSS for visual feedback
  addVisualEffects();
  
  // Render initial scene
  renderScene();
  updateExits();
  updateInventory();
}

// Add CSS for visual effects
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

// Select a verb
function selectVerb(verb) {
  currentVerb = verb;
  // Update verb button styling
  document.querySelectorAll('.verb-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === verb);
  });
}

// Render current scene
function renderScene() {
  const scene = GAME_DATA.scenes.find(s => s.id === state.currentScene);
  if (!scene) return;
  
  // Update art display
  artDisplay.innerHTML = '';
  const artImg = document.createElement('img');
  artImg.src = `art/${GAME_DATA.slug}-${scene.id}.png`;
  artImg.alt = scene.name;
  artImg.onerror = () => {
    artImg.src = 'art/placeholder.png';
  };
  artDisplay.appendChild(artImg);
  
  // Update text display
  textDisplay.innerHTML = '';
  
  // Scene name
  const nameEl = document.createElement('div');
  nameEl.className = 'scene-name';
  nameEl.textContent = scene.name;
  textDisplay.appendChild(nameEl);
  
  // Scene prose
  const proseEl = document.createElement('div');
  proseEl.className = 'scene-prose';
  proseEl.textContent = scene.prose;
  textDisplay.appendChild(proseEl);
  
  // Items in scene
  const itemsInScene = GAME_DATA.items.filter(item => 
    item.foundIn === state.currentScene && 
    !state.inventory.includes(item.id) &&
    !isItemRevealed(item.id)
  );
  
  if (itemsInScene.length > 0) {
    const itemsEl = document.createElement('div');
    itemsEl.className = 'scene-items';
    itemsEl.innerHTML = '<strong>Items visible:</strong><br>';
    itemsInScene.forEach(item => {
      const itemBtn = document.createElement('button');
      itemBtn.className = 'scene-item-btn';
      itemBtn.textContent = item.name;
      itemBtn.dataset.itemId = item.id;
      itemBtn.addEventListener('click', () => handleItemClick(item.id));
      itemsEl.appendChild(itemBtn);
      itemsEl.appendChild(document.createTextNode(' '));
    });
    textDisplay.appendChild(itemsEl);
  }
  
  // Mark scene as visited
  if (!state.visitedScenes.includes(state.currentScene)) {
    state.visitedScenes.push(state.currentScene);
  }
}

// Check if item has been revealed by a puzzle
function isItemRevealed(itemId) {
  return state.solvedPuzzles.some(puzzleId => {
    const puzzle = GAME_DATA.puzzles.find(p => p.id === puzzleId);
    return puzzle && puzzle.reveals && puzzle.reveals.includes(itemId);
  });
}

// Update exit buttons
function updateExits() {
  exitBar.innerHTML = '';
  const scene = GAME_DATA.scenes.find(s => s.id === state.currentScene);
  if (!scene) return;
  
  // Get all possible exits for this scene
  const allExits = scene.exits || {};
  
  // Check which exits are available (not blocked by unsolved puzzles)
  const availableExits = {};
  Object.keys(allExits).forEach(direction => {
    if (canExit(state.currentScene, direction)) {
      availableExits[direction] = allExits[direction];
    }
  });
  
  // Create exit buttons
  Object.keys(availableExits).forEach(direction => {
    const exitBtn = document.createElement('button');
    exitBtn.className = 'exit-btn';
    exitBtn.textContent = direction.toUpperCase();
    exitBtn.dataset.direction = direction;
    exitBtn.addEventListener('click', () => handleGo(direction));
    exitBar.appendChild(exitBtn);
  });
  
  // If no exits, show a message
  if (Object.keys(availableExits).length === 0) {
    const noExitMsg = document.createElement('div');
    noExitMsg.className = 'no-exits';
    noExitMsg.textContent = 'No exits available.';
    exitBar.appendChild(noExitMsg);
  }
}

// Check if player can exit in a direction
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

// Handle movement
function handleGo(direction) {
  if (state.gameOver) return;
  
  if (!canExit(state.currentScene, direction)) {
    return;
  }
  
  const scene = GAME_DATA.scenes.find(s => s.id === state.currentScene);
  const nextSceneId = scene.exits[direction];
  
  // Check if this leads to the win condition
  if (GAME_DATA.winCondition.scene && nextSceneId === GAME_DATA.winCondition.scene) {
    handleWin();
    return;
  }
  
  state.currentScene = nextSceneId;
  renderScene();
  updateExits();
  
  // Add navigation text
  const sceneName = GAME_DATA.scenes.find(s => s.id === state.currentScene)?.name;
  addText(`You swim ${direction} to ${sceneName}.`, 'navigation');
}

// Handle item click
function handleItemClick(itemId) {
  if (state.gameOver) return;
  
  const item = GAME_DATA.items.find(i => i.id === itemId);
  if (!item) return;
  
  switch (currentVerb) {
    case 'LOOK':
      addText(`You examine the ${item.name}. ${item.description}`, 'item');
      break;
    case 'TAKE':
      takeItem(itemId);
      break;
    case 'USE':
      // For now, just show that you need to select a target
      addText(`You hold the ${item.name}. Select a target to use it on.`, 'item');
      break;
    case 'EXAMINE':
      addText(`${item.description}`, 'item');
      break;
  }
}

// Take an item
function takeItem(itemId) {
  if (state.inventory.includes(itemId)) {
    addText(`You already have that.`, 'info');
    return;
  }
  
  const item = GAME_DATA.items.find(i => i.id === itemId);
  if (!item) return;
  
  state.inventory.push(itemId);
  addText(`You take the ${item.name}.`, 'success');
  updateInventory();
  renderScene(); // Update scene to remove taken item
  
  // Add item glow effect
  const itemBtn = document.querySelector(`.inventory-item-btn[data-item-id="${itemId}"]`);
  if (itemBtn) {
    itemBtn.classList.add('item-new');
    setTimeout(() => itemBtn.classList.remove('item-new'), 2000);
  }
}

// Update inventory display
function updateInventory() {
  inventoryBar.innerHTML = '';
  
  if (state.inventory.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'inventory-empty';
    emptyMsg.textContent = 'Inventory: empty';
    inventoryBar.appendChild(emptyMsg);
    return;
  }
  
  const invLabel = document.createElement('div');
  invLabel.className = 'inventory-label';
  invLabel.textContent = 'Inventory:';
  inventoryBar.appendChild(invLabel);
  
  state.inventory.forEach(itemId => {
    const item = GAME_DATA.items.find(i => i.id === itemId);
    if (!item) return;
    
    const itemBtn = document.createElement('button');
    itemBtn.className = 'inventory-item-btn';
    itemBtn.textContent = item.name;
    itemBtn.dataset.itemId = itemId;
    itemBtn.addEventListener('click', () => handleInventoryItemClick(itemId));
    inventoryBar.appendChild(itemBtn);
    inventoryBar.appendChild(document.createTextNode(' '));
  });
}

// Handle inventory item click
function handleInventoryItemClick(itemId) {
  if (state.gameOver) return;
  
  const item = GAME_DATA.items.find(i => i.id === itemId);
  if (!item) return;
  
  switch (currentVerb) {
    case 'LOOK':
      addText(`You examine the ${item.name}. ${item.description}`, 'item');
      break;
    case 'USE':
      // Try to use the item in the current scene
      useItemInScene(itemId);
      break;
    case 'EXAMINE':
      addText(`${item.description}`, 'item');
      break;
    default:
      addText(`You examine the ${item.name}. ${item.description}`, 'item');
  }
}

// Use an item in the current scene
function useItemInScene(itemId) {
  if (state.gameOver) return;
  
  // Find puzzles that can be solved in this scene with this item
  const puzzle = GAME_DATA.puzzles.find(p => 
    p.scene === state.currentScene && 
    p.requires.includes(itemId) &&
    !state.solvedPuzzles.includes(p.id)
  );
  
  if (puzzle) {
    solvePuzzle(puzzle.id);
    return;
  }
  
  // Check if item can be used on something in the scene
  const item = GAME_DATA.items.find(i => i.id === itemId);
  if (item && item.usedIn === state.currentScene) {
    // Find the puzzle that uses this item
    const usePuzzle = GAME_DATA.puzzles.find(p => 
      p.scene === state.currentScene && 
      p.requires.includes(itemId)
    );
    
    if (usePuzzle) {
      solvePuzzle(usePuzzle.id);
      return;
    }
  }
  
  addText(`You can't use the ${item.name} here.`, 'info');
}

// Solve a puzzle
function solvePuzzle(puzzleId) {
  if (state.solvedPuzzles.includes(puzzleId)) {
    addText(`You've already done that.`, 'info');
    return;
  }
  
  const puzzle = GAME_DATA.puzzles.find(p => p.id === puzzleId);
  if (!puzzle) return;
  
  // Add puzzle to solved list
  state.solvedPuzzles.push(puzzleId);
  
  // Show puzzle result
  addText(puzzle.result, 'puzzle');
  
  // Trigger visual effects
  if (artDisplay) {
    artDisplay.classList.add('puzzle-solved');
    setTimeout(() => artDisplay.classList.remove('puzzle-solved'), 600);
  }
  
  // Check if this reveals new items
  if (puzzle.reveals && puzzle.reveals.length > 0) {
    puzzle.reveals.forEach(revealedId => {
      const revealedItem = GAME_DATA.items.find(i => i.id === revealedId);
      if (revealedItem) {
        addText(`You discover: ${revealedItem.name}`, 'discovery');
      }
    });
    
    // Update scene to show new items
    setTimeout(() => {
      renderScene();
      updateExits();
    }, 600);
  } else {
    // Just update exits
    setTimeout(() => {
      updateExits();
    }, 600);
  }
  
  // Check if this was the final puzzle
  if (puzzleId === 'sleeping-beast') {
    setTimeout(() => {
      handleWin();
    }, 1000);
  }
}

// Handle win condition
function handleWin() {
  state.gameOver = true;
  state.won = true;
  
  // Clear display
  textDisplay.innerHTML = '';
  
  // Show win message
  const winTitle = document.createElement('div');
  winTitle.className = 'win-title';
  winTitle.textContent = 'VICTORY';
  textDisplay.appendChild(winTitle);
  
  const winText = document.createElement('div');
  winText.className = 'win-text';
  winText.textContent = GAME_DATA.winCondition.description;
  textDisplay.appendChild(winText);
  
  // Clear exits
  exitBar.innerHTML = '';
  
  // Add restart button
  const restartBtn = document.createElement('button');
  restartBtn.className = 'restart-btn';
  restartBtn.textContent = 'Play Again';
  restartBtn.addEventListener('click', () => {
    // Reset state
    state.currentScene = 'entrance-cavern';
    state.inventory = [];
    state.solvedPuzzles = [];
    state.visitedScenes = ['entrance-cavern'];
    state.gameOver = false;
    state.won = false;
    
    // Reset UI
    textDisplay.innerHTML = '';
    exitBar.innerHTML = '';
    
    // Re-render
    renderScene();
    updateExits();
    updateInventory();
  });
  textDisplay.appendChild(restartBtn);
}

// Add text to display
function addText(text, className = '') {
  const textEl = document.createElement('div');
  textEl.className = `game-text ${className}`;
  textEl.textContent = text;
  textDisplay.appendChild(textEl);
  textDisplay.scrollTop = textDisplay.scrollHeight;
}

// Handle keyboard input
function handleKeyDown(event) {
  if (state.gameOver) return;
  
  switch (event.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      handleGo('north');
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      handleGo('south');
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      handleGo('west');
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      handleGo('east');
      break;
    case 'l':
    case 'L':
      selectVerb('LOOK');
      break;
    case 't':
    case 'T':
      selectVerb('TAKE');
      break;
    case 'u':
    case 'U':
      selectVerb('USE');
      break;
    case 'g':
    case 'G':
      selectVerb('GO');
      break;
    case 'e':
    case 'E':
      selectVerb('EXAMINE');
      break;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Load game data
  fetch('game-script.json')
    .then(response => response.json())
    .then(data => {
      initGame(data);
      document.addEventListener('keydown', handleKeyDown);
    })
    .catch(error => {
      console.error('Failed to load game data:', error);
    });
});

// Export for testing
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
