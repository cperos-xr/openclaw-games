// game-logic.js — Reflections of the Lost
// Hex Corbin, Retro Game Logic Engine
// Vanilla JS, zero dependencies, single-file game state machine

// ─────────────────────────────────────────────────────────────────
// GAME DATA (from game-script.json)
// ─────────────────────────────────────────────────────────────────
window.GAME_DATA = {
  title: "Reflections of the Lost",
  slug: "reflections-of-the-lost",
  number: 20,
  layout: "standard",
  setting: "An abandoned Victorian asylum where the walls are lined with mirrors. The reflections trapped within hunger for the freedom of the living.",

  scenes: [
    {
      id: "entrance",
      name: "Asylum Entrance",
      prose: "The front doors groan shut behind you with the finality of a coffin lid. Dust motes swirl in the thin light filtering through boarded windows. To the north lies the main hallway.\n\nA reception desk sits crumbled against the wall. Something glints beneath the debris\u2014a sliver of glass catches the dying light. The air tastes of old antiseptic and forgotten breaths.",
      exits: { north: "hallway" },
      items: ["mirror-shard"],
      puzzles: [],
      lookDescriptions: {
        desk: "The reception desk collapsed long ago. Papers yellow with age spill across the floor like dead leaves.",
        debris: "Rubble from the crumbling plaster ceiling. Something sharp gleams from within.",
        windows: "Boarded up with dark wood. Not enough light gets through to read by."
      }
    },
    {
      id: "hallway",
      name: "Main Hallway",
      prose: "A long corridor lined with mirrors on both sides. Most are intact but clouded, as if the glass itself is sweating. Your reflection follows you down the hall, but sometimes it seems to lag a half-beat behind, turning its head when you are still.\n\nDoors lead east to the patient wards, west to the doctor's offices, and south toward what might have been the basement stairs. A sign above the southern archway reads: RESTRICTED\u2014AUTHORIZED PERSONNEL ONLY.",
      exits: { east: "ward-east", west: "ward-west", south: "doctors-office" },
      items: [],
      puzzles: [],
      lookDescriptions: {
        mirrors: "Tall mirrors in gilded frames. Your reflection stares back, but its eyes seem wider than yours. Its mouth moves as if whispering.",
        "east-doors": "Double doors leading to the east ward. Unlocked but the hinges are rusted stiff.",
        "west-doors": "Double doors to the west ward. These open easily, though they creak in protest.",
        "south-archway": "An arched passage leading to the doctor's office. The air beyond smells of chemicals and old paper.",
        sign: "The paint is chipped but legible: RESTRICTED. Someone crossed it out in red and wrote LET THEM OUT beneath."
      }
    },
    {
      id: "ward-east",
      name: "East Ward",
      prose: "Patient beds line the walls, their iron frames twisted like ribs picked clean. A large mirror dominates the far wall, its surface webbed with cracks but still reflecting. The glass is tarnished, darkened by age and something else\u2014a brown residue that might be dried blood or tea.\n\nTo your right, a smaller mirror rests against a bedside table. It is whole but clouded. The tarnish around its frame is thick enough to scrape away.",
      exits: { west: "hallway" },
      items: ["ward-key"],
      puzzles: ["puzzle-1", "puzzle-3"],
      lookDescriptions: {
        "large-mirror": "A tall mirror with ornate gilded frame. The glass is cracked and darkened. Something is written on the surface in reverse, visible only when you stand close.",
        "small-mirror": "A hand mirror resting on a table. The glass is whole but fogged with an oily film that resists wiping with bare fingers.",
        beds: "Iron-frame beds with rotted mattresses. The sheets are gray and brittle. One pillow has a stain the color of rust.",
        "bedside-table": "A wooden table with one drawer. It is stuck shut with age."
      }
    },
    {
      id: "ward-west",
      name: "West Ward",
      prose: "Unlike the east ward, the mirrors here are unbroken and eerily clear. They show the room as it once was\u2014clean sheets, fresh paint, a nurse's smile frozen in the glass. But the reflections are wrong. Furniture is rearranged. Shadows fall from no visible source.\n\nOn one bed, folded neatly, lies a silk handkerchief. It is the only clean thing in this place. The embroidery shows a name: Dr. V. Harrow.",
      exits: { east: "hallway" },
      items: ["silk-handkerchief"],
      puzzles: [],
      lookDescriptions: {
        mirrors: "Clear mirrors that reflect the ward as it once was. You see furniture that no longer exists. You see a figure standing behind you that isn't there when you turn around.",
        handkerchief: "A cream-colored silk handkerchief with blue embroidery. The name Dr. V. Harrow is stitched in careful script. It smells faintly of lavender, impossibly fresh."
      }
    },
    {
      id: "doctors-office",
      name: "Doctor's Office",
      prose: "The head physician's office is frozen in the middle of abandonment. A desk dominates the room, its drawers gaping open. Papers spill across the floor, each one a patient's face in careful handwriting.\n\nOn a shelf, a tin of silver polish sits beside a leather-bound ledger. The polish smells of ammonia and old money. The ledger's pages list names, dates, and mirror assignments\u2014as if each patient was given a specific mirror to look into, every night, for treatment.\n\nTo the south, a heavy iron door leads downward. A panel beside it has four circular indentations, waiting for symbols.",
      exits: { north: "hallway", south: "basement" },
      items: ["silver-polish", "patient-ledger"],
      puzzles: ["puzzle-2", "puzzle-4"],
      lookDescriptions: {
        desk: "A heavy mahogany desk. Most drawers are empty but one is locked with a brass keyhole.",
        papers: "Patient intake forms. Each describes a fear of mirrors, a compulsion to look, a belief that their reflection was watching them back. Every diagnosis: acute oneirophrenia. Untreatable.",
        shelf: "A bookshelf with medical textbooks on phobias and delusions. One book is titled The Mirror Cure by Dr. V. Harrow. Someone tore out the last ten pages.",
        ledger: "A leather-bound book listing 47 patients. Each entry notes a specific mirror and a nightly ritual. The last entry is dated the day the asylum closed. The name is crossed out but readable: you.",
        "iron-door": "A heavy iron door leading down to the basement. The handle is cold to the touch. A panel beside it has four circular indentations arranged in a square."
      }
    },
    {
      id: "basement",
      name: "The Basement",
      prose: "The air is colder here. Not the damp chill of earth but the sterile cold of a morgue. A circle is drawn on the floor in chalk, surrounded by seven mirrors placed at equal intervals. Each mirror faces inward, toward the center of the circle.\n\nIn the circle's center lies a depression in the concrete, shaped like a body. Two indentations sit at the edge of the circle\u2014one sized for a key, the other for a book.",
      exits: {},
      items: [],
      puzzles: ["puzzle-5"],
      lookDescriptions: {
        circle: "A chalk circle seven feet across. The chalk is fresh, still white against the stained concrete. Seven mirrors surround it like sentinels.",
        mirrors: "Seven identical mirrors arranged in a circle. Each reflects the others infinitely\u2014a tunnel of glass and shadow. Your reflection multiplies into a crowd.",
        depression: "A body-shaped hollow in the center of the circle. The concrete is smooth, as if something lay there long enough to wear the floor away.",
        "key-slot": "A brass indentation at the circle's edge, shaped for a heavy key with the asylum's crest.",
        "book-slot": "A rectangular depression sized for a ledger. The edges are worn smooth from repeated placement."
      }
    },
    {
      id: "mirror-realm",
      name: "The Mirror Realm",
      prose: "The mirrors shatter inward, not outward. The world flips and you are falling through glass.\n\nYou stand in an infinite gallery of reflections. Every mirror you broke, every person trapped in these walls, stands before you now. They are not angry. They are waiting.\n\nDr. Harrow steps forward, her silk handkerchief clean in her hand. Behind her, forty-six faces you have never seen but somehow know. The forty-seventh face is yours.\n\nThere is a door in the distance, visible through every mirror at once. It opens when you stop looking at it. This is the asylum now. You are the new doctor. They have been waiting for you.",
      exits: {},
      items: [],
      puzzles: [],
      lookDescriptions: {
        door: "A door visible in every mirror, nowhere in the room. It opens when you look away. Through it you see sunlight, the parking lot, your car. Freedom is one reflection away.",
        reflections: "Forty-seven figures stand in infinite mirrors. Forty-six you do not know. One is you. None of them blink when you do."
      }
    }
  ],

  items: [
    {
      id: "mirror-shard",
      name: "Mirror Shard",
      description: "A jagged fragment of broken glass, sharp as a guillotine blade.",
      foundIn: "entrance",
      usedIn: "ward-east",
      usedOn: "puzzle-1"
    },
    {
      id: "silk-handkerchief",
      name: "Silk Handkerchief",
      description: "An embroidered cloth, once fine. Now stained with something that looks like rust.",
      foundIn: "ward-west",
      usedIn: "doctors-office",
      usedOn: "puzzle-2"
    },
    {
      id: "silver-polish",
      name: "Silver Polish",
      description: "A tin of cleaning paste. The label is faded but the smell remains chemically sharp.",
      foundIn: "doctors-office",
      usedIn: "doctors-office",
      usedOn: "puzzle-2"
    },
    {
      id: "polished-rag",
      name: "Polished Rag",
      description: "Silk soaked in silver polish. It gleams with unnatural cleanliness.",
      foundIn: "doctors-office",
      usedIn: "ward-east",
      usedOn: "puzzle-3"
    },
    {
      id: "ward-key",
      name: "Ward Key",
      description: "A heavy brass key stamped with the asylum's crest\u2014a mirror cracked in half.",
      foundIn: "ward-east",
      usedIn: "basement",
      usedOn: "puzzle-5"
    },
    {
      id: "patient-ledger",
      name: "Patient Ledger",
      description: "A leather-bound book listing names, diagnoses, and mirror-room assignments.",
      foundIn: "doctors-office",
      usedIn: "basement",
      usedOn: "puzzle-5"
    },
    {
      id: "code-tablet",
      name: "Code Tablet",
      description: "A small slate etched with four symbols: spiral, eye, mouth, hand.",
      foundIn: "ward-east",
      usedIn: "doctors-office",
      usedOn: "puzzle-4"
    }
  ],

  puzzles: [
    {
      id: "puzzle-1",
      scene: "ward-east",
      requires: ["mirror-shard"],
      action: "use mirror-shard on large-mirror",
      result: "You scrape the tarnish from the mirror's surface with the shard. Beneath the grime, the glass clears. Your reflection smiles\u2014wider than you do. The mirror vibrates and a brass key slides from behind the frame, clattering to the floor.",
      reveals: ["ward-key"],
      blocksExit: {},
      blockedMessage: ""
    },
    {
      id: "puzzle-2",
      scene: "doctors-office",
      requires: ["silk-handkerchief", "silver-polish"],
      action: "use silk-handkerchief on silver-polish",
      result: "You dab the silk handkerchief into the silver polish. The cloth absorbs the paste, becoming a gleaming rag. The silk seems to drink the polish eagerly, hungry for purpose.",
      reveals: ["polished-rag"],
      blocksExit: {},
      blockedMessage: ""
    },
    {
      id: "puzzle-3",
      scene: "ward-east",
      requires: ["polished-rag"],
      action: "use polished-rag on small-mirror",
      result: "You wipe the small mirror with the silver-soaked silk. The tarnish dissolves instantly. The glass clears to show not your reflection but a small slate tablet hidden behind the mirror. It slides into your hand: four symbols in a row.",
      reveals: ["code-tablet"],
      blocksExit: {},
      blockedMessage: ""
    },
    {
      id: "puzzle-4",
      scene: "doctors-office",
      requires: ["code-tablet"],
      action: "use code-tablet on iron-door",
      result: "You press the four symbols into the door panel in the order shown on the tablet: spiral, eye, mouth, hand. The iron door groans open with the sound of grinding teeth. Cold air rushes up from the stairs. Something in the darkness below stirs.",
      reveals: [],
      blocksExit: {
        scene: "doctors-office",
        direction: "south"
      },
      blockedMessage: "The iron door is locked. A four-symbol combination lock blocks the way down."
    },
    {
      id: "puzzle-5",
      scene: "basement",
      requires: ["ward-key", "patient-ledger"],
      action: "use ward-key on key-slot and use patient-ledger on book-slot",
      result: "You place the brass key in its slot and the ledger in its depression. The mirrors flare with blinding light. The chalk circle ignites in white fire. The floor drops away and you are falling through glass, through reflections, into the place behind the mirrors where the lost have been waiting.",
      reveals: ["mirror-realm"],
      blocksExit: {},
      blockedMessage: ""
    }
  ],

  winCondition: {
    scene: "mirror-realm",
    requires: ["ward-key", "patient-ledger"],
    description: "You have freed\u2014or joined\u2014the reflections. The asylum has a new doctor. The mirrors remember your name."
  }
};

