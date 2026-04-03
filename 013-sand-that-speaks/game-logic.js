/**
 * The Sand That Speaks - Game Logic
 * A Mystery House-style point-and-click adventure
 * 
 * Game data and state machine for navigating an ancient Egyptian pyramid.
 * The sand whispers secrets. The statues watch. Something ancient has awoken.
 */

// ============================================================
// GAME DATA - Loaded from game-script.json structure
// ============================================================
const GAME_DATA = {
  title: "The Sand That Speaks",
  slug: "sand-that-speaks",
  startScene: "entrance-passage",

  scenes: [
    {
      id: "entrance-passage",
      name: "Entrance Passage",
      prose: "A narrow corridor cut from solid rock. Hieroglyphs glow faintly on the walls. The floor is covered in a thick layer of sand. Ahead, a massive stone door blocks the way. A stone key lies half-buried in the sand.",
      exits: { east: "chamber-of-hieroglyphs" },
      items: ["stone-key", "torch"],
      puzzles: ["stone-door"],
      lookDescriptions: {
        "hieroglyphs": "They depict a warning: 'Do not disturb the sleeping king.'",
        "sand": "The grains shift as if alive."
      }
    },
    {
      id: "chamber-of-hieroglyphs",
      name: "Chamber of Hieroglyphs",
      prose: "A circular chamber lined with carved symbols. In the center, a pedestal holds a life-sized statue of a Pharaoh. The air hums with a low frequency. To the south, a dark passage leads deeper. The stone door behind you is sealed.",
      exits: { south: "burial-chamber", west: "entrance-passage" },
      items: ["ankh-amulet"],
      puzzles: ["hidden-inscription"],
      lookDescriptions: {
        "statue": "Its eyes seem to follow you. The ankh around its neck is missing.",
        "pedestal": "The inscription reads: 'Only the light of truth reveals the way.'"
      }
    },
    {
      id: "burial-chamber",
      name: "Burial Chamber",
      prose: "The heart of the pyramid. A grand sarcophagus sits atop a raised dais. The walls are covered in intricate paintings of the afterlife. A doorway to the east is sealed with a complex mechanism. A scroll rests on a stone table.",
      exits: { east: "treasury" },
      items: ["scroll-of-light"],
      puzzles: ["sarcophagus-lid"],
      lookDescriptions: {
        "sarcophagus": "The lid is inscribed with a curse: 'He who opens this shall be consumed by sand.'",
        "paintings": "They show the Pharaoh's spirit ascending to the stars."
      }
    },
    {
      id: "treasury",
      name: "Treasury",
      prose: "A vault filled with ancient treasures — golden statues, jeweled crowns, and piles of artifacts. But the room is pitch black. Something glitters on a pedestal at the far end. The only light comes from your torch, and it fails quickly in this absolute dark.",
      exits: { west: "burial-chamber" },
      items: ["golden-scarab"],
      puzzles: ["darkness-curse"],
      lookDescriptions: {
        "pedestal": "A golden scarab sits here, radiating light.",
        "treasure": "They shift and clatter in the dark. Something moves among them."
      }
    },
    {
      id: "altar-chamber",
      name: "Altar Chamber",
      prose: "A small, sanctified room with a stone altar at its center. The air is thick with incense that smells of desert winds and time. The walls are covered in protective sigils. The altar is the focal point of the pyramid's curse. Placing the scarab here will either break the curse or awaken something worse.",
      exits: { west: "treasury" },
      items: [],
      puzzles: ["cursed-altar"],
      lookDescriptions: {
        "altar": "A depression in the center shaped like a scarab beetle.",
        "sigils": "They glow faintly when you approach."
      }
    },
    {
      id: "escape-passage",
      name: "Escape Passage",
      prose: "As the scarab settles into the altar, the pyramid trembles. A hidden doorway slides open in the entrance passage, revealing a tunnel leading to the surface. The sand stops moving. The Pharaoh's ghost bows silently. You have lifted the curse and escaped.",
      exits: {},
      items: [],
      puzzles: [],
      lookDescriptions: {
        "tunnel": "A narrow shaft leads upward, lit by a shaft of sunlight.",
        "pyramid": "The ancient stones settle, now at peace."
      }
    }
  ],

  items: [
    {
      id: "stone-key",
      name: "Stone Key",
      description: "A carved slab of stone that fits the entrance mechanism.",
      foundIn: "entrance-passage",
      usedIn: "entrance-passage",
      usedOn: "stone-door"
    },
    {
      id: "torch",
      name: "Reed Torch",
      description: "A dried reed that burns with a smoky flame. It reveals hidden markings.",
      foundIn: "entrance-passage",
      usedIn: "chamber-of-hieroglyphs",
      usedOn: "hidden-inscription"
    },
    {
      id: "ankh-amulet",
      name: "Ankh Amulet",
      description: "A golden ankh that pulses with warmth. It repels the darker spirits.",
      foundIn: "chamber-of-hieroglyphs",
      usedIn: "burial-chamber",
      usedOn: "sarcophagus-lid"
    },
    {
      id: "scroll-of-light",
      name: "Scroll of Light",
      description: "A papyrus scroll inscribed with a spell that illuminates the dark.",
      foundIn: "burial-chamber",
      usedIn: "treasury",
      usedOn: "darkness-curse"
    },
    {
      id: "golden-scarab",
      name: "Golden Scarab",
      description: "A precious beetle-shaped amulet that glows with inner light. It must be placed on the altar to break the curse.",
      foundIn: "treasury",
      usedIn: "altar-chamber",
      usedOn: "cursed-altar"
    }
  ],

  puzzles: [
    {
      id: "stone-door",
      scene: "entrance-passage",
      requires: ["stone-key"],
      action: "use stone-key on door mechanism",
      result: "The key slides into a hidden slot. The stone door rumbles aside, revealing the hieroglyph chamber beyond.",
      reveals: ["chamber-of-hieroglyphs"],
      blocksExit: { scene: "entrance-passage", direction: "east" },
      blockedMessage: "The stone door is sealed. You need a key to open it."
    },
    {
      id: "hidden-inscription",
      scene: "chamber-of-hieroglyphs",
      requires: ["torch"],
      action: "use torch on hieroglyph wall",
      result: "The torch's smoke reveals an inscription that was invisible before. It shows a sequence: 'LIGHT, LIFE, LOVE'. The statue's ankh socket glows. The way south is now accessible.",
      reveals: ["burial-chamber"],
      blocksExit: { scene: "chamber-of-hieroglyphs", direction: "south" },
      blockedMessage: "The dark passage is blocked by a magical barrier. You need to reveal the secret to pass."
    },
    {
      id: "sarcophagus-lid",
      scene: "burial-chamber",
      requires: ["ankh-amulet"],
      action: "use ankh-amulet on sarcophagus lid",
      result: "The ankh emits a golden light. The curse on the sarcophagus recedes. The lid opens, revealing a scroll inside. The treasury door unlocks.",
      reveals: ["scroll-of-light", "treasury"],
      blocksExit: { scene: "burial-chamber", direction: "east" },
      blockedMessage: "The sarcophagus is cursed. You need a holy symbol to approach."
    },
    {
      id: "darkness-curse",
      scene: "treasury",
      requires: ["scroll-of-light"],
      action: "use scroll-of-light in treasury",
      result: "The spell banishes the darkness. The room fills with a soft glow. You can see the golden scarab on the pedestal. The way forward is clear.",
      reveals: ["altar-chamber"],
      blocksExit: {},
      blockedMessage: ""
    },
    {
      id: "cursed-altar",
      scene: "altar-chamber",
      requires: ["golden-scarab"],
      action: "place golden scarab on altar",
      result: "The scarab fits perfectly. Light explodes throughout the pyramid. The curse breaks. An escape tunnel opens. YOU WIN.",
      reveals: ["escape-passage"],
      blocksExit: {},
      blockedMessage: ""
    }
  ],

  winCondition: {
    scene: "escape-passage",
    requires: [],
    description: "You emerge from the pyramid as the sun rises. The sand is still. The curse is lifted. You have survived the Sand That Speaks."
  }
};

