// ============================================================
// THE HYDROTHERAPY WING - Game Logic
// ============================================================

var GAME_DATA = {
  title: "The Hydrotherapy Wing",
  slug: "022-the-hydrotherapy-wing",
  scenes: [
    {
      id: "entrance-hall",
      name: "Entrance Hall",
      prose: "A grand Victorian entrance hall with marble floors and ornate tilework. Tall windows let in cold moonlight, casting long shadows across cracked plaster walls. A rusted iron gate blocks the passage to the hydrotherapy chambers.",
      lookDescription: "The once-elegant entrance is now decayed. Broken glass litters the floor. The iron gate stands partially open, leading deeper into the wing.",
      exits: {}, // Initially locked by gate
      items: ["rusted-key"],
      lookDescriptions: {
        "gate": "A rusted iron gate, its hinges fused with age. It blocks the northern passage completely.",
        "floor": "Cracked marble covered in broken glass and dust.",
        "windows": "Tall, arched windows letting in cold moonlight."
      }
    },
    {
      id: "corridor",
      name: "Main Corridor",
      prose: "A long, dark corridor lined with peeling green paint and rusted copper pipes running along the ceiling. Broken porcelain tiles crunch underfoot. At the far end, a heavy wooden door stands ajar.",
      lookDescription: "The corridor stretches ahead, pipes dripping condensation. Water stains the walls in eerie patterns. A treatment room door is visible to the left.",
      exits: {
        south: "entrance-hall",
        west: "treatment-room",
        east: "shower-chamber",
        north: "final-chamber"
      },
      items: [],
      lookDescriptions: {
        "pipes": "Rusted copper pipes running along the ceiling, dripping condensation.",
        "door": "A heavy wooden door at the far end, slightly ajar.",
        "walls": "Water stains form eerie, almost deliberate patterns on the peeling green paint."
      }
    },
    {
      id: "treatment-room",
      name: "Treatment Room",
      prose: "A cramped treatment room with a rusted iron bathtub bolted to the floor. Medical instruments hang from hooks on cracked white tiles. Dried brown stains mar the porcelain surfaces.",
      lookDescription: "The iron tub is stained with corrosion. Medical tools—forceps, scalpels—hang in a row. A small cabinet against the wall is locked.",
      exits: {
        east: "corridor"
      },
      items: ["cabinet-key"], // Scalpel is hidden in cabinet
      lookDescriptions: {
        "cabinet": "A small metal medical cabinet, locked tight. A keyhole is visible on the front.",
        "tub": "A rusted iron bathtub bolted to the floor, stained with age and worse.",
        "tools": "Medical tools hang from hooks—forceps, clamps, and empty spaces where scalpels once were."
      }
    },
    {
      id: "shower-chamber",
      name: "Shower Chamber",
      prose: "A large tiled chamber with multiple shower heads descending from the ceiling like iron stalactites. The floor drains are clogged with dark debris. Steam wisps rise from cracks in the cold tiles.",
      lookDescription: "The shower heads loom overhead, rusted and menacing. The tilework shows intricate Victorian patterns now covered in grime. A floor grate is loose in one corner.",
      exits: {
        west: "corridor"
        // Down to plumbing-access unlocked by taking floor-grate
      },
      items: ["floor-grate"],
      lookDescriptions: {
        "shower-heads": "Iron shower heads descending from the ceiling like stalactites.",
        "grate": "A square iron floor grate, loose in one corner. It seems to cover a passage below.",
        "tiles": "Intricate Victorian tilework, now covered in grime and water stains."
      }
    },
    {
      id: "plumbing-access",
      name: "Plumbing Access Room",
      prose: "A cramped maintenance crawlspace beneath the hydrotherapy chambers. Thick pipes converge in a tangle of valves and pressure gauges. The air is thick with the smell of stagnant water and rust.",
      lookDescription: "A labyrinth of pipes and valves. A large central valve stands out—one that could control the entire wing's water pressure. Tools are scattered on the metal grating floor.",
      exits: {
        up: "shower-chamber"
      },
      items: ["pressure-valve-handle"],
      lookDescriptions: {
        "valve": "A large central valve with a missing handle. It controls the water pressure for the entire wing.",
        "pipes": "Thick pipes converge in a tangle, some leaking, others silent.",
        "gauges": "Pressure gauges, their needles frozen at various positions."
      }
    },
    {
      id: "final-chamber",
      name: "The Final Chamber",
      prose: "The heart of the hydrotherapy wing—a vast circular chamber with a sunken pool at its center. Stained glass windows cast colored light through murky water. Ancient machinery surrounds the pool, waiting to be activated.",
      lookDescription: "The pool dominates the room, its water black and still. Mechanical gears and chains line the walls. In the center of the pool, something glimmers beneath the surface.",
      exits: {
        south: "corridor"
      },
      items: ["cogwheel", "ancient-manual"],
      lookDescriptions: {
        "pool": "A sunken pool filled with black, murky water. Something glimmers at the bottom.",
        "machinery": "Ancient gears and chains line the walls, waiting to be activated.",
        "windows": "Stained glass windows casting colored light through the murky water.",
        "drain": "A drain mechanism at the edge of the pool, missing a cogwheel."
      }
    }
  ],
  items: [
    {
      id: "rusted-key",
      name: "Rusted Iron Key",
      description: "A heavy iron key, its teeth eaten by rust. It bears a faded tag reading 'ENTRANCE GATE.'"
    },
    {
      id: "scalpel",
      name: "Surgical Scalpel",
      description: "A steel scalpel with a wooden handle, its blade still sharp despite the years. Dried brown residue clings to the metal."
    },
    {
      id: "cabinet-key",
      name: "Cabinet Key",
      description: "A small brass key stamped with 'MEDICAL CABINET.' The teeth are intact and clean."
    },
    {
      id: "floor-grate",
      name: "Floor Grate",
      description: "A square iron floor grate, heavy and cold. Removing it reveals a dark drain passage below."
    },
    {
      id: "pressure-valve-handle",
      name: "Pressure Valve Handle",
      description: "A large iron wheel with six spokes, designed to fit the central pressure valve in the plumbing room."
    },
    {
      id: "cogwheel",
      name: "Brass Cogwheel",
      description: "A heavy brass gear with precisely-cut teeth. It appears to be part of the pool's drain mechanism."
    },
    {
      id: "ancient-manual",
      name: "Operator's Manual",
      description: "A water-damaged booklet titled 'Hydrotherapy Machinery - Operating Instructions.' The pages are brittle but legible."
    }
  ],
  puzzles: [
    {
      id: "gate",
      scene: "entrance-hall",
      requires: ["rusted-key"],
      action: "use",
      target: "gate",
      result: "The rusted key turns with a grinding shriek. The iron gate swings open, revealing the dark corridor beyond.",
      unlocks: { scene: "entrance-hall", direction: "north", target: "corridor" }
    },
    {
      id: "cabinet",
      scene: "treatment-room",
      requires: ["cabinet-key"],
      action: "use",
      target: "cabinet",
      result: "The cabinet clicks open. Inside, lying on a stained cloth, is a surgical scalpel.",
      reveals: ["scalpel"]
    },
    {
      id: "grate",
      scene: "shower-chamber",
      requires: [],
      action: "take",
      target: "floor-grate",
      result: "You heave the heavy grate aside, revealing a dark passage down into the plumbing below.",
      unlocks: { scene: "shower-chamber", direction: "down", target: "plumbing-access" }
    },
    {
      id: "valve",
      scene: "plumbing-access",
      requires: ["pressure-valve-handle"],
      action: "use",
      target: "valve",
      result: "You turn the wheel. A deep groan echoes through the pipes, and the sound of rushing water fades. The pressure is released.",
      setsFlag: "water_drained"
    },
    {
      id: "drain",
      scene: "final-chamber",
      requires: ["cogwheel"],
      action: "use",
      target: "drain",
      result: "You slot the brass cogwheel into the mechanism. It meshes perfectly with a satisfying clack. The drain is now operational.",
      setsFlag: "drain_fixed"
    }
  ],
  winCondition: {
    scene: "final-chamber",
    requires: ["ancient-manual"],
    requiresFlags: ["water_drained", "drain_fixed"],
    description: "You drain the pool, revealing the ancient escape hatch. You climb out into the dawn light, leaving the horrors of the Hydrotherapy Wing behind."
  }
};