// ─────────────────────────────────────────────────────────────────
// ART PATH MAPPING (SVG files)
// ─────────────────────────────────────────────────────────────────
window.GAME_ART = {
  "entrance": "art/scene-entrance.svg",
  "hallway": "art/scene-hallway.svg",
  "ward-east": "art/scene-ward-east.svg",
  "ward-west": "art/scene-ward-west.svg",
  "doctors-office": "art/scene-doctors-office.svg",
  "basement": "art/scene-basement.svg",
  "mirror-realm": "art/scene-mirror-realm.svg",
  "mirror-shard": "art/item-mirror-shard.svg",
  "silk-handkerchief": "art/item-silk-handkerchief.svg",
  "silver-polish": "art/item-silver-polish.svg",
  "polished-rag": "art/item-polished-rag.svg",
  "ward-key": "art/item-ward-key.svg",
  "patient-ledger": "art/item-patient-ledger.svg",
  "code-tablet": "art/item-code-tablet.svg"
};

// ─────────────────────────────────────────────────────────────────
// GAME STATE (mutable runtime state)
// ─────────────────────────────────────────────────────────────────
var state = {
  currentScene: "entrance",
  inventory: [],
  solvedPuzzles: [],
  revealedItems: [],
  visitedScenes: [],
  gameOver: false,
  newlyUnlockedExits: []
};

