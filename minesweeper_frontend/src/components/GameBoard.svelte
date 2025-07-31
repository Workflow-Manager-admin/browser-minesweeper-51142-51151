<script>
  import { createEventDispatcher, onMount } from "svelte";
  import { revealTile, toggleFlag, checkGameStatus } from "../lib/game";

  export let board;
  export let gameStatus;

  const dispatch = createEventDispatcher();

  let grid = [];
  let flagged = 0;
  let revealed = 0;
  let internalStatus = "ready"; // ready, playing, won, lost

  function setupBoard() {
    grid = board.map(row => row.map(cell => ({ ...cell })));
    flagged = grid.flat().filter(c => c.flagged).length;
    revealed = grid.flat().filter(c => c.revealed).length;
    internalStatus = "ready";
    updateStats();
  }

  function handleTileClick(rowIdx, colIdx) {
    if (internalStatus === "won" || internalStatus === "lost") return;
    const cell = grid[rowIdx][colIdx];
    if (cell.flagged || cell.revealed) return;
    if (internalStatus !== "playing") internalStatus = "playing";
    revealTile(grid, rowIdx, colIdx);
    revealed = grid.flat().filter(t => t.revealed).length;
    updateStats();
    internalStatus = checkGameStatus(grid, cell) || internalStatus;
    if (internalStatus === "won" || internalStatus === "lost") revealAll();
    updateStats();
  }

  function handleRightClick(e, rowIdx, colIdx) {
    e.preventDefault();
    if (internalStatus === "won" || internalStatus === "lost") return;
    if (internalStatus !== "playing") internalStatus = "playing";
    const cell = grid[rowIdx][colIdx];
    if (cell.revealed) return;
    toggleFlag(cell);
    flagged = grid.flat().filter(c => c.flagged).length;
    updateStats();
  }

  function revealAll() {
    for (let r of grid) for (let c of r) c.revealed = true;
  }

  function updateStats() {
    dispatch("stats", {
      revealed,
      flagged,
      status: internalStatus
    });
  }

  // Reset board each time props change (e.g., on restart)
  $: board, setupBoard();

  onMount(() => setupBoard());
</script>

<div class="gameboard"
  style="
    grid-template-columns: repeat({grid[0]?.length || 1}, 1fr);
    grid-template-rows: repeat({grid.length || 1}, 1fr);
  "
>
  {#each grid as row, rIdx}
    {#each row as cell, cIdx}
      <div
        class="cell {cell.revealed ? 'revealed' : ''} {cell.flagged ? 'flagged' : ''} {internalStatus === 'lost' && cell.mine ? 'exploded' : ''}"
        on:click={() => handleTileClick(rIdx, cIdx)}
        on:contextmenu={(e) => handleRightClick(e, rIdx, cIdx)}
        on:keydown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleTileClick(rIdx, cIdx);
          } else if (e.key === "f" || e.key === "F") {
            // allow flag/unflag by keyboard
            e.preventDefault();
            handleRightClick(e, rIdx, cIdx);
          }
        }}
        aria-label={cell.mine ? "Mine" : `cell`}
        tabindex="0"
        role="button"
      >
        {#if cell.revealed}
          {#if cell.mine}
            <span class="mine">{internalStatus === 'lost' ? '💥' : "💣"}</span>
          {:else if cell.adjacent > 0}
            <span class="number n{cell.adjacent}">{cell.adjacent}</span>
          {/if}
        {:else if cell.flagged}
          <span class="flag">🚩</span>
        {/if}
      </div>
    {/each}
  {/each}
</div>

<style>
  .gameboard {
    display: grid;
    gap: 2.5px;
    max-width: 99vw;
    background: var(--color-secondary);
    box-sizing: border-box;
    border-radius: 12px;
    box-shadow: 0 0 16px rgba(74,144,226, .16);
    padding: 5px;
    min-width: 150px;
    min-height: 80px;
    margin: 0 auto;
    touch-action: manipulation;
    transition: max-width 0.4s;
  }
  .cell {
    width: 32px;
    height: 32px;
    background: #fff;
    border-radius: 8px;
    border: none;
    box-shadow: 0 1.5px 6px rgba(80,227,194,.08);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3em;
    cursor: pointer;
    user-select: none;
    font-family: inherit;
    color: var(--color-primary);
    transition: background 0.12s, color 0.1s;
    outline: none;
    position: relative;
  }
  .cell:active {
    background: var(--color-accent);
    color: #fff;
  }
  .cell.flagged {
    background: var(--color-secondary);
    color: var(--color-accent);
  }
  .cell.revealed {
    background: #f6fafd;
    cursor: default;
    color: #23282e;
  }
  .cell.revealed .number {
    font-weight: bold;
    font-size: 1.13em;
    line-height: 1;
  }
  .cell .flag,
  .cell .mine {
    font-size: 1.3em;
  }
  .cell.exploded {
    background: #ff4e34;
    color: #fff;
    animation: blink-hit .11s 3;
  }
  @keyframes blink-hit {
    50% { background: #fff; color: #ff4e34;}
  }
  .number.n1 { color: #4886e2;}
  .number.n2 { color: #339c5e;}
  .number.n3 { color: #f47b22;}
  .number.n4 { color: #b24be2;}
  .number.n5 { color: #bbc222;}
  .number.n6 { color: #26b2e2;}
  .number.n7 { color: #23282e;}
  .number.n8 { color: #f5a623;}

  @media (max-width: 600px) {
    .gameboard {
      max-width: 97vw;
      padding: 2.5px;
      border-radius: 5px;
    }
    .cell {
      width: 22vw;
      max-width: 28px; 
      height: 22vw;
      max-height: 28px;
      font-size: 1.08em;
    }
  }
</style>