// ---- Game State ----
var state = {
  currentScene: 'entrance-hall',
  inventory: [],
  solvedPuzzles: [],
  visitedScenes: ['entrance-hall'],
  activeCommand: null,
  selectedItem: null,
  won: false,
  flags: []
};

// ---- Base Exits (before puzzle modifications) ----
var BASE_EXITS = {
  "entrance-hall": {},
  "corridor": { "south": "entrance-hall", "west": "treatment-room", "east": "shower-chamber", "north": "final-chamber" },
  "treatment-room": { "east": "corridor" },
  "shower-chamber": { "west": "corridor" },
  "plumbing-access": { "up": "shower-chamber" },
  "final-chamber": { "south": "corridor" }
};

// ---- DOM References ----
var artDisplay = document.getElementById('art-display');
var sceneName = document.getElementById('scene-name');
var textDisplay = document.getElementById('text-display');
var invBar = document.getElementById('inventory-bar');
var exitsBar = document.getElementById('exits-bar');

// ---- Display Functions ----
function addText(text, cls) {
  cls = cls || '';
  var p = document.createElement('p');
  p.className = cls;
  p.innerHTML = text;
  textDisplay.appendChild(p);
  textDisplay.scrollTop = textDisplay.scrollHeight;
}

function clearText() { textDisplay.innerHTML = ''; }