// ─────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────

function getScene(id) {
  return GAME_DATA.scenes.find(function(s) { return s.id === id; });
}

function getItem(id) {
  return GAME_DATA.items.find(function(it) { return it.id === id; });
}

function getPuzzle(id) {
  return GAME_DATA.puzzles.find(function(p) { return p.id === id; });
}

function hasItem(itemId) {
  return state.inventory.indexOf(itemId) !== -1;
}

function isSolved(puzzleId) {
  return state.solvedPuzzles.indexOf(puzzleId) !== -1;
}

function isRevealed(itemId) {
  return state.revealedItems.indexOf(itemId) !== -1;
}

function isVisited(sceneId) {
  return state.visitedScenes.indexOf(sceneId) !== -1;
}

// ─────────────────────────────────────────────────────────────────
// DOM REFERENCES (set up after DOM ready)
// ─────────────────────────────────────────────────────────────────
var artDisplay, textDisplay, commandBar, exitsBar, inventoryDisplay;

function cacheDom() {
  artDisplay = document.getElementById("art-display");
  textDisplay = document.getElementById("text-display");
  commandBar = document.getElementById("command-bar");
  exitsBar = document.getElementById("exits-bar");
  inventoryDisplay = document.getElementById("inventory-display");
}

// ─────────────────────────────────────────────────────────────────
// TEXT OUTPUT
// ─────────────────────────────────────────────────────────────────
function addText(msg, cls) {
  var p = document.createElement("p");
  p.textContent = msg;
  if (cls) p.className = cls;
  textDisplay.appendChild(p);
  textDisplay.scrollTop = textDisplay.scrollHeight;
}