// ============================================================
// GAME STATE
// ============================================================
const state = {
  currentScene: GAME_DATA.startScene,
  inventory: [],
  solvedPuzzles: [],
  visitedScenes: [],
  revealedItems: [] // Items newly revealed by puzzle solutions
};

// ============================================================
// DOM REFERENCES (set on init)
// ============================================================
let artDisplay = null;
let textDisplay = null;
let exitBar = null;
let inventoryDisplay = null;
let commandInput = null;

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/** Get current scene data */
function getCurrentScene() {
  return GAME_DATA.scenes.find(s => s.id === state.currentScene);
}

/** Add text to the display */
function addText(text, className = '') {
  if (!textDisplay) return;
  const p = document.createElement('p');
  p.textContent = text;
  if (className) p.className = className;
  textDisplay.appendChild(p);
  textDisplay.scrollTop = textDisplay.scrollHeight;
}

/** Clear text display */
function clearText() {
  if (textDisplay) textDisplay.innerHTML = '';
}

/** Find item by ID */
function findItem(id) {
  return GAME_DATA.items.find(i => i.id === id);
}

/** Find puzzle by ID */
function findPuzzle(id) {
  return GAME_DATA.puzzles.find(p => p.id === id);
}

/** Check if player has item */
function hasItem(itemId) {
  return state.inventory.includes(itemId);
}