function getExits(sceneId) {
  var exits = {};
  var base = BASE_EXITS[sceneId] || {};
  // Copy base exits
  for (var dir in base) {
    exits[dir] = base[dir];
  }
  // Apply puzzle unlocks
  GAME_DATA.puzzles.forEach(function(p) {
    if (p.unlocks && p.unlocks.scene === sceneId && state.solvedPuzzles.includes(p.id)) {
      exits[p.unlocks.direction] = p.unlocks.target;
    }
  });
  return exits;
}

function renderScene(sceneId) {
  var scene = GAME_DATA.scenes.find(function(s) { return s.id === sceneId; });
  if (!scene) { addText('ERROR: Scene not found!', 'error'); return; }

  state.currentScene = sceneId;
  if (!state.visitedScenes.includes(sceneId)) state.visitedScenes.push(sceneId);

  // Update scene name
  sceneName.textContent = scene.name.toUpperCase();

  // Update art
  var artKey = sceneId;
  if (window.GAME_ART && window.GAME_ART[artKey]) {
    artDisplay.innerHTML = window.GAME_ART[artKey];
  } else {
    artDisplay.innerHTML = '<span class="no-art">[ ' + scene.name.toUpperCase() + ' ]</span>';
  }

  // Display prose
  clearText();
  addText(scene.prose);

  // Show available items (not yet taken)
  var availableItems = (scene.items || []).filter(function(itemId) {
    return !state.inventory.includes(itemId);
  });
  if (availableItems.length > 0) {
    var itemNames = availableItems.map(function(id) {
      var item = GAME_DATA.items.find(function(i) { return i.id === id; });
      return item ? '<span class="look-target" data-look="' + id + '">' + item.name + '</span>' : id;
    });
    addText('You notice: ' + itemNames.join(', '), 'system');
  }

  // Render exits
  renderExits(getExits(sceneId));

  // Render inventory
  renderInventory();

  // Check win condition
  checkWin();

  // Save state
  saveState();
}

function renderExits(exits) {
  exitsBar.innerHTML = '';
  var directions = ['north', 'south', 'east', 'west', 'up', 'down'];
  directions.forEach(function(dir) {
    var btn = document.createElement('button');
    btn.className = 'exit-btn' + (exits[dir] ? ' available' : '');
    btn.textContent = dir.toUpperCase();
    btn.disabled = !exits[dir];
    if (exits[dir]) {
      btn.onclick = function() { go(exits[dir]); };
    }
    exitsBar.appendChild(btn);
  });
}

