// Game Logic for "The Bunker Below" - Game #19
// Created by Hex Corbin, Gameplay Coder

// Global variable scoping as required - using var for globals
var GAME_ART = {};

// State tracking for visual feedback
var lastSolvedPuzzleId = null;
var newlyUnlockedExits = {};
var newlyRevealedItems = {};

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Register custom game logic with the standard runtime
    if (window.registerGameLogic) {
        window.registerGameLogic({
            canExit: customCanExit,
            solvePuzzle: customSolvePuzzle,
            takeItem: customTakeItem,
            moveToExit: customMoveToExit,
            renderAll: customRenderAll,
            resetGame: customResetGame
        });
    }
});

// Custom exit checking logic - implements locked exits pattern from SOUL.md
function customCanExit(sceneId, direction) {
    // Use the standard runtime's canExit function first
    if (typeof window.canExit === 'function') {
        return window.canExit(sceneId, direction);
    }
    
    // Fallback implementation if standard runtime function not available
    const scene = window.findScene ? window.findScene(sceneId) : null;
    if (!scene || !scene.exits || !scene.exits[direction]) {
        return false;
    }
    
    // Check if any unsolved puzzle blocks this exit
    const blocker = (window.gameData || {}).puzzles?.find(p =>
        p.blocksExit?.scene === sceneId &&
        p.blocksExit?.direction === direction &&
        !window.state?.solvedPuzzles?.includes(p.id)
    );
    
    if (blocker) {
        // Add feedback for locked exit
        if (typeof window.addSceneMessage === 'function') {
            window.addSceneMessage(`[The way ${direction} is blocked. ${blocker.blockedMessage || 'Something prevents you from going that way.'}]`, 'locked');
        }
        return false;
    }
    
    return true;
}

// Custom puzzle solving with visual feedback
function customSolvePuzzle(puzzle) {
    // Call the standard runtime's solvePuzzle if available
    if (typeof window.solvePuzzle === 'function') {
        window.solvePuzzle(puzzle);
    }
    
    // Track for visual feedback
    lastSolvedPuzzleId = puzzle.id;
    
    // Track newly unlocked exits
    if (puzzle.blocksExit) {
        newlyUnlockedExits[puzzle.id] = {
            scene: puzzle.blocksExit.scene,
            direction: puzzle.blocksExit.direction
        };
    }
    
    // Trigger visual feedback
    triggerPuzzleSolvedFeedback();
}

// Custom item taking with visual feedback
function customTakeItem(itemId) {
    // Call the standard runtime's takeItem if available
    if (typeof window.takeItem === 'function') {
        window.takeItem(itemId);
    }
    
    // Track for visual feedback
    newlyRevealedItems[itemId] = Date.now();
    
    // Trigger item reveal feedback
    triggerItemGlowFeedback(itemId);
}

// Custom exit movement with visual feedback for newly unlocked exits
function customMoveToExit(direction) {
    // Call the standard runtime's moveToExit if available
    if (typeof window.moveToExit === 'function') {
        window.moveToExit(direction);
    }
    
    // Clear exit unlock tracking after movement
    Object.keys(newlyUnlockedExits).forEach(puzzleId => {
        delete newlyUnlockedExits[puzzleId];
    });
}

// Custom render all with visual state changes
function customRenderAll() {
    // Call the standard runtime's renderAll if available
    if (typeof window.renderAll === 'function') {
        window.renderAll();
    }
    
    // Apply visual feedback effects
    applyVisualFeedback();
}

// Custom reset game
function customResetGame() {
    // Call the standard runtime's resetGame if available
    if (typeof window.resetGame === 'function') {
        window.resetGame();
    }
    
    // Reset tracking variables
    lastSolvedPuzzleId = null;
    newlyUnlockedExits = {};
    newlyRevealedItems = {};
}

// Apply visual feedback effects
function applyVisualFeedback() {
    // Puzzle solved flash effect
    if (lastSolvedPuzzleId && typeof window.dom !== 'undefined' && window.dom.artDisplay) {
        window.dom.artDisplay.classList.add('puzzle-solved');
        // Remove after 600ms as specified in SOUL.md
        setTimeout(() => {
            if (window.dom && window.dom.artDisplay) {
                window.dom.artDisplay.classList.remove('puzzle-solved');
            }
        }, 600);
        lastSolvedPuzzleId = null; // Reset after applying
    }
    
    // Exit buttons pulse effect for newly unlocked exits
    if (typeof window.dom !== 'undefined' && window.dom.exitsBar) {
        // Remove any existing newly-unlocked classes first
        window.dom.exitsBar.querySelectorAll('.exit-btn.newly-unlocked')
            .forEach(btn => btn.classList.remove('newly-unlocked'));
        
        // Add newly-unlocked class to relevant exit buttons
        Object.values(newlyUnlockedExits).forEach(exitInfo => {
            const exitButton = window.dom.exitsBar.querySelector(
                `.exit-btn[data-direction="${exitInfo.direction}"]`
            );
            if (exitButton) {
                exitButton.classList.add('newly-unlocked');
            }
        });
    }
    
    // Item glow effect for newly revealed items
    if (typeof window.dom !== 'undefined' && window.dom.inventoryBar) {
        const now = Date.now();
        // Remove item-new class from items that have been revealed for over 1 second
        window.dom.inventoryBar.querySelectorAll('.inv-item.item-new')
            .forEach(itemEl => {
                const itemId = itemEl.dataset.itemId;
                if (newlyRevealedItems[itemId] && now - newlyRevealedItems[itemId] > 1000) {
                    itemEl.classList.remove('item-new');
                    delete newlyRevealedItems[itemId];
                }
            });
        
        // Add item-new class to recently revealed items
        Object.keys(newlyRevealedItems).forEach(itemId => {
            if (now - newlyRevealedItems[itemId] <= 1000) { // Within 1 second
                const itemElement = window.dom.inventoryBar.querySelector(
                    `.inv-item[data-item-id="${itemId}"]`
                );
                if (itemElement) {
                    itemElement.classList.add('item-new');
                }
            }
        });
    }
}

// Trigger puzzle solved feedback
function triggerPuzzleSolvedFeedback() {
    // This will be handled by applyVisualFeedback during next render cycle
}

// Trigger item glow feedback
function triggerItemGlowFeedback(itemId) {
    // This will be handled by applyVisualFeedback during next render cycle
}

// Export functions for potential direct access
window.GameLogic = {
    customCanExit,
    customSolvePuzzle,
    customTakeItem,
    customMoveToExit,
    customRenderAll,
    customResetGame
};