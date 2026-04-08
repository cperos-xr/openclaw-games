// game-logic.js for The Lantern That Watches (Game #40)
// Engine built by Hex Corbin

// ============================================================
// GAME DATA (from final corrected game-script.json)
// ============================================================
const GAME_DATA = {
  "title": "The Lantern That Watches",
  "slug": "the-lantern-that-watches",
  "number": 40,
  "setting": "Blackwater Island, off the coast of Maine, October 1952. The lighthouse keeper Elias Harrow vanished three weeks ago. You are Coast Guard Petty Officer Thomas Reid, sent to investigate. The lantern room at the top of the tower still burns, though no one tends it. The fog has rolled in thick, the kind that swallows sound, and the island holds its breath.",
  "characters": [
    { "id": "reid", "name": "Petty Officer Thomas Reid", "description": "Coast Guard investigator, 34, pragmatist with a gift for noticing what others overlook. Not a believer in ghosts, but the silence out here tests his resolve." },
    { "id": "elias-harrow", "name": "Elias Harrow", "description": "The missing keeper. His journal speaks of 'the lantern's hunger' and names from before the island had a name." },
    { "id": "the-lantern", "name": "The Lantern", "description": "A presence, not a person. It resides in the light at the top of the tower. It watches. It remembers." }
  ],
  "items": [
    {
      "id": "lens-polish",
      "name": "Lens Polish",
      "description": "A tin of brass polish, long dried in its container. Smells faintly of turpentine and old metal.",
      "foundIn": "lantern-room",
      "usedIn": "lantern-room",
      "usedOn": "fresnel-lens"
    },
    {
      "id": "keeper-keys",
      "name": "Keeper's Keys",
      "description": "A heavy brass keyring found tucked into the logbook's spine. Three keys: one for the tower door, one for the cellar, one with a tag reading 'SUPPLY ROOM'.",
      "foundIn": "keepers-cottage",
      "usedIn": "keepers-cottage",
      "usedOn": "cellar-door"
    },
    {
      "id": "emergency-flare",
      "name": "Emergency Flare",
      "description": "A road flare, wrapped in oilcloth. Still strikes. Elias used this to 'signal back.'",
      "foundIn": "fog-beach",
      "usedIn": "fog-beach",
      "usedOn": "shoreline-mark"
    },
    {
      "id": "foghorn-lever",
      "name": "Foghorn Lever",
      "description": "A cast-iron lever, broken at the base. Elias removed it from the foghorn mechanism. The journal says it 'would not stay silent.'",
      "foundIn": "cottage-cellar",
      "usedIn": "foghorn-station",
      "usedOn": "foghorn-housing"
    },
    {
      "id": "salt-bag",
      "name": "Bag of Sea Salt",
      "description": "A muslin pouch filled with coarse salt, tied with red string. Elias marked it: 'For the threshold. Do not cross without it.'",
      "foundIn": "keepers-cottage",
      "usedIn": "tower-base",
      "usedOn": "tower-doorway"
    }
  ],
  "scenes": [
    {
      "id": "fog-beach",
      "name": "The Fog Beach",
      "prose": "The boat scrapes ashore on wet stones, and you step into a fog so thick it feels like wading through cold wool. Visibility is ten feet, maybe less — the world reduced to the groan of waves, the bite of salt on your lips, and the slow drift of shapes that might be driftwood or might be something else. Your boots sink slightly in the saturated sand, each step leaving a print that the tide hasn't yet claimed. Near the water's edge, wrapped in oilcloth against the damp, lies your emergency flare — a stark crimson smudge in the monochrome gray. The fog doesn't just hide the island; it feels alive, pressing in from all sides, holding its breath. You can almost hear it listening.",
      "exits": {
        "northeast": "keepers-cottage"
      },
      "items": ["emergency-flare"],
      "puzzles": [],
      "lookDescriptions": {
        "shoreline-mark": "A shallow depression in the sand at the water's edge, shaped like a handprint. The mark glows faintly when you look at it sideways."
      }
    },
    {
      "id": "keepers-cottage",
      "name": "Keeper's Cottage",
      "prose": "The cottage leans into the wind like a drunkard seeking shelter, its paint long surrendered to salt and time. The door hangs ajar, one hinge screaming its protest with every breath of breeze that slips inside. Warmth lingers in the air — not from a fire, but from the ghost of recent occupancy. On a scrubbed pine table sits a chipped mug, cold coffee congealed at the bottom, and Elias Harrow's logbook, its leather cover salt-stained and cracked. Tucked where the spine meets the pages, the keeper's keys gleam dull brass, heavy with promise. On a nearby shelf, a muslin pouch of coarse sea salt rests, tied with a fraying red string — Elias's insurance against whatever walks the fog. The place feels abandoned in a hurry, as if someone stepped out for a moment and never came back to finish their thought.",
      "exits": {
        "north": "tower-base",
        "southwest": "fog-beach",
        "down": "cottage-cellar"
      },
      "items": ["keeper-keys", "salt-bag"],
      "puzzles": [
        {
          "id": "cellar-lock",
          "scene": "keepers-cottage",
          "requires": ["keeper-keys"],
          "action": "Use the cellar key to unlock the trapdoor in the cottage floor.",
          "result": "The brass key turns with a gratifying click. The trapdoor's iron bindings creak as it releases, revealing the dark opening to the cellar below.",
          "blocksExit": {
            "down": "cottage-cellar"
          }
        }
      ],
      "lookDescriptions": {
        "cellar-door": "A heavy wooden trapdoor set into the cottage floor, bound in iron straps. A keyhole gleams at its center."
      }
    },
    {
      "id": "cottage-cellar",
      "name": "Cottage Cellar",
      "prose": "The cellar door groans inward on rusted hinges, revealing a space that drinks light. Stone walls weep moisture onto a packed-earth floor, and the air hangs thick with the smell of wet rock and something older — rot that isn't quite decay, more like the breath of things best left buried. A single bare bulb swings faintly from the ceiling, casting jittering shadows that seem to move when you're not looking directly at them. The walls here breathe in a rhythm that doesn't match your own, slow and patient and deeply, deeply wrong.",
      "exits": {
        "up": "keepers-cottage"
      },
      "items": ["foghorn-lever"],
      "puzzles": [],
      "lookDescriptions": {}
    },
    {
      "id": "tower-base",
      "name": "Tower Base",
      "prose": "The lighthouse foundation is rough-hewn granite, blocks fitted together with a precision that speaks of an era when men took pride in making things last. Darkness yawns at the base of the stone stairs, a throat opening upward into the tower's belly. Air rises from below — not warm, not cold, but carrying a mineral tang, like licking a battery, and it makes the hairs on your arms stand upright. Each step you don't take feels like a vote against gravity, as if the stairs themselves would rather you stay planted where you are, feet solid on the earth. The salt in your pouch seems to pulse faintly, not with magic, but with the weight of intention — Elias spread this very substance across the threshold not to keep something out, but to mark where the safety ends and the obligation begins. The tower doesn't call you up; it waits, indifferent, for you to decide if you're worthy of the climb.",
      "exits": {
        "south": "keepers-cottage",
        "up": "foghorn-station"
      },
      "items": [],
      "puzzles": [
        {
          "id": "threshold-salt",
          "scene": "tower-base",
          "requires": ["salt-bag"],
          "action": "Sprinkle salt across the threshold before ascending.",
          "result": "The salt creates a faint line of protection across the stone floor. You step over it, feeling the weight of the island shift.",
          "blocksExit": {
            "up": "foghorn-station"
          }
        }
      ],
      "lookDescriptions": {
        "tower-doorway": "The stone archway at the base of the tower, marked by a faint circle of salt already scattered by Elias across the threshold."
      }
    },
    {
      "id": "foghorn-station",
      "name": "Foghorn Station",
      "prose": "Halfway up the tower, the air thickens, not with moisture but with sound — or rather, the expectation of it. The foghorn mechanism looms before you, a massive brass horn the size of a coffin, its throat aimed eternally out to sea. It has been wailing. Not intermittently, not as a warning, but a continuous, subsonic drone that you feel in your molars before you hear it, a vibration that makes your vision blur at the edges. The air itself feels compressed, pressurized by the sheer wrongness of the noise pressing outward from the horn's maw. The foghorn lever is missing from its housing — Elias removed it, and it now lies cold on the iron grating. To reattach it is to silence not just a horn, but whatever has been answering its call across the water. The silence that follows won't be peace; it will be the pause before something decides whether to follow you upward or let you go.",
      "exits": {
        "down": "tower-base",
        "up": "lantern-room"
      },
      "items": [],
      "puzzles": [
        {
          "id": "foghorn-silence",
          "scene": "foghorn-station",
          "requires": ["foghorn-lever"],
          "action": "Reattach the foghorn lever to its housing to silence the horn that will not stop.",
          "result": "The lever clicks into place. The foghorn gives one last mournful cry and falls silent. The way upward clears.",
          "blocksExit": {
            "up": "lantern-room"
          }
        }
      ],
      "lookDescriptions": {
        "foghorn-housing": "The brass housing for the foghorn lever, empty and waiting. A socket gouged into the mechanism where the lever once sat."
      }
    },
    {
      "id": "lantern-room",
      "name": "Lantern Room",
      "prose": "At the top of the tower, the world narrows to a circle of glass and light. The Fresnel lens dominates the space, a beehive of prisms designed to turn a single flame into a beacon for miles — except the flame inside burns with a light that hurts to look at, too white, too sharp, like staring into a welder's arc. The lens surface is clouded with salt and time, obscuring whatever mechanism turns it, but etched faintly into the glass itself are names and dates, dozens of them, overlapping like a palimpsest of the vanished or the damned. The light turns in its slow, inexorable sweep, painting the room in alternating waves of brilliance and shadow, and in those moments when the beam passes directly over you, you don't see your reflection in the glass. You see something standing just behind you, wearing your face but missing the vital spark that makes you alive, and it is smiling.",
      "exits": {},
      "items": ["lens-polish"],
      "puzzles": [],
      "lookDescriptions": {
        "fresnel-lens": "A massive fresnel lens, its prisms clouded with salt spray. The surface is etched with overlapping names and dates, a ledger of the lost."
      }
    }
  ],
  "puzzles": [
    {
      "id": "cellar-lock",
      "scene": "keepers-cottage",
      "requires": ["keeper-keys"],
      "action": "Use the cellar key to unlock the trapdoor in the cottage floor.",
      "result": "The brass key turns with a gratifying click. The trapdoor's iron bindings creak as it releases, revealing the dark opening to the cellar below.",
      "blocksExit": {
        "down": "cottage-cellar"
      }
    },
    {
      "id": "threshold-salt",
      "scene": "tower-base",
      "requires": ["salt-bag"],
      "action": "Salt the threshold before ascending the tower stairs.",
      "result": "The salt creates a faint line of protection across the stone floor. You step over it, feeling the weight of the island shift.",
      "blocksExit": {
        "up": "foghorn-station"
      }
    },
    {
      "id": "foghorn-silence",
      "scene": "foghorn-station",
      "requires": ["foghorn-lever"],
      "action": "Reattach the foghorn lever to silence the horn.",
      "result": "The lever clicks into place. The foghorn gives one last mournful cry and falls silent. The way upward clears.",
      "blocksExit": {
        "up": "lantern-room"
      }
    },
    {
      "id": "lens-cleaning",
      "scene": "lantern-room",
      "requires": ["lens-polish"],
      "action": "Polish the Fresnel lens in the lantern room.",
      "result": "The lens brightens, revealing something etched into the glass — a name, and a date. The lantern stops its rhythmic turning. The light steadies. Something looks back."
    },
    {
      "id": "flares-beach",
      "scene": "fog-beach",
      "requires": ["emergency-flare"],
      "action": "Strike the flare at the shoreline mark to signal back.",
      "result": "The flare burns crimson against the fog. For a moment, you see what has been watching from the treeline — not a person, not quite. The mark on the shore glows in response. The island releases its grip."
    }
  ],
  "winCondition": {
    "scene": "fog-beach",
    "requires": ["flares-beach", "lens-cleaning"],
    "description": "Having silenced the foghorn, salted the threshold, cleaned the lens, and struck the flare at the shore, you break the island's hold. The fog begins to lift. You can signal for extraction. Elias Harrow's fate is yours to carry, but you are not trapped — not yet."
  }
};