function renderInventory() {
  var items = invBar.querySelectorAll('.inv-item');
  items.forEach(function(el) { el.remove(); });
  var empty = document.getElementById('inv-empty');

  if (state.inventory.length === 0) {
    empty.style.display = '';
  } else {
    empty.style.display = 'none';
    state.inventory.forEach(function(itemId) {
      var item = GAME_DATA.items.find(function(i) { return i.id === itemId; });
      if (!item) return;
      var el = document.createElement('span');
      el.className = 'inv-item' + (state.selectedItem === itemId ? ' selected' : '');
      el.textContent = item.name;
      el.onclick = function() { selectItem(itemId); };
      invBar.appendChild(el);
    });
  }
}

// ---- Command Handlers ----
function setCommand(cmd) {
  state.activeCommand = cmd;
  document.querySelectorAll('.cmd-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.cmd === cmd);
  });
  if (cmd === 'look') {
    var scene = GAME_DATA.scenes.find(function(s) { return s.id === state.currentScene; });
    if (scene && scene.lookDescriptions) {
      var targets = Object.keys(scene.lookDescriptions);
      if (targets.length > 0) {
        addText('You can examine: ' + targets.map(function(t) {
          return '<span class="look-target" data-look="' + t + '">' + t + '</span>';
        }).join(', '), 'system');
      }
    }
  } else if (cmd === 'examine') {
    var scene = GAME_DATA.scenes.find(function(s) { return s.id === state.currentScene; });
    if (scene && scene.lookDescriptions) {
      var targets = Object.keys(scene.lookDescriptions);
      if (targets.length > 0) {
        addText('Select something to examine: ' + targets.map(function(t) {
          return '<span class="look-target" data-look="' + t + '">' + t + '</span>';
        }).join(', '), 'system');
      }
    }
  } else if (cmd === 'use') {
    if (state.inventory.length > 0) {
      addText('Select an item from your inventory, then click what to use it on.', 'system');
    } else {
      addText('You have nothing to use.', 'system');
    }
  } else if (cmd === 'take') {
    var scene = GAME_DATA.scenes.find(function(s) { return s.id === state.currentScene; });
    var available = (scene.items || []).filter(function(id) { return !state.inventory.includes(id); });
    if (available.length > 0) {
      available.forEach(function(id) { takeItem(id); });
    } else {
      addText('Nothing here to take.', 'system');
    }
  }
}

function selectItem(itemId) {
  state.selectedItem = state.selectedItem === itemId ? null : itemId;
  renderInventory();
  if (state.selectedItem) {
    var item = GAME_DATA.items.find(function(i) { return i.id === itemId; });
    addText('Selected: ' + item.name + '. Click USE, then a target.', 'system');
  }
}

function takeItem(itemId) {
  if (state.inventory.includes(itemId)) return;
  var item = GAME_DATA.items.find(function(i) { return i.id === itemId; });
  var scene = GAME_DATA.scenes.find(function(s) { return s.id === state.currentScene; });
  if (!scene || !(scene.items || []).includes(itemId)) return;

  state.inventory.push(itemId);
  if (item) {
    addText('You picked up: ' + item.name + ' — ' + item.description, 'success');
  } else {
    addText('You picked up: ' + itemId.replace(/-/g, ' '), 'success');
  }
  
  // Handle grate puzzle (solved by taking the item)
  if (itemId === 'floor-grate') {
    var p = GAME_DATA.puzzles.find(function(pz) { return pz.id === 'grate'; });
    if (p && !state.solvedPuzzles.includes(p.id)) {
      state.solvedPuzzles.push(p.id);
      addText(p.result, 'success');
      // Visual feedback
      if (artDisplay) {
        artDisplay.classList.add('puzzle-solved');
        setTimeout(function() { artDisplay.classList.remove('puzzle-solved'); }, 600);
      }
    }
  }

  renderInventory();
  saveState();
}