/** Check if puzzle is solved */
function isSolved(puzzleId) {
  return state.solvedPuzzles.includes(puzzleId);
}

// ============================================================
// CORE GAME FUNCTIONS
// ============================================================

/**
 * Check if exit is blocked by an unsolved puzzle
 * Returns false if blocked, true if free
 */
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

/** Move to a new scene */
function goToScene(sceneId) {
  const scene = GAME_DATA.scenes.find(s => s.id === sceneId);
  if (!scene) {
    addText("[You can't go that way.]", 'error');
    return;
  }

  state.currentScene = sceneId;
  if (!state.visitedScenes.includes(sceneId)) {
    state.visitedScenes.push(sceneId);
  }
  renderScene();
  checkWinCondition();
}

/** Move in a direction */
function goDirection(direction) {
  const scene = getCurrentScene();
  if (!scene.exits[direction]) {
    addText(`[There is no exit to the ${direction}.]`, 'error');
    return;
  }
  if (canExit(state.currentScene, direction)) {
    goToScene(scene.exits[direction]);
  }
}

/** Take an item from the scene */
function takeItem(itemId) {
  const scene = getCurrentScene();
  const item = findItem(itemId);

  if (!item) {
    addText("[You don't see that here.]", 'error');
    return;
  }

  // Check if item is in scene (either pre-existing or revealed)
  const itemInScene = scene.items.includes(itemId) || state.revealedItems.includes(itemId);
  if (!itemInScene) {
    addText("[You don't see that here.]", 'error');
    return;
  }

  if (hasItem(itemId)) {
    addText("[You already have that.]", 'error');
    return;
  }

  // Add to inventory
  state.inventory.push(itemId);

  // Remove from scene
  const idx = scene.items.indexOf(itemId);
  if (idx > -1) scene.items.splice(idx, 1);

  // Remove from revealed items
  const rIdx = state.revealedItems.indexOf(itemId);
  if (rIdx > -1) state.revealedItems.splice(rIdx, 1);

  addText(`[You take the ${item.name}.]`, 'item');
  renderInventory();

  // Visual glow effect
  highlightNewItem(itemId);
}

/** Use an item on a puzzle target */
function useItem(itemId, puzzleId) {
  const puzzle = findPuzzle(puzzleId);
  const item = findItem(itemId);

  if (!item) {
    addText("[You don't have that item.]", 'error');
    return;
  }

  if (!hasItem(itemId)) {
    addText("[You don't have that.]", 'error');
    return;
  }

  if (!puzzle) {
    addText("[You can't use that here.]", 'error');
    return;
  }

  if (isSolved(puzzle.id)) {
    addText("[You've already done that.]", 'error');
    return;
  }

  // Check if we're in the right scene
  if (puzzle.scene !== state.currentScene) {
    addText("[You can't use that here.]", 'error');
    return;
  }

  // Check if this item solves this puzzle
  if (puzzle.requires.includes(itemId)) {
    solvePuzzle(puzzle);
  } else {
    addText("[That doesn't seem to work here.]", 'error');
  }
}