// ============================================================
// GAME STATE
// ============================================================
const state = {
  currentScene: null,
  inventory: [],
  solvedPuzzles: [],
  visitedScenes: [],
  activeCommand: null,
  selectedItem: null,
  won: false
};

// ============================================================
// DOM REFERENCES
// ============================================================
const artDisplay = document.getElementById('art-display');
const sceneName = document.getElementById('scene-name');
const textDisplay = document.getElementById('text-display');
const invBar = document.getElementById('inventory-bar');
const exitsBar = document.getElementById('exits-bar');
const cmdButtons = document.querySelectorAll('.cmd-btn');

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function addText(text, cls = '') {
  const p = document.createElement('p');
  if (cls) p.className = cls;
  p.innerHTML = text;
  textDisplay.appendChild(p);
  textDisplay.scrollTop = textDisplay.scrollHeight;
}

function clearText() {
  textDisplay.innerHTML = '';
}

// ============================================================
// EXIT BLOCKING LOGIC (supports both old and new blocksExit formats)
// ============================================================
function canExit(sceneId, direction) {
  const scene = GAME_DATA.scenes.find(s => s.id === sceneId);
  if (!scene || !scene.exits || !scene.exits[direction]) {
    return { allowed: false, message: "No exit that way." };
  }
  const blocker = GAME_DATA.puzzles.find(p => {
    if (p.scene !== sceneId) return false;
    const b = p.blocksExit;
    if (!b) return false;
    // New format: { "direction": "targetScene" } has key equals direction
    if (b.hasOwnProperty(direction)) return true;
    // Old format: { "direction": "north", "scene": "...", ... }
    if (b.direction && b.direction === direction) return true;
    return false;
  });
  if (blocker && !state.solvedPuzzles.includes(blocker.id)) {
    return { allowed: false, message: blocker.blockedMessage || `The way ${direction} is blocked.` };
  }
  return { allowed: true };
}