function clearText() {
  textDisplay.innerHTML = "";
}

// ─────────────────────────────────────────────────────────────────
// ART DISPLAY
// ─────────────────────────────────────────────────────────────────
function showArt(sceneId) {
  var artPath = GAME_ART[sceneId];
  if (artDisplay && artPath) {
    artDisplay.innerHTML = "";
    var img = document.createElement("img");
    img.src = artPath;
    img.alt = getScene(sceneId) ? getScene(sceneId).name : sceneId;
    img.onerror = function() {
      img.style.display = "none";
      var placeholder = document.createElement("div");
      placeholder.className = "art-placeholder";
      placeholder.textContent = "[ " + img.alt + " ]";
      artDisplay.appendChild(placeholder);
    };
    artDisplay.appendChild(img);
  }
}

function triggerPuzzleFlash() {
  if (artDisplay) {
    artDisplay.classList.add("puzzle-solved");
    setTimeout(function() {
      artDisplay.classList.remove("puzzle-solved");
    }, 600);
  }
}

// ─────────────────────────────────────────────────────────────────
// SCENE RENDERING
// ─────────────────────────────────────────────────────────────────
function renderScene(sceneId) {
  var scene = getScene(sceneId);
  if (!scene) return;

  state.currentScene = sceneId;
  if (!isVisited(sceneId)) {
    state.visitedScenes.push(sceneId);
  }

  clearText();
  showArt(sceneId);

  // Scene title
  addText(scene.name, "scene-title");
  addText("", "");
  // Scene prose
  addText(scene.prose, "scene-prose");

  // Items available in scene (not yet picked up)
  var availableItems = scene.items.filter(function(itemId) {
    return !hasItem(itemId) && !isRevealed(itemId);
  });
  if (availableItems.length > 0) {
    addText("", "");
    availableItems.forEach(function(itemId) {
      var it = getItem(itemId);
      if (it) {
        addText("You see: " + it.name, "item-notice");
      }
    });
  }

  renderExits(sceneId);
  renderInventory();
  renderCommands(sceneId);
}