/** Solve a puzzle */
function solvePuzzle(puzzle) {
  state.solvedPuzzles.push(puzzle.id);

  // Show result text
  addText(puzzle.result, 'puzzle');

  // Visual feedback
  if (artDisplay) {
    artDisplay.classList.add('puzzle-solved');
    setTimeout(() => artDisplay.classList.remove('puzzle-solved'), 600);
  }

  // Reveal items
  if (puzzle.reveals) {
    puzzle.reveals.forEach(idOrScene => {
      // Check if it's an item or scene
      const item = findItem(idOrScene);
      if (item) {
        state.revealedItems.push(idOrScene);
        addText(`[A ${item.name} is now visible.]`, 'item');
      }
    });
  }

  // Update exits
  renderExits();
  renderSceneItems();
}

/** Look at something in the scene */
function lookAt(target) {
  const scene = getCurrentScene();
  const targetLower = target.toLowerCase();

  // Check scene look descriptions
  if (scene.lookDescriptions) {
    for (const [key, desc] of Object.entries(scene.lookDescriptions)) {
      if (targetLower.includes(key.toLowerCase()) || key.toLowerCase().includes(targetLower)) {
        addText(desc, 'description');
        return;
      }
    }
  }

  // Check if it's an item in inventory
  const invItem = GAME_DATA.items.find(i =>
    hasItem(i.id) && (
      targetLower.includes(i.name.toLowerCase()) ||
      i.name.toLowerCase().includes(targetLower) ||
      targetLower.includes(i.id.toLowerCase())
    )
  );
  if (invItem) {
    addText(invItem.description, 'description');
    return;
  }

  // Check if it's an item in the scene
  const sceneItems = [...scene.items, ...state.revealedItems];
  const sceneItem = GAME_DATA.items.find(i =>
    sceneItems.includes(i.id) && (
      targetLower.includes(i.name.toLowerCase()) ||
      i.name.toLowerCase().includes(targetLower) ||
      targetLower.includes(i.id.toLowerCase())
    )
  );
  if (sceneItem) {
    addText(sceneItem.description, 'description');
    return;
  }

  // Check if it's an exit
  for (const [dir, targetScene] of Object.entries(scene.exits)) {
    if (targetLower.includes(dir)) {
      const td = GAME_DATA.scenes.find(s => s.id === targetScene);
      addText(`To the ${dir}: ${td ? td.name : 'unknown'}.`, 'description');
      return;
    }
  }

  addText(`[You don't see anything special about '${target}'.]`, 'error');
}

/** Check win condition */
function checkWinCondition() {
  const wc = GAME_DATA.winCondition;
  if (state.currentScene === wc.scene) {
    setTimeout(() => {
      addText("\n=== " + GAME_DATA.title.toUpperCase() + " ===", 'win');
      addText(wc.description, 'win');
      addText("\nCongratulations! You have escaped the pyramid!", 'win');
    }, 500);
  }
}

// ============================================================
// COMMAND PARSER
// ============================================================