// ============================================================
// RENDERING
// ============================================================
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

  // Scene title
  sceneName.textContent = scene.name.toUpperCase();

  // Art display (placeholder until GAME_ART is provided)
  artDisplay.innerHTML = `<span class="no-art">[ ${scene.name.toUpperCase()} ]</span>`;

  // Text
  clearText();
  addText(scene.prose);

  // Items in scene (not yet taken)
  const sceneItems = (scene.items || []).filter(itemId => !state.inventory.includes(itemId));
  if (sceneItems.length > 0) {
    const itemSpans = sceneItems.map(id => {
      const item = GAME_DATA.items.find(i => i.id === id);
      return item ? `<span class="look-target" data-look="${id}">${item.name}</span>` : id;
    });
    addText('You notice: ' + itemSpans.join(', '), 'system');
  }

  // Interactive objects via lookDescriptions
  if (scene.lookDescriptions && Object.keys(scene.lookDescriptions).length > 0) {
    const targets = Object.keys(scene.lookDescriptions).map(key =>
      `<span class="look-target" data-look="${key}">${key}</span>`
    );
    addText('You can examine: ' + targets.join(', '), 'system');
  }

  // Exits (only those not blocked)
  renderExits(scene.exits || {});

  // Inventory
  renderInventory();

  // Win check
  checkWin();

  // Persist
  saveState();
}