// ─────────────────────────────────────────────────────────────────
// EXIT RENDERING (with locked exit check)
// ─────────────────────────────────────────────────────────────────
function renderExits(sceneId) {
  var scene = getScene(sceneId);
  exitsBar.innerHTML = "";

  if (!scene) return;

  var directions = ["north", "south", "east", "west"];
  directions.forEach(function(dir) {
    if (scene.exits[dir]) {
      // Check if this exit is blocked by an unsolved puzzle
      var isLocked = false;
      var blockMsg = "";
      GAME_DATA.puzzles.forEach(function(p) {
        if (p.blocksExit && p.blocksExit.scene === sceneId && p.blocksExit.direction === dir && !isSolved(p.id)) {
          isLocked = true;
          blockMsg = p.blockedMessage || "Something prevents you from going that way.";
        }
      });

      var btn = document.createElement("button");
      btn.className = "exit-btn";
      btn.dataset.direction = dir;
      btn.dataset.target = scene.exits[dir];

      if (isLocked) {
        btn.textContent = dir.charAt(0).toUpperCase() + dir.slice(1) + " [LOCKED]";
        btn.classList.add("locked");
        btn.dataset.lockedMessage = blockMsg;
      } else {
        btn.textContent = dir.charAt(0).toUpperCase() + dir.slice(1);
        // Check if this exit was newly unlocked
        if (state.newlyUnlockedExits.indexOf(sceneId + ":" + dir) !== -1) {
          btn.classList.add("newly-unlocked");
          // Remove from newlyUnlocked after showing animation a few times
          setTimeout(function() {
            btn.classList.remove("newly-unlocked");
          }, 3000);
        }
      }

      btn.addEventListener("click", function() {
        if (this.classList.contains("locked")) {
          addText("[" + this.dataset.lockedMessage + "]", "locked");
        } else {
          goDirection(this.dataset.direction);
        }
      });

      exitsBar.appendChild(btn);
    }
  });
}

