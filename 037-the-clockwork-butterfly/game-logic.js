// game-logic.js for The Clockwork Butterfly
// (c) OpenClaw Studio

(function() {
  // Ensure GAME_DATA is available
  if (typeof GAME_DATA === 'undefined') {
    console.error('GAME_DATA not defined');
    return;
  }

  // State object
  const state = {
    currentScene: null,
    inventory: [],
    solvedPuzzles: [],
    revealedScenes: [], // scenes that have been unlocked or visited
    visitedScenes: [],
    activeCommand: null,
    selectedItem: null,
    won: false,
    // Transient (not saved):
    exitAvailability: {},
    newlyAddedItemIds: []
  };

  // DOM references
  const artDisplay = document.getElementById('art-display');
  const sceneName = document.getElementById('scene-name');
  const textDisplay = document.getElementById('text-display');
  const invBar = document.getElementById('inventory-bar');
  const exitsBar = document.getElementById('exits-bar');

  // ----- Helper Functions -----

  function addText(text, cls = '') {
    const p = document.createElement('p');
    p.className = cls;
    p.innerHTML = text;
    textDisplay.appendChild(p);
    textDisplay.scrollTop = textDisplay.scrollHeight;
  }

  function clearText() {
    textDisplay.innerHTML = '';
  }

  function saveState() {
    try {
      const persistent = {
        currentScene: state.currentScene,
        inventory: state.inventory,
        solvedPuzzles: state.solvedPuzzles,
        revealedScenes: state.revealedScenes,
        visitedScenes: state.visitedScenes,
        won: state.won
      };
      localStorage.setItem('game-' + GAME_DATA.slug, JSON.stringify(persistent));
    } catch (e) {}
  }

  function loadState() {
    try {
      const saved = localStorage.getItem('game-' + GAME_DATA.slug);
      if (saved) {
        const s = JSON.parse(saved);
        Object.assign(state, s);
        // Reset transient fields
        state.activeCommand = null;
        state.selectedItem = null;
        state.exitAvailability = {};
        state.newlyAddedItemIds = [];
        return true;
      }
    } catch (e) {}
    return false;
  }

  // ----- Game Logic -----

  function isItemVisible(itemId, scene) {
    if (state.inventory.includes(itemId)) return false;
    if (!scene.items || !scene.items.includes(itemId)) return false;
    // Find puzzles in this scene that reveal this item and are not yet solved
    const relevantPuzzles = GAME_DATA.puzzles.filter(p =>
      p.scene === scene.id &&
      p.reveals && p.reveals.includes(itemId)
    );
    if (relevantPuzzles.length === 0) return true;
    // Visible only if all such puzzles are solved
    return relevantPuzzles.every(p => state.solvedPuzzles.includes(p.id));
  }

  function isExitBlocked(sceneId, dir) {
    return GAME_DATA.puzzles.some(p => {
      if (state.solvedPuzzles.includes(p.id)) return false;
      const be = p.blocksExit;
      if (!be) return false;
      if (typeof be === 'string') {
        return be === dir && p.scene === sceneId;
      } else if (typeof be === 'object') {
        return be.direction === dir && be.scene === sceneId;
      }
      return false;
    });
  }

  function isTargetSceneRevealed(targetSceneId) {
    if (state.revealedScenes.includes(targetSceneId)) return true;
    // If any unsolved puzzle reveals this scene, it's locked
    const blocker = GAME_DATA.puzzles.find(p =>
      p.reveals && p.reveals.includes(targetSceneId) && !state.solvedPuzzles.includes(p.id)
    );
    if (blocker) return false;
    // No puzzle locks it, so it's freely accessible
    return true;
  }

  function renderScene(sceneId) {
    const scene = GAME_DATA.scenes.find(s => s.id === sceneId);
    if (!scene) {
      addText('ERROR: Scene not found!', 'error');
      return;
    }

    state.currentScene = sceneId;
    if (!state.visitedScenes.includes(sceneId)) state.visitedScenes.push(sceneId);
    if (!state.revealedScenes.includes(sceneId)) state.revealedScenes.push(sceneId);

    // Update scene name
    sceneName.textContent = scene.name.toUpperCase();

    // Update art display
    let artHtml = null;
    if (typeof GAME_ART !== 'undefined' && GAME_ART[sceneId]) {
      artHtml = GAME_ART[sceneId];
    } else if (window.GAME_ART && window.GAME_ART[sceneId]) {
      artHtml = window.GAME_ART[sceneId];
    } else {
      // Fallback: maybe map by scene name? Just show name.
      artHtml = `<span class="no-art">[ ${scene.name.toUpperCase()} ]</span>`;
    }
    artDisplay.innerHTML = artHtml;

    // Clear text and show room description
    clearText();
    addText(scene.prose);

    // Visible items (not taken, not locked)
    const visibleItems = scene.items.filter(itemId => isItemVisible(itemId, scene));
    if (visibleItems.length > 0) {
      const itemSpans = visibleItems.map(itemId => {
        const item = GAME_DATA.items.find(i => i.id === itemId);
        const name = item ? item.name : itemId;
        return `<span class="look-target" data-look="${itemId}">${name}</span>`;
      });
      addText('You notice: ' + itemSpans.join(', '), 'system');
    }

    // Unsolved puzzles as interactive hotspots
    const unsolvedPuzzles = scene.puzzles.filter(pid => !state.solvedPuzzles.includes(pid));
    if (unsolvedPuzzles.length > 0) {
      const hotspots = unsolvedPuzzles.map(p => {
        // Extract target name from action: "use X on Y" -> Y
        let targetName = p.id;
        const m = p.action.match(/use\s+\S+\s+on\s+(.+)/);
        if (m) targetName = m[1];
        return `<span class="puzzle-hotspot" data-puzzle-id="${p.id}">${targetName}</span>`;
      });
      addText('You see something interesting: ' + hotspots.join(', '), 'system');
    }

    // Look descriptions
    if (scene.lookDescriptions && Object.keys(scene.lookDescriptions).length > 0) {
      const lookSpans = Object.keys(scene.lookDescriptions).map(key =>
        `<span class="look-target" data-look="${key}">${key}</span>`
      );
      addText('You can examine: ' + lookSpans.join(', '), 'system');
    }

    // Render exits
    renderExits(scene.exits || {});

    // Render inventory
    renderInventory();

    // Check win condition
    checkWin();

    // Save state (persistent)
    saveState();
  }

  function renderExits(exits) {
    const dirs = ['north', 'south', 'east', 'west'];
    // Track which exits are currently available for animation
    const prevSet = state.exitAvailability[state.currentScene] || new Set();
    const newAvail = new Set();

    exitsBar.innerHTML = '';
    dirs.forEach(dir => {
      const targetSceneId = exits[dir];
      let available = false;
      if (targetSceneId) {
        // Check if target is accessible and exit not blocked
        if (isTargetSceneRevealed(targetSceneId) && !isExitBlocked(state.currentScene, dir)) {
          available = true;
        }
      }

      const btn = document.createElement('button');
      btn.className = 'exit-btn' + (available ? ' available' : '');
      btn.textContent = dir.toUpperCase();
      btn.disabled = !available;
      if (available) {
        btn.onclick = () => go(targetSceneId);
        newAvail.add(dir);
      }
      exitsBar.appendChild(btn);
    });

    // Add animation to newly available exits
    newAvail.forEach(dir => {
      if (!prevSet.has(dir)) {
        const index = dirs.indexOf(dir);
        if (index !== -1 && exitsBar.children[index]) {
          exitsBar.children[index].classList.add('newly-unlocked');
        }
      }
    });

    // Update state tracking
    state.exitAvailability[state.currentScene] = newAvail;
  }

  function renderInventory() {
    // Remove all inv-item elements (keep label and empty)
    const existing = invBar.querySelectorAll('.inv-item');
    existing.forEach(el => el.remove());
    const emptySpan = document.getElementById('inv-empty');
    if (!emptySpan) return; // safety

    if (state.inventory.length === 0) {
      emptySpan.style.display = '';
      invBar.appendChild(emptySpan);
      return;
    }

    emptySpan.style.display = 'none';
    state.inventory.forEach(itemId => {
      const item = GAME_DATA.items.find(i => i.id === itemId);
      if (!item) return;
      const el = document.createElement('span');
      el.className = 'inv-item';
      if (state.newlyAddedItemIds && state.newlyAddedItemIds.includes(itemId)) {
        el.classList.add('item-new');
      }
      if (state.selectedItem === itemId) {
        el.classList.add('selected');
      }
      el.textContent = item.name;
      el.onclick = () => selectItem(itemId);
      invBar.appendChild(el);
    });

    // Clear newly added flags after render
    state.newlyAddedItemIds = [];
  }

  function setCommand(cmd) {
    state.activeCommand = cmd;
    document.querySelectorAll('.cmd-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.cmd === cmd);
    });
    if (cmd === 'look' || cmd === 'examine') {
      const scene = GAME_DATA.scenes.find(s => s.id === state.currentScene);
      if (scene && scene.lookDescriptions) {
        const keys = Object.keys(scene.lookDescriptions);
        if (keys.length > 0) {
          const spans = keys.map(k =>
            `<span class="look-target" data-look="${k}">${k}</span>`
          );
          addText('You can examine: ' + spans.join(', '), 'system');
        }
      }
    } else if (cmd === 'take') {
      const scene = GAME_DATA.scenes.find(s => s.id === state.currentScene);
      const available = (scene.items || []).filter(id => isItemVisible(id, scene));
      if (available.length > 0) {
        available.forEach(id => takeItem(id));
      } else {
        addText('Nothing here to take.', 'system');
      }
    } else if (cmd === 'use') {
      if (state.inventory.length > 0) {
        addText('Select an item from your inventory, then click a target to use it on.', 'system');
      } else {
        addText('You have nothing to use.', 'system');
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
    if (!scene || !isItemVisible(itemId, scene)) return;

    state.inventory.push(itemId);
    addText(`You picked up: ${item.name} — ${item.description}`, 'success');
    // Mark for glow animation
    state.newlyAddedItemIds = state.newlyAddedItemIds || [];
    state.newlyAddedItemIds.push(itemId);
    renderInventory();
    saveState();
  }

  function lookAt(target) {
    const scene = GAME_DATA.scenes.find(s => s.id === state.currentScene);
    if (scene && scene.lookDescriptions && scene.lookDescriptions[target]) {
      addText(scene.lookDescriptions[target]);
    } else {
      const item = GAME_DATA.items.find(i => i.id === target);
      if (item) {
        addText(item.description);
      } else {
        addText('Nothing interesting about that.', 'system');
      }
    }
  }

  function useItemOn(itemId, puzzleId) {
    const puzzle = GAME_DATA.puzzles.find(p => p.id === puzzleId);
    if (!puzzle) {
      addText("That doesn't seem to work.", 'system');
      return;
    }
    if (puzzle.scene !== state.currentScene) {
      addText("That's not relevant here.", 'system');
      return;
    }
    if (state.solvedPuzzles.includes(puzzle.id)) {
      addText("It's already been used.", 'system');
      return;
    }
    if (!puzzle.requires || !puzzle.requires.includes(itemId)) {
      addText("That doesn't seem to work.", 'system');
      return;
    }
    // Ensure all required items are in inventory
    const hasAll = puzzle.requires.every(req => state.inventory.includes(req));
    if (!hasAll) {
      addText("You're missing something needed.", 'system');
      return;
    }

    // Solve puzzle
    state.solvedPuzzles.push(puzzle.id);
    addText(puzzle.result, 'success');
    // Flash effect on art
    artDisplay.classList.add('puzzle-solved');
    setTimeout(() => artDisplay.classList.remove('puzzle-solved'), 600);

    // Process reveals
    if (puzzle.reveals) {
      puzzle.reveals.forEach(revealId => {
        const item = GAME_DATA.items.find(i => i.id === revealId);
        if (item) {
          if (!state.inventory.includes(revealId)) {
            state.inventory.push(revealId);
            addText(`You found: ${item.name}!`, 'success');
            state.newlyAddedItemIds = state.newlyAddedItemIds || [];
            state.newlyAddedItemIds.push(revealId);
          }
        } else {
          const scene = GAME_DATA.scenes.find(s => s.id === revealId);
          if (scene && !state.revealedScenes.includes(revealId)) {
            state.revealedScenes.push(revealId);
            addText(`New area unlocked: ${scene.name}!`, 'success');
          }
        }
      });
    }

    // Re-render current scene to update UI
    renderScene(state.currentScene);
    saveState();
  }

  function go(targetSceneId) {
    const scene = GAME_DATA.scenes.find(s => s.id === state.currentScene);
    if (!scene) return;
    const exits = scene.exits || {};
    const dir = Object.keys(exits).find(d => exits[d] === targetSceneId);
    if (!dir) {
      addText("You can't go that way.", 'system');
      return;
    }
    if (isExitBlocked(state.currentScene, dir)) {
      const blocker = GAME_DATA.puzzles.find(p =>
        !state.solvedPuzzles.includes(p.id) &&
        ((typeof p.blocksExit === 'string' && p.blocksExit === dir && p.scene === state.currentScene) ||
         (typeof p.blocksExit === 'object' && p.blocksExit.direction === dir && p.blocksExit.scene === state.currentScene))
      );
      if (blocker && blocker.blockedMessage) {
        addText(blocker.blockedMessage, 'locked');
      } else {
        addText(`The way ${dir} is blocked.`, 'locked');
      }
      return;
    }
    if (!isTargetSceneRevealed(targetSceneId)) {
      addText("That destination is not yet accessible.", 'locked');
      return;
    }
    addText(`You go ${dir}.`, 'system');
    renderScene(targetSceneId);
  }

  function checkWin() {
    if (state.won) return;
    const wc = GAME_DATA.winCondition;
    if (!wc) return;
    if (state.currentScene === wc.scene && wc.requires.every(req => state.inventory.includes(req))) {
      state.won = true;
      addText('', '');
      addText('*** ' + wc.description + ' ***', 'success');
      addText('', '');
      addText('CONGRATULATIONS! YOU HAVE COMPLETED THE GAME!', 'success');
      addText('Type /restart to play again.', 'system');
    }
  }

  // ----- Event Listeners -----

  document.querySelectorAll('.cmd-btn').forEach(btn => {
    btn.onclick = () => setCommand(btn.dataset.cmd);
  });

  document.addEventListener('click', (e) => {
    // Puzzle hotspot
    if (e.target.classList.contains('puzzle-hotspot')) {
      const puzzleId = e.target.dataset.puzzleId;
      if (state.activeCommand === 'use' && state.selectedItem) {
        useItemOn(state.selectedItem, puzzleId);
      } else {
        addText("It seems to need something you don't have yet.", 'system');
      }
      e.stopPropagation();
      return;
    }

    // Look target (items, scenery)
    if (e.target.classList.contains('look-target')) {
      const target = e.target.dataset.look;
      if (state.activeCommand === 'use' && state.selectedItem) {
        // Using an item on a look target (non-puzzle) is not defined
        addText("You can't use that here.", 'system');
      } else {
        lookAt(target);
      }
    }
  });

  // ----- Initialize -----
  function init() {
    addText('=== ' + GAME_DATA.title.toUpperCase() + ' ===', 'success');
    addText(GAME_DATA.setting, 'system');
    addText('');
    addText('Commands: LOOK | TAKE | USE | EXAMINE', 'system');
    addText('Click exits to move between rooms.', 'system');
    addText('---', 'system');

    if (!loadState()) {
      // Fresh start
      state.currentScene = 'vestibule';
      renderScene('vestibule');
    } else {
      // Restore: ensure current scene is rendered fresh
      renderScene(state.currentScene);
      addText('[Game restored from save]', 'system');
    }
  }

  // Wait for DOM to be ready if needed (script at end, so immediate)
  init();
})();