function renderExits(exits) {
  exitsBar.innerHTML = '';
  Object.keys(exits).forEach(dir => {
    const targetScene = exits[dir];
    const check = canExit(state.currentScene, dir);
    if (!check.allowed) {
      return; // Do not show blocked exits
    }
    const btn = document.createElement('button');
    btn.className = 'exit-btn available';
    btn.textContent = dir.toUpperCase();
    btn.dataset.dir = dir; // for animation reference
    btn.onclick = () => go(targetScene);
    exitsBar.appendChild(btn);
  });
}

function renderInventory() {
  // Remove existing inventory item elements
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
      el.className = 'inv-item';
      if (state.selectedItem === itemId) el.classList.add('selected');
      el.textContent = item.name;
      el.onclick = () => selectItem(itemId);
      invBar.appendChild(el);
    });
  }
}

// ============================================================
// COMMAND HANDLING
// ============================================================
function setCommand(cmd) {
  state.activeCommand = cmd;
  cmdButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cmd === cmd);
  });

  if (cmd === 'look') {
    const scene = GAME_DATA.scenes.find(s => s.id === state.currentScene);
    if (scene && scene.lookDescriptions && Object.keys(scene.lookDescriptions).length > 0) {
      const targets = Object.keys(scene.lookDescriptions).map(k =>
        `<span class="look-target" data-look="${k}">${k}</span>`
      );
      addText('You can examine: ' + targets.join(', '), 'system');
    } else {
      addText('Look at what?', 'system');
    }
  } else if (cmd === 'take') {
    const scene = GAME_DATA.scenes.find(s => s.id === state.currentScene);
    const available = (scene.items || []).filter(id => !state.inventory.includes(id));
    if (available.length > 0) {
      available.forEach(id => takeItem(id));
    } else {
      addText('Nothing here to take.', 'system');
    }
  } else if (cmd === 'use') {
    if (state.inventory.length === 0) {
      addText('You have nothing to use.', 'system');
    } else if (!state.selectedItem) {
      addText('Select an item from your inventory first.', 'system');
    } else {
      const item = GAME_DATA.items.find(i => i.id === state.selectedItem);
      addText(`Using ${item.name} on what? Click an object in the scene.`, 'system');
    }
  } else if (cmd === 'examine') {
    // Alias for look
    setCommand('look');
  }
}