// ─────────────────────────────────────────────────────────────────
// INVENTORY DISPLAY
// ─────────────────────────────────────────────────────────────────
function renderInventory() {
  inventoryDisplay.innerHTML = "";
  if (state.inventory.length === 0) {
    var empty = document.createElement("div");
    empty.className = "inv-empty";
    empty.textContent = "(empty)";
    inventoryDisplay.appendChild(empty);
    return;
  }
  state.inventory.forEach(function(itemId) {
    var it = getItem(itemId);
    if (!it) return;
    var btn = document.createElement("button");
    btn.className = "inv-item";
    btn.textContent = it.name;
    btn.dataset.itemId = itemId;
    btn.addEventListener("click", function() {
      examineItem(this.dataset.itemId);
    });
    inventoryDisplay.appendChild(btn);
  });
}

// ─────────────────────────────────────────────────────────────────
// COMMAND BUTTONS
// ─────────────────────────────────────────────────────────────────
function renderCommands(sceneId) {
  commandBar.innerHTML = "";
  var scene = getScene(sceneId);
  if (!scene) return;

  // LOOK at scene features
  var lookBtn = document.createElement("button");
  lookBtn.className = "cmd-btn";
  lookBtn.textContent = "LOOK";
  lookBtn.addEventListener("click", function() { handleLook(sceneId); });
  commandBar.appendChild(lookBtn);

  // TAKE items in scene
  var takeBtn = document.createElement("button");
  takeBtn.className = "cmd-btn";
  takeBtn.textContent = "TAKE";
  takeBtn.addEventListener("click", function() { handleTake(sceneId); });
  commandBar.appendChild(takeBtn);

  // USE items in scene
  var useBtn = document.createElement("button");
  useBtn.className = "cmd-btn";
  useBtn.textContent = "USE";
  useBtn.addEventListener("click", function() { handleUse(sceneId); });
  commandBar.appendChild(useBtn);

  // EXAMINE (alias for look)
  var exBtn = document.createElement("button");
  exBtn.className = "cmd-btn";
  exBtn.textContent = "EXAMINE";
  exBtn.addEventListener("click", function() { handleLook(sceneId); });
  commandBar.appendChild(exBtn);
}

// ─────────────────────────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────────────────────────
function goDirection(direction) {
  var scene = getScene(state.currentScene);
  if (!scene || !scene.exits[direction]) return;

  var targetId = scene.exits[direction];
  renderScene(targetId);

  // Check win condition after scene change
  checkWinCondition();
}

// ─────────────────────────────────────────────────────────────────
// LOCKED EXIT CHECK (canExit pattern)
// ─────────────────────────────────────────────────────────────────
function canExit(sceneId, direction) {
  var scene = getScene(sceneId);
  if (!scene || !scene.exits[direction]) return false;

  var blocker = GAME_DATA.puzzles.find(function(p) {
    return p.blocksExit &&
      p.blocksExit.scene === sceneId &&
      p.blocksExit.direction === direction &&
      !isSolved(p.id);
  });

  if (blocker) {
    addText("[" + (blocker.blockedMessage || "The way " + direction + " is blocked. Something prevents you from going that way.") + "]", "locked");
    return false;
  }
  return true;
}

// ─────────────────────────────────────────────────────────────────
// LOOK handler
// ─────────────────────────────────────────────────────────────────
function handleLook(sceneId) {
  var scene = getScene(sceneId);
  if (!scene) return;
  var keys = Object.keys(scene.lookDescriptions || {});
  if (keys.length === 0) {
    addText("You look around carefully, but see nothing more of note.", "look");
    return;
  }

  // Show look targets as clickable choices
  clearText();
  addText("What do you want to examine?", "prompt");
  keys.forEach(function(target) {
    var btn = document.createElement("button");
    btn.className = "exit-btn look-target";
    btn.textContent = target.replace(/-/g, " ");
    btn.dataset.target = target;
    btn.addEventListener("click", function() {
      clearText();
      addText(scene.lookDescriptions[this.dataset.target], "look");
      // Restore commands after looking
      renderCommands(sceneId);
    });
    exitsBar.innerHTML = "";
    exitsBar.appendChild(btn);
  });
  renderCommands(sceneId);
}