function lookAt(target) {
  var scene = GAME_DATA.scenes.find(function(s) { return s.id === state.currentScene; });
  if (scene && scene.lookDescriptions && scene.lookDescriptions[target]) {
    addText(scene.lookDescriptions[target]);
  } else {
    // Check if it's an item
    var item = GAME_DATA.items.find(function(i) { return i.id === target; });
    if (item) {
      addText(item.description);
    } else {
      addText('Nothing interesting about that.', 'system');
    }
  }
}

function useItemOn(itemId, targetId) {
  var puzzle = GAME_DATA.puzzles.find(function(p) {
    return p.scene === state.currentScene &&
           p.requires.includes(itemId) &&
           p.id === targetId &&
           !state.solvedPuzzles.includes(p.id);
  });

  if (puzzle && puzzle.requires.every(function(req) { return state.inventory.includes(req); })) {
    state.solvedPuzzles.push(puzzle.id);
    addText(puzzle.result, 'success');
    
    // Handle flag setting
    if (puzzle.setsFlag) {
      if (!state.flags.includes(puzzle.setsFlag)) {
        state.flags.push(puzzle.setsFlag);
      }
    }
    
    // Handle puzzle reveals
    (puzzle.reveals || []).forEach(function(revealId) {
      var revealItem = GAME_DATA.items.find(function(i) { return i.id === revealId; });
      if (revealItem) {
        if (!state.inventory.includes(revealId)) {
          state.inventory.push(revealId);
          addText('You found: ' + revealItem.name + '!', 'success');
        }
      } else {
        addText('Something has been revealed: ' + revealId, 'system');
      }
    });
    
    // Visual feedback
    if (artDisplay) {
      artDisplay.classList.add('puzzle-solved');
      setTimeout(function() { artDisplay.classList.remove('puzzle-solved'); }, 600);
    }
    
    renderInventory();
    checkWin();
    saveState();
  } else {
    addText("That doesn't seem to work.", 'system');
  }
}

function go(sceneId) {
  addText('---', 'system');
  renderScene(sceneId);
}

function checkWin() {
  if (state.won) return;
  var wc = GAME_DATA.winCondition;
  if (!wc) return;
  
  // Standard item check
  var hasItems = wc.requires.every(function(req) { return state.inventory.includes(req); });
  
  // Custom flag check for this game
  var hasFlags = true;
  if (wc.requiresFlags) {
    hasFlags = wc.requiresFlags.every(function(f) { return state.flags.includes(f); });
  }

  if (state.currentScene === wc.scene && hasItems && hasFlags) {
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
    var saved = localStorage.getItem('game-' + GAME_DATA.slug);
    if (saved) {
      var s = JSON.parse(saved);
      Object.assign(state, s);
      return true;
    }
  } catch(e) {}
  return false;
}

// ---- Event Listeners ----
document.querySelectorAll('.cmd-btn').forEach(function(btn) {
  btn.onclick = function() { setCommand(btn.dataset.cmd); };
});

document.addEventListener('click', function(e) {
  if (e.target.classList.contains('look-target')) {
    var target = e.target.dataset.look;
    if (state.activeCommand === 'use' && state.selectedItem) {
      useItemOn(state.selectedItem, target);
    } else if (state.activeCommand === 'examine') {
      lookAt(target);
    } else {
      lookAt(target);
    }
  }
});

// ---- Initialize ----
function init() {
  if (Object.keys(GAME_DATA).length === 0) {
    addText('ERROR: No game data loaded.', 'error');
    return;
  }

  addText('=== ' + GAME_DATA.title.toUpperCase() + ' ===', 'success');
  addText('A Victorian-era sanatorium\'s abandoned hydrotherapy wing.', 'system');
  addText('', '');
  addText('Commands: LOOK | TAKE | USE | EXAMINE', 'system');
  addText('Click exits to move between rooms.', 'system');
  addText('---', 'system');

  if (!loadState()) {
    renderScene('entrance-hall');
  } else {
    renderScene(state.currentScene);
    addText('[Game restored from save]', 'system');
  }
}

init();
