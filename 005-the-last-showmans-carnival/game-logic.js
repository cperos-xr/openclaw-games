// ============================================================
// THE LAST SHOWMAN'S CARNIVAL - Game Logic
// Data-driven point-and-click adventure engine
// ============================================================

const GAME_DATA = {
  "title": "The Last Showman's Carnival",
  "slug": "the-last-showmans-carnival",
  "setting": "A derelict 1960s traveling carnival, abandoned for decades, with dark secrets buried beneath the rotting midway.",
  "scenes": [
    {
      "id": "midway",
      "name": "Midway Entrance",
      "prose": "The carnival entrance is a graveyard of faded joy. A broken ticket booth tilts on rotted timber, its window smashed inward by decades of neglect. Beyond it stretches the midway — a corridor of rusted game booths and food stalls strangled by kudzu. The air is thick with the smell of wet earth and something else, something sweetly rotten beneath the decay. The giant Ferris wheel stands frozen against the twilight sky, its gondolas hanging like empty birdcages. A single working lamp flickers weakly over a rusted funhouse, its door padlocked with a heavy chain. To the east, the carousel sits silent, its wooden horses frozen mid-gallop. North, the looming silhouette of the Big Top tent sags under its own weight. West, a fortune teller's wagon leans precariously, its painted stars faded to ghosts.",
      "exits": {
        "east": "carousel",
        "north": "big_top",
        "west": "fortune_wagon",
        "south": "sideshow_gallery",
        "funhouse_door": "funhouse"
      },
      "items": ["rusty_key"],
      "puzzles": ["finale_flare"],
      "lookDescriptions": {
        "ticket_booth": "The glass is gone, the counter covered in mildew and dead leaves. A faded poster still clings inside — 'Blackwood's Traveling Carnival, 1963'.",
        "funhouse_door": "Heavy oak with peeling clown paint. A thick rusted chain holds it shut, secured by an old padlock.",
        "lamp_post": "The single electric lamp flickers arrhythmically, casting long, jumping shadows across the midway.",
        "kudzu": "The vine has consumed half the booths, pulling them into a slow, green collapse."
      }
    },
    {
      "id": "funhouse",
      "name": "The Funhouse",
      "prose": "You step through the creaking door into a world of distorted reflections. The funhouse is a long, narrow corridor lined with warped mirrors that stretch and compress your image into grotesque shapes. The air is stale and smells of old varnish and mildew. At the far end, a huge mirror shows not your reflection, but the silhouette of a man in a faded ringmaster's coat — he turns and vanishes before you can focus. The floorboards groan with every step. To your left, a control panel for the hall of mirrors lies open, its wires frayed. A heavy lever sits disconnected from its mount. The only exit is back to the midway.",
      "exits": {
        "south": "midway"
      },
      "items": ["broken_lever"],
      "puzzles": [],
      "lookDescriptions": {
        "mirrors": "They don't just distort — sometimes they show things that aren't there. A face in the glass, a hand reaching out, gone when you blink.",
        "control_panel": "Rusted switches and torn wires. The lever mechanism is missing its handle.",
        "silhouette_mirror": "The glass at the end holds no reflection of you — just that empty coat, turning away.",
        "floorboards": "They creak in sequence, as if someone is walking beside you just out of sight."
      }
    },
    {
      "id": "carousel",
      "name": "Carousel",
      "prose": "The carousel is a ghostly carousel of painted horses and chariots, all frozen in a silent, eternal gallop. The central pole is wrapped in peeling gold leaf, and the platform is littered with dead leaves and broken glass. The calliope organ at the center is silent, its keys covered in dust. One horse — a black stallion with wild eyes — has a small compartment in its saddle that's slightly ajar. The air is cold here, and you can almost hear the faint echo of carnival music, a waltz played on a broken record. A rusty gear mechanism is visible beneath the platform, missing a lever to engage it.",
      "exits": {
        "west": "midway"
      },
      "items": ["music_box"],
      "puzzles": ["gear_mechanism"],
      "lookDescriptions": {
        "horses": "Their painted eyes seem to follow you. The black stallion's mouth is open mid-snarl.",
        "calliope": "Dusty keys, silent pipes. A faded music roll is still threaded through — 'The Carnival Waltz'.",
        "gear_mechanism": "A series of interlocking gears under the platform, rusted in place. A socket where a lever should fit is empty.",
        "saddle_compartment": "On the black horse, a small hinged door hangs slightly open."
      }
    },
    {
      "id": "big_top",
      "name": "Big Top Tent",
      "prose": "The Big Top is a cavern of faded grandeur. The canvas sags overhead, stained with decades of rain and mildew. Rows of decaying bleachers face a central ring where sawdust has turned to black mud. A spotlight lies overturned, its lens cracked. At the far end, a stage holds a locked safe and an old film projector on a tripod. Costume racks line one wall — moth-eaten sequined dresses and clown suits that seem to shift when you're not looking. The air smells of wet canvas and old sweat. A trapdoor in the stage leads down into darkness, but it's rusted shut.",
      "exits": {
        "south": "midway"
      },
      "items": ["signal_flare"],
      "puzzles": ["projector", "safe"],
      "lookDescriptions": {
        "safe": "A heavy cast-iron safe with a combination dial. No markings except 'Blackwood' engraved on the front.",
        "projector": "An old 16mm film projector, its lens missing. A reel is still threaded — 'Carnival Memories, 1963'.",
        "costumes": "They hang like empty people. One clown suit's grin seems wider than it was a moment ago.",
        "trapdoor": "Rusted iron ring set into the stage floor. It won't budge."
      }
    },
    {
      "id": "fortune_wagon",
      "name": "Fortune Teller's Wagon",
      "prose": "Madame Vesper's wagon is a capsule of velvet and dust. Crystal balls and tarot cards litter a small round table draped in purple silk. The air is thick with the scent of sandalwood and something metallic. A large crystal ball on the table glows with a faint inner light, though no candle burns nearby. Shelves hold jars of herbs and curious trinkets — rabbit feet, dried flowers, animal bones. In one corner, a faded poster shows Madame Vesper, her eyes eerily lifelike. The wagon creaks with a rhythm that doesn't match the wind.",
      "exits": {
        "east": "midway"
      },
      "items": ["crystal_lens"],
      "puzzles": ["crystal_ball"],
      "lookDescriptions": {
        "crystal_ball": "It glows with a soft, pulsing light. If you stare too long, shapes move inside — not your reflection.",
        "tarot_cards": "The spread on the table shows The Tower, The Hanged Man, and Death. They weren't arranged that way when you entered.",
        "poster": "Madame Vesper in her prime, eyes that seem to track you. The caption: 'See Your Fate — 25¢'.",
        "jars": "Cloudy liquids with suspended shapes. One holds what looks like a human finger."
      }
    },
    {
      "id": "sideshow_gallery",
      "name": "Sideshow Gallery",
      "prose": "This long tent is lined with glass display cases, each containing something that shouldn't exist. A two-headed calf floats in formaldehyde. A jar claims to hold a mermaid's hand. A skeleton with too many ribs. The air is cold and smells of preservative chemicals. At the far end, a curtained stage bears a sign: 'The Grinning Man — See the Horror That Laughs!' The curtain is drawn shut. One display case is shattered, its contents missing. A hidden door behind a velvet drape leads backstage, but it's locked from the other side.",
      "exits": { "south": "midway" },
      "items": [],
      "puzzles": [],
      "lookDescriptions": {
        "display_cases": "The specimens look almost real. The two-headed calf's eyes are open and glassy.",
        "grinning_man_stage": "The curtain trembles slightly, as if someone is breathing behind it.",
        "shattered_case": "Glass shards on the floor. A label reads 'The Last Laugh — The Grinning Man's Mask'.",
        "velvet_drape": "Heavy burgundy velvet covering what might be a doorway."
      }
    }
  ],
  "items": [
    {
      "id": "rusty_key",
      "name": "Rusty Key",
      "description": "An old iron key, green with corrosion. Fits the padlock on the funhouse door.",
      "foundIn": "midway",
      "usedIn": "midway",
      "usedOn": "funhouse_door"
    },
    {
      "id": "broken_lever",
      "name": "Broken Lever",
      "description": "A metal lever with a chewed-up end. It once controlled the funhouse mirrors, but could fit another mechanism.",
      "foundIn": "funhouse",
      "usedIn": "carousel",
      "usedOn": "gear_mechanism"
    },
    {
      "id": "music_box",
      "name": "Music Box",
      "description": "A small brass music box. When wound, it plays a haunting fragment of 'The Carnival Waltz'.",
      "foundIn": "carousel",
      "usedIn": "fortune_wagon",
      "usedOn": "crystal_ball"
    },
    {
      "id": "crystal_lens",
      "name": "Crystal Lens",
      "description": "A clear, multifaceted lens that seems to gather light. Fits perfectly in the old film projector.",
      "foundIn": "fortune_wagon",
      "usedIn": "big_top",
      "usedOn": "projector"
    },
    {
      "id": "signal_flare",
      "name": "Signal Flare",
      "description": "A single red flare gun with one charge. Might be visible for miles in the dark.",
      "foundIn": "big_top",
      "usedIn": "midway",
      "usedOn": "midway_entrance"
    }
  ],
  "puzzles": [
    {
      "id": "funhouse_padlock",
      "scene": "midway",
      "requires": ["rusty_key"],
      "action": "Use rusty key on the padlock",
      "result": "The padlock clicks open. The chain falls away, and the funhouse door swings inward.",
      "reveals": [],
      "blocksExit": { "scene": "midway", "direction": "funhouse_door", "blockedMessage": "The funhouse door is secured by a heavy padlock and chain." }
    },
    {
      "id": "gear_mechanism",
      "scene": "carousel",
      "requires": ["broken_lever"],
      "action": "Insert broken lever into the gear socket",
      "result": "The lever fits. With a grinding shriek, the gears turn. The carousel rotates once, and a compartment in the black horse's saddle pops open.",
      "reveals": ["music_box"],
      "blocksExit": null
    },
    {
      "id": "crystal_ball",
      "scene": "fortune_wagon",
      "requires": ["music_box"],
      "action": "Wind the music box near the crystal ball",
      "result": "The music box plays its haunting waltz. The crystal ball flashes bright, and inside, a multifaceted lens materializes.",
      "reveals": ["crystal_lens"],
      "blocksExit": null
    },
    {
      "id": "projector",
      "scene": "big_top",
      "requires": ["crystal_lens"],
      "action": "Place crystal lens in the projector",
      "result": "The lens snaps into place. The projector whirs to life, casting flickering numbers on the safe's face: '1883'.",
      "reveals": [],
      "blocksExit": null
    },
    {
      "id": "safe",
      "scene": "big_top",
      "requires": [],
      "action": "Enter code 1883 on the safe dial",
      "result": "The safe unlocks with a heavy thunk. Inside lies a single red flare gun.",
      "reveals": ["signal_flare"],
      "blocksExit": null
    },
    {
      "id": "finale_flare",
      "scene": "midway",
      "requires": ["signal_flare"],
      "action": "Fire the signal flare into the sky",
      "result": "The flare arcs high, burning brilliant red. Minutes later, headlights appear on the distant road. Rescue has seen your signal.",
      "reveals": [],
      "blocksExit": null
    }
  ],
  "winCondition": {
    "scene": "midway",
    "requires": ["signal_flare"],
    "description": "Fire the signal flare to alert rescuers and escape the carnival."
  }
};