// ─────────────────────────────────────────────────────────────────
// TAKE handler
// ─────────────────────────────────────────────────────────────────
function handleTake(sceneId) {
  var scene = getScene(sceneId);
  if (!scene) return;

  var available = scene.items.filter(function(itemId) {
    return !hasItem(itemId) && !isRevealed(itemId);
  });

  if (available.length === 0) {
    addText("There's nothing here to take.", "action");
    return;
  }

  if (available.length === 1) {
    pickUpItem(available[0]);
    return;
  }

  // Multiple items — show choices
  clearText();
  addText("What do you want to pick up?", "prompt");
  exitsBar.innerHTML = "";
  available.forEach(function(itemId) {
    var it = getItem(itemId);
    if (!it) return;
    var btn = document.createElement("button");
    btn.className = "exit-btn";
    btn.textContent = it.name;
    btn.dataset.itemId = itemId;
    btn.addEventListener("click", function() {
      pickUpItem(this.dataset.itemId);
    });
    exitsBar.appendChild(btn);
  });
}

function pickUpItem(itemId) {
  if (hasItem(itemId)) {
    addText("You already have that.", "action");
    return;
  }
  var it = getItem(itemId);
  if (!it) return;

  state.inventory.push(itemId);
  addText("You pick up the " + it.name + ". " + it.description, "action");
  renderInventory();
}

// ─────────────────────────────────────────────────────────────────
// USE handler
// ─────────────────────────────────────────────────────────────────
function handleUse(sceneId) {
  if (state.inventory.length === 0) {
    addText("You have nothing to use.", "action");
    return;
  }

  clearText();
  addText("Select an item to use:", "prompt");
  exitsBar.innerHTML = "";
  state.inventory.forEach(function(itemId) {
    var it = getItem(itemId);
    if (!it) return;
    var btn = document.createElement("button");
    btn.className = "exit-btn";
    btn.textContent = it.name;
    btn.dataset.itemId = itemId;
    btn.addEventListener("click", function() {
      tryUseItem(this.dataset.itemId, sceneId);
    });
    exitsBar.appendChild(btn);
  });

  // Add cancel button
  var cancelBtn = document.createElement("button");
  cancelBtn.className = "exit-btn cancel-btn";
  cancelBtn.textContent = "Cancel";
  cancelBtn.addEventListener("click", function() {
    renderScene(sceneId);
  });
  exitsBar.appendChild(cancelBtn);
}

function tryUseItem(itemId, sceneId) {
  // Find all puzzles that could be solved with this item in this scene
  var matchingPuzzles = GAME_DATA.puzzles.filter(function(p) {
    if (p.scene !== sceneId) return false;
    if (isSolved(p.id)) return false;
    return p.requires.indexOf(itemId) !== -1;
  });

  if (matchingPuzzles.length === 0) {
    addText("You can't use the " + getItem(itemId).name + " here.", "action");
    renderCommands(sceneId);
    return;
  }

  // Check each matching puzzle — do we have ALL required items?
  var solvablePuzzle = null;
  matchingPuzzles.forEach(function(p) {
    var hasAll = p.requires.every(function(reqId) {
      return hasItem(reqId);
    });
    if (hasAll) {
      solvablePuzzle = p;
    }
  });

  if (!solvablePuzzle) {
    // We have one of the items but not all required
    var missingItems = [];
    matchingPuzzles.forEach(function(p) {
      p.requires.forEach(function(reqId) {
        if (!hasItem(reqId) && missingItems.indexOf(reqId) === -1) {
          missingItems.push(reqId);
        }
      });
    });
    if (missingItems.length > 0) {
      var missingNames = missingItems.map(function(id) {
        var it = getItem(id);
        return it ? it.name : id;
      });
      addText("You need something else as well: " + missingNames.join(", "), "action");
    }
    renderCommands(sceneId);
    return;
  }

  // SOLVE THE PUZZLE
  solvePuzzle(solvablePuzzle, itemId, sceneId);
}