function selectItem(itemId) {
  state.selectedItem = state.selectedItem === itemId ? null : itemId;
  renderInventory();
  if (state.selectedItem && state.activeCommand === 'use') {
    const item = GAME_DATA.items.find(i => i.id === itemId);
    addText(`Selected: ${item.name}. Now click the target to use it on.`, 'system');
  }
}

function takeItem(itemId) {
  if (state.inventory.includes(itemId)) return;
  const item = GAME_DATA.items.find(i => i.id === itemId);
  const scene = GAME_DATA.scenes.find(s => s.id === state.currentScene);
  if (!scene || !(scene.items || []).includes(itemId)) return;

  state.inventory.push(itemId);
  addText(`You picked up: ${item.name} — ${item.description}`, 'success');

  // Highlight new inventory item
  requestAnimationFrame(() => {
    const lastInv = invBar.querySelector('.inv-item:last-child');
    if (lastInv) {
      lastInv.classList.add('item-new');
      setTimeout(() => lastInv.classList.remove('item-new'), 2000);
    }
  });

  renderInventory();
  saveState();
}

function lookAt(targetId) {
  const scene = GAME_DATA.scenes.find(s => s.id === state.currentScene);
  if (scene && scene.lookDescriptions && scene.lookDescriptions[targetId]) {
    addText(scene.lookDescriptions[targetId]);
    return;
  }
  const item = GAME_DATA.items.find(i => i.id === targetId);
  if (item) {
    addText(item.description);
    return;
  }
  addText('You see nothing special.', 'system');
}