// ---- Game State ----
const state = {
  currentScene: 'midway',
  inventory: [],
  solvedPuzzles: [],
  visitedScenes: ['midway'],
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

// ---- Helper: Get items available in a scene (not yet picked up) ----
function getAvailableItems(sceneId) {
  const scene = GAME_DATA.scenes.find(s => s.id === sceneId);
  if (!scene) return [];
  return (scene.items || []).filter(id => !state.inventory.includes(id));
}

// ---- Helper: Get puzzles in a scene that aren't solved ----
function getUnsolvedPuzzles(sceneId) {
  return GAME_DATA.puzzles.filter(p =>
    p.scene === sceneId && !state.solvedPuzzles.includes(p.id)
  );
}

// ---- Check if an exit is blocked by an unsolved puzzle ----
function isExitBlocked(sceneId, direction) {
  const blocker = GAME_DATA.puzzles.find(p =>
    p.blocksExit &&
    p.blocksExit.scene === sceneId &&
    p.blocksExit.direction === direction &&
    !state.solvedPuzzles.includes(p.id)
  );
  return blocker || null;
}

// ---- Display Functions ----
function addText(text, cls = '') {
  const p = document.createElement('p');
  p.className = cls;
  p.innerHTML = text;
  textDisplay.appendChild(p);
  textDisplay.scrollTop = textDisplay.scrollHeight;
}

function clearText() { textDisplay.innerHTML = ''; }

// ---- Puzzle Solved Visual Effect ----
function showPuzzleSolvedEffect() {
  if (artDisplay) {
    artDisplay.classList.add('puzzle-solved');
    setTimeout(() => artDisplay.classList.remove('puzzle-solved'), 600);
  }
}

// ---- Item Glow Effect ----
function showItemGlow() {
  // Highlight newest inventory item
  const items = invBar.querySelectorAll('.inv-item');
  if (items.length > 0) {
    const lastItem = items[items.length - 1];
    lastItem.classList.add('item-new');
    setTimeout(() => lastItem.classList.remove('item-new'), 2000);
  }
}

// ---- Render Scene ----
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

  // Update scene name
  sceneName.textContent = scene.name.toUpperCase();

  // Update art display
  const artKey = sceneId;
  if (window.GAME_ART && window.GAME_ART[artKey]) {
    artDisplay.innerHTML = window.GAME_ART[artKey];
  } else {
    artDisplay.innerHTML = '<span class="no-art">[ ' + scene.name.toUpperCase() + ' ]</span>';
  }

  // Display scene prose
  clearText();
  addText(scene.prose);

  // Show available items in scene
  const availableItems = getAvailableItems(sceneId);
  if (availableItems.length > 0) {
    const itemNames = availableItems.map(id => {
      const item = GAME_DATA.items.find(i => i.id === id);
      return item ? `<span class="look-target" data-look="${id}" data-type="item-pickup">${item.name}</span>` : id;
    });
    addText('You notice: ' + itemNames.join(', '), 'system');
  }

  // Check if funhouse door is locked
  const funhouseBlock = isExitBlocked('midway', 'funhouse_door');
  if (sceneId === 'midway' && funhouseBlock) {
    addText('[The funhouse door is secured by a heavy padlock and chain.]', 'locked');
  }

  // Show unsolved puzzle hints
  const unsolved = getUnsolvedPuzzles(sceneId);
  unsolved.forEach(puzzle => {
    if (puzzle.requires.length > 0 && puzzle.id !== 'funhouse_padlock') {
      const hasReqs = puzzle.requires.every(r => state.inventory.includes(r));
      if (hasReqs) {
        addText(`You have everything you need to deal with the ${puzzle.action.toLowerCase().split(' ').slice(-2).join(' ')}...`, 'system');
      }
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

// ---- Render Exits ----
function renderExits(exits) {
  exitsBar.innerHTML = '';

  // Display name mappings for special exits
  const exitLabels = {
    'north': 'NORTH',
    'south': 'SOUTH',
    'east': 'EAST',
    'west': 'WEST',
    'funhouse_door': 'FUNHOUSE'
  };

  // Standard directions
  const directions = ['north', 'south', 'east', 'west', 'funhouse_door'];

  directions.forEach(dir => {
    if (!exits[dir]) return; // No exit in this direction

    // Check if blocked
    const blocker = isExitBlocked(state.currentScene, dir);
    const isBlocked = blocker !== null;

    const btn = document.createElement('button');
    btn.className = 'exit-btn';
    btn.textContent = exitLabels[dir] || dir.toUpperCase();

    if (isBlocked) {
      btn.classList.add('blocked');
      btn.title = blocker.blockedMessage || 'This way is blocked.';
      btn.onclick = () => {
        addText(`[${blocker.blockedMessage || 'Something prevents you from going that way.'}]`, 'locked');
      };
    } else {
      btn.classList.add('available');
      btn.onclick = () => go(exits[dir]);
    }

    exitsBar.appendChild(btn);
  });
}

// ---- Render Inventory ----
function renderInventory() {
  // Remove existing items
  const existingItems = invBar.querySelectorAll('.inv-item');
  existingItems.forEach(el => el.remove());

  let empty = document.getElementById('inv-empty');
  if (!empty) {
    empty = document.createElement('span');
    empty.id = 'inv-empty';
    empty.style.color = '#226622';
    empty.textContent = '[ empty ]';
    invBar.appendChild(empty);
  }

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
      el.dataset.itemId = itemId;
      el.onclick = () => selectItem(itemId);
      invBar.appendChild(el);
    });
  }
}

// ---- Select Item ----
function selectItem(itemId) {
  if (state.selectedItem === itemId) {
    state.selectedItem = null;
    addText('Item deselected.', 'system');
  } else {
    state.selectedItem = itemId;
    const item = GAME_DATA.items.find(i => i.id === itemId);
    addText(`Selected: <strong>${item.name}</strong>. Now click on something to use it on.`, 'system');
  }
  renderInventory();
}

// ---- Set Active Command ----
function setCommand(cmd) {
  // Toggle off if same command clicked
  if (state.activeCommand === cmd) {
    state.activeCommand = null;
    document.querySelectorAll('.cmd-btn').forEach(b => b.classList.remove('active'));
    return;
  }

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
          `<span class="look-target" data-look="${t}" data-type="look">${formatTargetName(t)}</span>`
        ).join(', '), 'system');
      }
    } else {
      addText('Nothing special to examine here.', 'system');
    }
  } else if (cmd === 'take') {
    const available = getAvailableItems(state.currentScene);
    if (available.length > 0) {
      addText('Click an item to pick it up.', 'system');
    } else {
      addText('Nothing here to take.', 'system');
    }
  } else if (cmd === 'use') {
    if (state.inventory.length > 0) {
      addText('Select an item from your inventory, then click a target to use it on.', 'system');
    } else {
      addText('You have nothing to use.', 'system');
    }
  } else if (cmd === 'examine') {
    const scene = GAME_DATA.scenes.find(s => s.id === state.currentScene);
    if (scene && scene.lookDescriptions) {
      const targets = Object.keys(scene.lookDescriptions);
      if (targets.length > 0) {
        addText('Click something to examine it: ' + targets.map(t =>
          `<span class="look-target" data-look="${t}" data-type="examine">${formatTargetName(t)}</span>`
        ).join(', '), 'system');
      }
    }
  }
}