function solvePuzzle(puzzle, usedItemId, sceneId) {
  if (isSolved(puzzle.id)) {
    addText("You've already done that.", "action");
    return;
  }

  state.solvedPuzzles.push(puzzle.id);

  // Flash effect
  triggerPuzzleFlash();

  // Show result text
  addText(puzzle.result, "puzzle-solved");

  // Reveal new items
  if (puzzle.reveals && puzzle.reveals.length > 0) {
    puzzle.reveals.forEach(function(revealId) {
      // Check if this is a scene transition (like mirror-realm) or an item
      var scene = getScene(revealId);
      var item = getItem(revealId);
      if (scene) {
        // It's a scene — this might be a win-triggering scene
        // Mark it as accessible (no special action needed, exits will update)
        addText("You can now reach: " + scene.name, "action");
      }
      if (item) {
        state.revealedItems.push(revealId);
        // Add item to current scene so it can be picked up
        var currentScene = getScene(state.currentScene);
        if (currentScene && currentScene.items.indexOf(revealId) === -1) {
          currentScene.items.push(revealId);
        }
        addText("A new item has appeared: " + item.name, "item-new");
      }
    });
  }

  // Check for newly unlocked exits
  if (puzzle.blocksExit && puzzle.blocksExit.scene && puzzle.blocksExit.direction) {
    var exitKey = puzzle.blocksExit.scene + ":" + puzzle.blocksExit.direction;
    if (state.newlyUnlockedExits.indexOf(exitKey) === -1) {
      state.newlyUnlockedExits.push(exitKey);
    }
    addText("The way " + puzzle.blocksExit.direction + " is now open!", "action");
  }

  // If puzzle reveals a scene that is the win condition scene, auto-transition
  if (puzzle.reveals && puzzle.reveals.length > 0) {
    puzzle.reveals.forEach(function(revealId) {
      if (getScene(revealId)) {
        // Special case: mirror-realm is a win-triggering scene transition
        setTimeout(function() {
          renderScene(revealId);
          checkWinCondition();
        }, 1500);
      }
    });
  }

  // Refresh display
  renderExits(sceneId);
  renderInventory();
  renderCommands(sceneId);
}

// ─────────────────────────────────────────────────────────────────
// EXAMINE ITEM (from inventory)
// ─────────────────────────────────────────────────────────────────
function examineItem(itemId) {
  var it = getItem(itemId);
  if (!it) return;
  clearText();
  addText(it.name, "scene-title");
  addText("", "");
  addText(it.description, "scene-prose");
  renderCommands(state.currentScene);
}

// ─────────────────────────────────────────────────────────────────
// WIN CONDITION CHECK
// ─────────────────────────────────────────────────────────────────
function checkWinCondition() {
  if (state.gameOver) return;
  var win = GAME_DATA.winCondition;
  if (!win) return;

  // Check if we're in the win scene
  if (state.currentScene === win.scene) {
    state.gameOver = true;
    // Show win text
    setTimeout(function() {
      addText("", "");
      addText("=== " + GAME_DATA.title + " ===", "win-title");
      addText(win.description, "win-text");
      addText("Congratulations! You have completed the game.", "win-text");
      // Hide command bar — game is over
      commandBar.innerHTML = "";
      exitsBar.innerHTML = "";
    }, 500);
  }
}

// ─────────────────────────────────────────────────────────────────
// INITIALIZATION
// ─────────────────────────────────────────────────────────────────
function initGame() {
  cacheDom();
  renderScene("entrance");
}

// Boot on DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGame);
} else {
  initGame();
}