function useItemOn(itemId, targetId) {
  const item = GAME_DATA.items.find(i => i.id === itemId);
  if (!item) return;
  const scene = GAME_DATA.scenes.find(s => s.id === state.currentScene);
  if (!scene) return;

  // Validate item usage location and target
  if (item.usedIn !== state.currentScene || item.usedOn !== targetId) {
    addText("That doesn't seem to work here.", 'system');
    return;
  }

  // Find applicable puzzle in this scene that requires this item and is unsolved
  const puzzle = GAME_DATA.puzzles.find(p =>
    p.scene === state.currentScene &&
    p.requires.includes(itemId) &&
    !state.solvedPuzzles.includes(p.id)
  );

  if (!puzzle) {
    addText("You've already used that here, or it's not needed anymore.", 'system');
    return;
  }

  // Check all required items are in inventory
  if (!puzzle.requires.every(req => state.inventory.includes(req))) {
    addText("You're missing something needed to complete this action.", 'system');
    return;
  }

  // Solve puzzle
  state.solvedPuzzles.push(puzzle.id);
  addText(puzzle.result, 'success');

  // Visual feedback: flash effect
  artDisplay.classList.add('puzzle-solved');
  setTimeout(() => artDisplay.classList.remove('puzzle-solved'), 600);

  // Handle reveals (items added directly to inventory)
  const newlyAdded = [];
  (puzzle.reveals || []).forEach(revId => {
    if (!state.inventory.includes(revId)) {
      state.inventory.push(revId);
      newlyAdded.push(revId);
      const revItem = GAME_DATA.items.find(i => i.id === revId);
      if (revItem) {
        addText(`You found: ${revItem.name}!`, 'success');
      }
    }
  });

  // Update UI
  renderInventory();
  // Highlight newly added items (if any)
  if (newlyAdded.length > 0) {
    requestAnimationFrame(() => {
      const allInv = invBar.querySelectorAll('.inv-item');
      const start = allInv.length - newlyAdded.length;
      for (let i = start; i < allInv.length; i++) {
        allInv[i].classList.add('item-new');
        setTimeout(() => allInv[i].classList.remove('item-new'), 2000);
      }
    });
  }
  renderExits(scene.exits || {});

  // Animate newly unlocked exit (if any)
  if (puzzle.blocksExit) {
    // Determine which direction is unblocked: check puzzle.blocksExit keys
    Object.keys(puzzle.blocksExit).forEach(dir => {
      const btn = exitsBar.querySelector(`button[data-dir="${dir}"]`);
      if (btn) {
        btn.classList.add('newly-unlocked');
        setTimeout(() => btn.classList.remove('newly-unlocked'), 3000);
      }
    });
  }

  checkWin();
  saveState();
}

function go(sceneId) {
  // Determine direction from current scene exits
  const current = GAME_DATA.scenes.find(s => s.id === state.currentScene);
  if (!current) return;
  let direction = null;
  for (const [dir, target] of Object.entries(current.exits || {})) {
    if (target === sceneId) {
      direction = dir;
      break;
    }
  }
  if (!direction) {
    addText("You can't go that way.", 'locked');
    return;
  }

  const check = canExit(state.currentScene, direction);
  if (!check.allowed) {
    addText(check.message || `The way ${direction} is blocked.`, 'locked');
    return;
  }

  renderScene(sceneId);
}

function checkWin() {
  if (state.won) return;
  const wc = GAME_DATA.winCondition;
  if (!wc) return;
  if (state.currentScene === wc.scene && wc.requires.every(req => state.solvedPuzzles.includes(req))) {
    state.won = true;
    addText('', '');
    addText('*** ' + wc.description + ' ***', 'success');
    addText('', '');
    addText('CONGRATULATIONS! YOU HAVE COMPLETED THE GAME!', 'success');
    addText('Type /restart to play again.', 'system');
  }
}

// ============================================================
// PERSISTENCE
// ============================================================
function saveState() {
  try {
    const toSave = {
      currentScene: state.currentScene,
      inventory: state.inventory,
      solvedPuzzles: state.solvedPuzzles,
      visitedScenes: state.visitedScenes,
      won: state.won
    };
    localStorage.setItem('game-state-' + GAME_DATA.slug, JSON.stringify(toSave));
  } catch (e) {}
}

function loadState() {
  try {
    const saved = localStorage.getItem('game-state-' + GAME_DATA.slug);
    if (saved) {
      const s = JSON.parse(saved);
      Object.assign(state, s);
      return true;
    }
  } catch (e) {}
  return false;
}

// ============================================================
// EVENT LISTENERS
// ============================================================
cmdButtons.forEach(btn => {
  btn.onclick = () => setCommand(btn.dataset.cmd);
});

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('look-target')) {
    const target = e.target.dataset.look;
    if (state.activeCommand === 'use' && state.selectedItem) {
      useItemOn(state.selectedItem, target);
    } else if (state.activeCommand === 'look' || !state.activeCommand) {
      lookAt(target);
    }
  }
});

// ============================================================
// INITIALIZATION
// ============================================================
function init() {
  if (!loadState()) {
    // Start at the first scene defined in GAME_DATA
    state.currentScene = GAME_DATA.scenes[0].id;
    state.visitedScenes = [GAME_DATA.scenes[0].id];
  }
  renderScene(state.currentScene);
}

// Start the engine
init();

// Expose state for debugging (optional)
window.gameState = state;