function parseCommand(input) {
  const cmd = input.trim().toLowerCase();
  if (!cmd) return;

  // GO commands
  const dirMatch = cmd.match(/^(go\s+)?(north|south|east|west|n|s|e|w)$/);
  if (dirMatch) {
    const dir = dirMatch[2].toLowerCase();
    const dirMap = { n: 'north', s: 'south', e: 'east', w: 'west' };
    goDirection(dirMap[dir] || dir);
    return;
  }

  // TAKE/GET commands
  const takeMatch = cmd.match(/^(take|get|pick up|grab)\s+(.+)/);
  if (takeMatch) {
    const target = takeMatch[2].trim();
    // Find matching item
    const item = GAME_DATA.items.find(i =>
      target.includes(i.name.toLowerCase()) ||
      i.name.toLowerCase().includes(target) ||
      target.includes(i.id.toLowerCase())
    );
    if (item) {
      takeItem(item.id);
    } else {
      addText(`[You don't see '${target}' here.]`, 'error');
    }
    return;
  }

  // USE command
  const useMatch = cmd.match(/^(use|apply)\s+(.+?)\s+(on|with)\s+(.+)/);
  if (useMatch) {
    const itemName = useMatch[2].trim();
    const targetName = useMatch[4].trim();

    const item = GAME_DATA.items.find(i =>
      itemName.includes(i.name.toLowerCase()) ||
      i.name.toLowerCase().includes(itemName) ||
      itemName.includes(i.id.toLowerCase())
    );

    if (!item) {
      addText(`[You don't have '${itemName}'.]`, 'error');
      return;
    }

    // Find matching puzzle by target name or puzzle ID
    const puzzle = GAME_DATA.puzzles.find(p =>
      (p.action && (
        targetName.includes(p.id.replace(/-/g, ' ')) ||
        p.id.replace(/-/g, ' ').includes(targetName) ||
        targetName.includes(p.action.split(' ').pop())
      ))
    );

    if (puzzle) {
      useItem(item.id, puzzle.id);
    } else {
      addText(`[You can't use ${item.name} on '${targetName}'.]`, 'error');
    }
    return;
  }

  // USE item alone (auto-find puzzle)
  const useAloneMatch = cmd.match(/^(use|apply)\s+(.+)/);
  if (useAloneMatch && !useAloneMatch[0].includes(' on ') && !useAloneMatch[0].includes(' with ')) {
    const itemName = useAloneMatch[2].trim();
    const item = GAME_DATA.items.find(i =>
      itemName.includes(i.name.toLowerCase()) ||
      i.name.toLowerCase().includes(itemName) ||
      itemName.includes(i.id.toLowerCase())
    );
    if (item && item.usedIn === state.currentScene) {
      const puzzle = GAME_DATA.puzzles.find(p =>
        p.scene === state.currentScene && p.requires.includes(item.id)
      );
      if (puzzle) {
        useItem(item.id, puzzle.id);
        return;
      }
    }
    addText(`[You can't use '${itemName}' here.]`, 'error');
    return;
  }

  // LOOK/EXAMINE commands
  const lookMatch = cmd.match(/^(look|examine|inspect|x)\s*(at)?\s*(.+)/);
  if (lookMatch) {
    lookAt(lookMatch[3].trim());
    return;
  }

  // LOOK alone
  if (cmd === 'look' || cmd === 'l') {
    renderScene();
    return;
  }

  // INVENTORY command
  if (cmd === 'inventory' || cmd === 'i' || cmd === 'inv') {
    if (state.inventory.length === 0) {
      addText("You are carrying nothing.", 'inventory');
    } else {
      addText("You are carrying:", 'inventory');
      state.inventory.forEach(id => {
        const item = findItem(id);
        addText(`  - ${item.name}`, 'inventory');
      });
    }
    return;
  }

  // HELP command
  if (cmd === 'help' || cmd === '?' || cmd === 'h') {
    showHelp();
    return;
  }

  // N/S/E/W single letter shortcuts handled above, but just in case:
  const singleDir = { n: 'north', s: 'south', e: 'east', w: 'west' };
  if (singleDir[cmd]) {
    goDirection(singleDir[cmd]);
    return;
  }

  addText(`[I don't understand '${input}'. Type HELP for commands.]`, 'error');
}

function showHelp() {
  addText("\n--- COMMANDS ---", 'help');
  addText("GO [direction] / NORTH / SOUTH / EAST / WEST", 'help');
  addText("LOOK [at target] / EXAMINE [target]", 'help');
  addText("TAKE [item] / GET [item]", 'help');
  addText("USE [item] ON [target]", 'help');
  addText("INVENTORY (or I)", 'help');
  addText("LOOK (re-read scene)", 'help');
  addText("----------------\n", 'help');
}

// ============================================================
// RENDERING FUNCTIONS
// ============================================================

/** Render the current scene */
function renderScene() {
  const scene = getCurrentScene();
  if (!scene) return;

  clearText();
  addText(`=== ${scene.name} ===`, 'scene-title');
  addText(scene.prose, 'scene-text');

  // Show available items
  renderSceneItems();

  // Update art display
  updateArtDisplay(scene.id);

  // Update exits
  renderExits();

  // Update inventory
  renderInventory();
}

/** Show items available in current scene */
function renderSceneItems() {
  const scene = getCurrentScene();
  const allItems = [...scene.items, ...state.revealedItems];
  if (allItems.length > 0) {
    const itemNames = allItems.map(id => {
      const item = findItem(id);
      return item ? item.name : id;
    });
    addText(`\nYou can see: ${itemNames.join(', ')}`, 'items');
  }
}

