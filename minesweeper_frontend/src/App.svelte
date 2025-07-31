<script>
  import { onMount } from "svelte";
  import GameBoard from "./components/GameBoard.svelte";
  import { difficulties, defaultDifficulty, newBoard } from "./lib/game";

  let difficulty = defaultDifficulty;
  let customRows = defaultDifficulty.rows;
  let customCols = defaultDifficulty.cols;
  let customMines = defaultDifficulty.mines;
  let board, mineCount, gameStatus, revealedCount, flaggedCount, timer, intervalId;
  let startTime, elapsed = 0;

  // Status: "ready", "playing", "won", "lost"
  function resetGame(selectedDifficulty = difficulty) {
    if (intervalId) clearInterval(intervalId);
    elapsed = 0;
    timer = 0;
    startTime = null;
    difficulty = selectedDifficulty;
    if (difficulty.id === "custom") {
      board = newBoard(customRows, customCols, customMines);
      mineCount = customMines;
    } else {
      board = newBoard(difficulty.rows, difficulty.cols, difficulty.mines);
      mineCount = difficulty.mines;
    }
    revealedCount = 0;
    flaggedCount = 0;
    gameStatus = "ready";
  }

  function handleStart() {
    startTime = Date.now();
    gameStatus = "playing";
    intervalId = setInterval(() => {
      elapsed = Math.floor((Date.now() - startTime) / 1000);
      timer = elapsed;
    }, 1000);
  }

  function handleGameOver(win) {
    if (intervalId) clearInterval(intervalId);
    gameStatus = win ? "won" : "lost";
  }

  function handleStats(event) {
    revealedCount = event.detail.revealed;
    flaggedCount = event.detail.flagged;
    if (event.detail.status === "won" || event.detail.status === "lost") {
      handleGameOver(event.detail.status === "won");
    }
    if (event.detail.status === "playing" && !intervalId) {
      handleStart();
    }
  }

  // "Restart" is always from current settings
  function handleRestart() {
    resetGame(difficulty);
  }

  // When user chooses a new difficulty, reset with new settings
  function handleDifficultyChange(e) {
    const val = e.target.value;
    const diff = difficulties.find((d) => d.id === val);
    if (diff.id !== "custom") {
      customRows = diff.rows;
      customCols = diff.cols;
      customMines = diff.mines;
    }
    resetGame(diff);
  }

  // For custom grid values
  function handleCustomInput() {
    resetGame({ id: "custom", rows: customRows, cols: customCols, mines: customMines });
  }

  $: remainingMines = mineCount - flaggedCount;

  onMount(() => {
    resetGame(defaultDifficulty);
  });
</script>

<div class="app-shell">
  <div class="controls">
    <div class="group">
      <label for="difficulty">Difficulty:</label>
      <select id="difficulty" on:change={handleDifficultyChange} bind:value={difficulty.id}>
        {#each difficulties as d}
          <option value={d.id}>{d.label}</option>
        {/each}
      </select>
      {#if difficulty.id === "custom"}
        <div class="custom-inputs">
          <input type="number" min="2" max="40" bind:value={customRows} on:input={handleCustomInput} title="Rows" />
          <input type="number" min="2" max="40" bind:value={customCols} on:input={handleCustomInput} title="Cols" />
          <input type="number" min="1" max={customRows*customCols-1} bind:value={customMines} on:input={handleCustomInput} title="Mines" />
        </div>
      {/if}
    </div>
    <div class="group">
      <button class="restart" on:click={handleRestart}>Restart</button>
    </div>
  </div>
  <div class="status-panel">
    <div class="panel">
      <span class="panel-item panel-primary">{timer ?? 0}s</span>
      <span class="panel-item panel-accent">{remainingMines} 🚩</span>
      <span class="panel-item panel-secondary">{#if gameStatus === "won"}🎉 Won!{:else if gameStatus === "lost"}💥 Game Over{:else if gameStatus === "playing"}Playing...{:else}Ready{/if}</span>
    </div>
  </div>
  <div class="gameboard-parent">
    <GameBoard {board} {gameStatus} on:stats={handleStats} />
  </div>
  <div class="footer">
    <span>Minesweeper &copy; {new Date().getFullYear()} — Minimalist Edition</span>
  </div>
</div>

<style>
  .app-shell {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
    margin: 0 auto;
    min-height: 100vh;
    justify-content: flex-start;
    background: var(--bg);
  }
  .controls {
    display: flex;
    gap: 2rem;
    align-items: center;
    margin-top: 2rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  .controls .group {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
  select, input[type="number"] {
    border: 1.5px solid var(--color-secondary);
    background: #fff;
    color: var(--color-primary);
    border-radius: 6px;
    font-size: 1rem;
    padding: 0.4em 0.8em;
    min-width: 60px;
  }
  .custom-inputs {
    display: flex;
    gap: 0.2em;
    align-items: center;
  }
  button.restart {
    background: var(--color-primary);
    color: #fff;
    padding: 0.6em 1.5em;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    font-weight: 500;
    transition: filter .1s;
  }
  button.restart:hover {
    filter: brightness(1.08);
    background: var(--color-accent);
    color: #fff;
  }
  .status-panel {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .panel {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    background: var(--color-primary);
    border-radius: 10px;
    padding: 0.75em 2.5em;
    color: #fff;
    font-size: 1.2em;
    box-shadow: 0 2px 12px rgba(80, 227, 194, 0.17);
    align-items: center;
    margin-bottom: 0.7em;
  }
  .panel-item {
    margin: 0 0.5em;
  }
  .panel-primary { color: var(--color-secondary);}
  .panel-accent { color: var(--color-accent);}
  .panel-secondary { color: #fff;}
  .gameboard-parent {
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: stretch;
    width: 100%;
  }
  .footer {
    padding: 1em 0.5em;
    font-size: 0.95em;
    color: var(--color-primary);
    opacity: 0.72;
    letter-spacing: 1.5px;
    margin-top: 1.1em;
  }

  @media (max-width: 600px) {
    .controls, .status-panel {
      flex-direction: column;
      gap: 1rem;
    }
    .panel {
      padding: 0.7em 0.8em;
      font-size: 1em;
    }
    .gameboard-parent {
      width: 100vw;
      margin-left: -1.5rem;
      margin-right: -1.5rem;
    }
  }
</style>