// ---- Format target names for display ----
function formatTargetName(id) {
  return id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ---- Look at something ----
function lookAt(target) {
  const scene = GAME_DATA.scenes.find(s => s.id === state.currentScene);

  // Check scene look descriptions
  if (scene && scene.lookDescriptions && scene.lookDescriptions[target]) {
    addText(scene.lookDescriptions[target]);
    return;
  }

  // Check if it's an item in inventory or scene
  const item = GAME_DATA.items.find(i => i.id === target);
  if (item) {
    addText(item.description);
    return;
  }

  addText("You don't see anything special about that.", 'system');
}

// ---- Pick up an item ----
function takeItem(itemId) {
  if (state.inventory.includes(itemId)) {
    addText("You already have that.", 'system');
    return;
  }

  const item = GAME_DATA.items.find(i => i.id === itemId);
  if (!item) return;

  const scene = GAME_DATA.scenes.find(s => s.id === state.currentScene);
  if (!scene || !(scene.items || []).includes(itemId)) {
    addText("You can't take that.", 'system');
    return;
  }

  state.inventory.push(itemId);
  addText(`You picked up: <strong>${item.name}</strong> — ${item.description}`, 'success');
  renderInventory();
  saveState();
}

// ---- Use item on target ----
function useItemOn(itemId, targetId) {
  if (!state.inventory.includes(itemId)) {
    addText("You don't have that item.", 'error');
    return;
  }

  const item = GAME_DATA.items.find(i => i.id === itemId);
  if (!item) return;

  // Check if this item solves a puzzle in the current scene
  const puzzle = GAME_DATA.puzzles.find(p =>
    p.scene === state.currentScene &&
    p.requires.includes(itemId) &&
    !state.solvedPuzzles.includes(p.id)
  );

  // Also check if target matches puzzle's useOn or action
  const targetMatch = targetId === item.usedOn ||
                       targetId === puzzle?.id ||
                       formatTargetName(targetId).toLowerCase().includes(item.usedOn?.replace(/_/g, ' ').split(' ')[0] || '');

  if (puzzle && (targetMatch || state.activeCommand === 'use')) {
    // Check all requirements are met
    const hasAllReqs = puzzle.requires.every(req => state.inventory.includes(req));
    if (hasAllReqs) {
      // Solve the puzzle!
      state.solvedPuzzles.push(puzzle.id);

      // Visual effect
      showPuzzleSolvedEffect();

      addText(puzzle.result, 'success');

      // Remove used item if it was consumed (key opens door = consumed)
      if (puzzle.id === 'funhouse_padlock') {
        const keyIdx = state.inventory.indexOf('rusty_key');
        if (keyIdx !== -1) state.inventory.splice(keyIdx, 1);
        addText('<em>The rusty key crumbles to dust after use.</em>', 'system');
      }

      // Reveal new items
      (puzzle.reveals || []).forEach(revealId => {
        const revealItem = GAME_DATA.items.find(i => i.id === revealId);
        if (revealItem) {
          // Item is added to scene, player must pick it up
          addText(`Something has appeared: <span class="look-target" data-look="${revealId}" data-type="item-pickup">${revealItem.name}</span>`, 'success');
        }
      });

      renderInventory();
      checkWin();
      saveState();
      return;
    }
  }

  // Try generic match
  if (puzzle && puzzle.requires.includes(itemId)) {
    state.solvedPuzzles.push(puzzle.id);
    showPuzzleSolvedEffect();
    addText(puzzle.result, 'success');

    (puzzle.reveals || []).forEach(revealId => {
      const revealItem = GAME_DATA.items.find(i => i.id === revealId);
      if (revealItem) {
        addText(`Something has appeared: <span class="look-target" data-look="${revealId}" data-type="item-pickup">${revealItem.name}</span>`, 'success');
      }
    });

    renderInventory();
    checkWin();
    saveState();
    return;
  }

  addText("That doesn't seem to work here.", 'system');
}

// ---- Try to solve any scene puzzle (for safe/code puzzles) ----
function tryScenePuzzle() {
  const unsolved = getUnsolvedPuzzles(state.currentScene);

  for (const puzzle of unsolved) {
    // Puzzles with no requirements (like entering a code)
    if (puzzle.requires.length === 0) {
      state.solvedPuzzles.push(puzzle.id);
      showPuzzleSolvedEffect();
      addText(puzzle.result, 'success');

      (puzzle.reveals || []).forEach(revealId => {
        const revealItem = GAME_DATA.items.find(i => i.id === revealId);
        if (revealItem) {
          addText(`You found: <strong>${revealItem.name}</strong>!`, 'success');
          // Auto-add to inventory for safe reward
          if (!state.inventory.includes(revealId)) {
            state.inventory.push(revealId);
          }
        }
      });

      renderInventory();
      checkWin();
      saveState();
      return true;
    }

    // Puzzles where all requirements are already in inventory
    const hasAllReqs = puzzle.requires.every(req => state.inventory.includes(req));
    if (hasAllReqs) {
      state.solvedPuzzles.push(puzzle.id);
      showPuzzleSolvedEffect();
      addText(puzzle.result, 'success');

      (puzzle.reveals || []).forEach(revealId => {
        const revealItem = GAME_DATA.items.find(i => i.id === revealId);
        if (revealItem) {
          addText(`You found: <strong>${revealItem.name}</strong>!`, 'success');
          if (!state.inventory.includes(revealId)) {
            state.inventory.push(revealId);
          }
        }
      });

      renderInventory();
      checkWin();
      saveState();
      return true;
    }
  }

  return false;
}

// ---- Move to another scene ----
function go(sceneId) {
  addText('---', 'system');
  renderScene(sceneId);
}

// ---- Check Win Condition ----
function checkWin() {
  if (state.won) return;

  const wc = GAME_DATA.winCondition;
  if (!wc) return;

  if (state.currentScene === wc.scene) {
    // Check if player has signal flare and can fire it
    if (state.inventory.includes('signal_flare') && !state.solvedPuzzles.includes('finale_flare')) {
      addText('<em>You could fire the signal flare here...</em>', 'system');
    }

    if (state.solvedPuzzles.includes('finale_flare')) {
      state.won = true;
      addText('', '');
      addText('═══════════════════════════════════════', 'success');
      addText('*** ' + wc.description + ' ***', 'success');
      addText('═══════════════════════════════════════', 'success');
      addText('', '');
      addText('🎉 CONGRATULATIONS! YOU HAVE COMPLETED THE GAME! 🎉', 'success');
      addText('', '');
      addText('The carnival fades behind you as rescue lights approach.', 'system');
      addText('The Last Showman\'s Carnival claims no more victims tonight.', 'system');
      addText('', '');
      addText('Refresh the page to play again.', 'system');
    }
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
  const target = e.target.closest('.look-target');
  if (!target) return;

  const targetId = target.dataset.look;
  const targetType = target.dataset.type;

  // Item pickup
  if (targetType === 'item-pickup') {
    takeItem(targetId);
    return;
  }

  // If using an item
  if (state.activeCommand === 'use' && state.selectedItem) {
    useItemOn(state.selectedItem, targetId);
    state.selectedItem = null;
    renderInventory();
    return;
  }

  // Look/examine
  lookAt(targetId);
});

// ---- Special: handle "use" on scene elements ----
document.addEventListener('click', (e) => {
  if (state.activeCommand === 'use' && !state.selectedItem) {
    // Check if user clicked on a puzzle target while in USE mode
    // Try to auto-solve if player has right items
    if (tryScenePuzzle()) {
      // Puzzle was solved
    }
  }
});

// ---- Initialize Game ----
function init() {
  addText('═══════════════════════════════════════', 'success');
  addText('  THE LAST SHOWMAN\'S CARNIVAL', 'success');
  addText('═══════════════════════════════════════', 'success');
  addText('', '');
  addText(GAME_DATA.setting, 'system');
  addText('', '');
  addText('Commands: <strong>LOOK</strong> | <strong>TAKE</strong> | <strong>USE</strong> | <strong>EXAMINE</strong>', 'system');
  addText('Click exits to move. Click highlighted items to interact.', 'system');
  addText('---', 'system');

  if (!loadState()) {
    renderScene('midway');
  } else {
    renderScene(state.currentScene);
    addText('[Game restored from save]', 'system');
  }
}

// Start the game
init();