/** Update art display */
function updateArtDisplay(sceneId) {
  if (!artDisplay) return;
  artDisplay.setAttribute('data-scene', sceneId);
}

/** Render exit buttons */
function renderExits() {
  if (!exitBar) return;
  exitBar.innerHTML = '';

  const scene = getCurrentScene();
  const directions = ['north', 'south', 'east', 'west'];
  const dirLabels = { north: '▲ North', south: '▼ South', east: '► East', west: '◄ West' };

  directions.forEach(dir => {
    if (scene.exits[dir]) {
      const btn = document.createElement('button');
      btn.className = 'exit-btn';
      btn.textContent = dirLabels[dir];
      btn.dataset.direction = dir;

      // Check if this exit was recently unlocked
      const wasBlocked = GAME_DATA.puzzles.some(p =>
        p.blocksExit?.scene === state.currentScene &&
        p.blocksExit?.direction === dir &&
        state.solvedPuzzles.includes(p.id)
      );
      if (wasBlocked) {
        btn.classList.add('newly-unlocked');
        setTimeout(() => btn.classList.remove('newly-unlocked'), 3000);
      }

      // Check if blocked
      if (!canExit(state.currentScene, dir)) {
        btn.classList.add('blocked');
      }

      btn.addEventListener('click', () => goDirection(dir));
      exitBar.appendChild(btn);
    }
  });
}

/** Render inventory display */
function renderInventory() {
  if (!inventoryDisplay) return;
  inventoryDisplay.innerHTML = '';

  if (state.inventory.length === 0) {
    inventoryDisplay.innerHTML = '<span class="inv-empty">(empty)</span>';
    return;
  }

  state.inventory.forEach(id => {
    const item = findItem(id);
    if (!item) return;
    const span = document.createElement('span');
    span.className = 'inv-item';
    span.textContent = item.name;
    span.title = item.description;
    span.dataset.itemId = id;
    inventoryDisplay.appendChild(span);
  });
}

/** Highlight a newly revealed item */
function highlightNewItem(itemId) {
  // This is handled by CSS animation on inventory items
  setTimeout(() => {
    const el = inventoryDisplay?.querySelector(`[data-item-id="${itemId}"]`);
    if (el) {
      el.classList.add('item-new');
      setTimeout(() => el.classList.remove('item-new'), 2000);
    }
  }, 100);
}

// ============================================================
// INITIALIZATION
// ============================================================

function init() {
  // Get DOM references
  artDisplay = document.getElementById('art-display');
  textDisplay = document.getElementById('text-display');
  exitBar = document.getElementById('exit-bar');
  inventoryDisplay = document.getElementById('inventory-display');
  commandInput = document.getElementById('command-input');

  // Set up input handling
  if (commandInput) {
    commandInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const input = commandInput.value.trim();
        if (input) {
          addText(`> ${input}`, 'command');
          parseCommand(input);
          commandInput.value = '';
        }
      }
    });

    // Focus input on click anywhere
    document.addEventListener('click', () => {
      commandInput.focus();
    });
  }

  // Set up exit button clicks via event delegation
  if (exitBar) {
    exitBar.addEventListener('click', (e) => {
      if (e.target.classList.contains('exit-btn') && !e.target.classList.contains('blocked')) {
        goDirection(e.target.dataset.direction);
      }
    });
  }

  // Set up inventory clicks via event delegation
  if (inventoryDisplay) {
    inventoryDisplay.addEventListener('click', (e) => {
      if (e.target.classList.contains('inv-item')) {
        const itemId = e.target.dataset.itemId;
        const item = findItem(itemId);
        if (item) {
          addText(`> Look at ${item.name}`, 'command');
          addText(item.description, 'description');
        }
      }
    });
  }

  // Mark starting scene as visited
  state.visitedScenes.push(state.currentScene);

  // Render initial scene
  renderScene();

  // Show welcome message
  addText("\nWelcome to THE SAND THAT SPEAKS", 'welcome');
  addText("Type HELP for commands.\n", 'welcome');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
