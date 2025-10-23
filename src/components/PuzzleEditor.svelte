<script>
  import { createEventDispatcher } from 'svelte';
  import { PuzzleSolver } from '../core/solver.js';

  export let puzzleConfig;

  const dispatch = createEventDispatcher();

  // Editor state
  let mode = 'setting'; // 'setting' | 'solving'
  let selectedCell = null;
  let isSolving = false;
  let solveProgress = null;
  let solverResult = null;

  // Grid data structures
  const rows = puzzleConfig.grid.rows;
  const cols = puzzleConfig.grid.cols;
  const hasNumbers = puzzleConfig.variables.includes('numbers-all') || puzzleConfig.variables.includes('numbers-some');
  const hasShading = puzzleConfig.variables.includes('shading');

  // Cell data: { value, pencilMarks: Set, shaded, isClue }
  // Separate arrays for setting and solving data
  let settingData = Array(rows).fill(null).map(() =>
    Array(cols).fill(null).map(() => ({
      value: null,
      pencilMarks: new Set(),
      shaded: false,
      isClue: false
    }))
  );

  let solvingData = Array(rows).fill(null).map(() =>
    Array(cols).fill(null).map(() => ({
      value: null,
      pencilMarks: new Set(),
      shaded: false
    }))
  );

  $: currentData = mode === 'setting' ? settingData : solvingData;

  // Solver instance
  const solver = new PuzzleSolver();

  function selectCell(r, c) {
    selectedCell = { r, c };
  }

  function handleKeyPress(event) {
    if (!selectedCell || isSolving) return;

    const { r, c } = selectedCell;
    const key = event.key;

    if (hasNumbers) {
      // Number input (1-9)
      if (key >= '1' && key <= '9') {
        const num = parseInt(key);
        const maxNum = puzzleConfig.variableConfig['numbers-all']?.max ||
                      puzzleConfig.variableConfig['numbers-some']?.max || 9;

        if (num <= maxNum) {
          if (event.shiftKey || event.ctrlKey) {
            // Toggle pencil mark
            if (currentData[r][c].pencilMarks.has(num)) {
              currentData[r][c].pencilMarks.delete(num);
            } else {
              currentData[r][c].pencilMarks.add(num);
            }
            currentData = currentData;
          } else {
            // Set main value
            currentData[r][c].value = num;
            currentData[r][c].pencilMarks.clear();
            if (mode === 'setting') {
              currentData[r][c].isClue = true;
            }
            currentData = currentData;
          }
        }
      } else if (key === 'Backspace' || key === 'Delete' || key === '0') {
        // Clear cell
        if (mode === 'solving' || !currentData[r][c].isClue) {
          currentData[r][c].value = null;
          currentData[r][c].pencilMarks.clear();
          currentData = currentData;
        }
      }
    }

    if (hasShading && (key === 's' || key === 'S')) {
      // Toggle shading
      currentData[r][c].shaded = !currentData[r][c].shaded;
      currentData = currentData;
    }

    // Arrow key navigation
    if (key === 'ArrowUp' && r > 0) selectCell(r - 1, c);
    if (key === 'ArrowDown' && r < rows - 1) selectCell(r + 1, c);
    if (key === 'ArrowLeft' && c > 0) selectCell(r, c - 1);
    if (key === 'ArrowRight' && c < cols - 1) selectCell(r, c + 1);
  }

  function clearSolvingData() {
    solvingData = Array(rows).fill(null).map(() =>
      Array(cols).fill(null).map(() => ({
        value: null,
        pencilMarks: new Set(),
        shaded: false
      }))
    );
  }

  async function solvePuzzle() {
    isSolving = true;
    solveProgress = 'Compiling puzzle...';
    solverResult = null;

    try {
      // Configure solver with grid and variables
      solver.configure(
        puzzleConfig.grid,
        puzzleConfig.variables,
        puzzleConfig.variableConfig
      );

      // Add clues from setting data
      solveProgress = 'Adding clues...';
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = settingData[r][c];
          if (cell.value !== null && hasNumbers) {
            solver.addClue(r, c, puzzleConfig.variables.find(v => v.startsWith('numbers')), cell.value);
          }
          if (cell.shaded && hasShading) {
            solver.addClue(r, c, 'shading', true);
          }
        }
      }

      // Add default rules based on grid preset
      solveProgress = 'Adding rules...';
      if (puzzleConfig.grid.defaultRules) {
        // TODO: Add default rules from grid preset
      }

      solveProgress = 'Solving...';
      const result = await solver.solve({ numSolutions: 1 });

      solverResult = result;
      isSolving = false;
      solveProgress = null;

      if (result.status === 'SATISFIED' || result.status === 'ALL_SOLUTIONS') {
        // Parse solution and update solving data
        parseSolution(result);
      }
    } catch (error) {
      console.error('Solve error:', error);
      solverResult = { status: 'ERROR', error: error.message };
      isSolving = false;
      solveProgress = null;
    }
  }

  function parseSolution(result) {
    // Parse the solution output
    if (!result.solutions || result.solutions.length === 0) return;

    const solution = result.solutions[0];
    console.log('Parsing solution:', solution);

    // The solution.output contains the formatted output
    // We need to parse it to extract grid values
    if (solution.output) {
      const outputText = typeof solution.output === 'string'
        ? solution.output
        : solution.output.default || '';

      console.log('Solution output:', outputText);

      // Parse numbers grid if present
      if (hasNumbers && outputText.includes('numbers:')) {
        const numbersMatch = outputText.match(/numbers:\s*([\s\S]*?)(?=\n\n|$)/);
        if (numbersMatch) {
          const gridText = numbersMatch[1].trim();
          const lines = gridText.split('\n').map(line =>
            line.trim().replace(/[|\[\]]/g, '').split(/\s+/).filter(x => x)
          );

          for (let r = 0; r < Math.min(rows, lines.length); r++) {
            for (let c = 0; c < Math.min(cols, lines[r].length); c++) {
              const val = parseInt(lines[r][c]);
              if (!isNaN(val) && val > 0) {
                solvingData[r][c].value = val;
              }
            }
          }
          solvingData = solvingData;
        }
      }
    }
  }

  function cancelSolve() {
    // TODO: Implement actual solver cancellation
    isSolving = false;
    solveProgress = null;
  }
</script>

<svelte:window on:keydown={handleKeyPress} />

<div class="puzzle-editor">
  <div class="toolbar">
    <div class="mode-toggle">
      <button
        class:active={mode === 'setting'}
        on:click={() => mode = 'setting'}
        disabled={isSolving}
      >
        Setting Mode
      </button>
      <button
        class:active={mode === 'solving'}
        on:click={() => mode = 'solving'}
        disabled={isSolving}
      >
        Solving Mode
      </button>
    </div>

    <div class="actions">
      {#if mode === 'solving'}
        <button on:click={clearSolvingData} disabled={isSolving}>
          Clear Solving Data
        </button>
      {/if}

      {#if !isSolving}
        <button class="solve-btn" on:click={solvePuzzle}>
          Solve Puzzle
        </button>
      {:else}
        <button class="cancel-btn" on:click={cancelSolve}>
          Cancel
        </button>
      {/if}
    </div>
  </div>

  <div class="editor-content">
    <div class="grid-container">
      <div class="grid" style="grid-template-columns: repeat({cols}, 50px);">
        {#each Array(rows) as _, r}
          {#each Array(cols) as _, c}
            {@const cell = currentData[r][c]}
            {@const isSelected = selectedCell?.r === r && selectedCell?.c === c}
            {@const isClue = mode === 'setting' && settingData[r][c].isClue}
            <div
              class="cell"
              class:selected={isSelected}
              class:clue={isClue}
              class:shaded={cell.shaded}
              class:solving-mode={mode === 'solving'}
              on:click={() => selectCell(r, c)}
              role="button"
              tabindex="0"
            >
              {#if cell.value}
                <div class="cell-value" class:solving={mode === 'solving' && !isClue}>
                  {cell.value}
                </div>
              {/if}
              {#if cell.pencilMarks.size > 0}
                <div class="pencil-marks">
                  {#each Array.from(cell.pencilMarks).sort() as mark}
                    <span>{mark}</span>
                  {/each}
                </div>
              {/if}
            </div>
          {/each}
        {/each}
      </div>
    </div>

    <div class="side-panel">
      <div class="info-panel">
        <h3>Grid: {rows} × {cols}</h3>
        <p>Mode: <strong class:solving-text={mode === 'solving'}>{mode}</strong></p>
        <p>Variables: {puzzleConfig.variables.join(', ')}</p>

        <div class="instructions">
          <h4>Controls:</h4>
          <ul>
            <li><strong>1-9:</strong> Enter number</li>
            <li><strong>Shift+1-9:</strong> Pencil mark</li>
            <li><strong>Backspace/Delete:</strong> Clear cell</li>
            {#if hasShading}
              <li><strong>S:</strong> Toggle shading</li>
            {/if}
            <li><strong>Arrows:</strong> Navigate</li>
          </ul>
        </div>

        {#if mode === 'setting'}
          <div class="setting-info">
            <p>Black numbers are permanent clues</p>
          </div>
        {:else}
          <div class="solving-info">
            <p>Blue numbers are your solving attempts</p>
          </div>
        {/if}
      </div>

      {#if isSolving}
        <div class="solve-status solving">
          <h4>Solving...</h4>
          <p>{solveProgress}</p>
        </div>
      {:else if solverResult}
        <div class="solve-status" class:success={solverResult.status === 'SATISFIED' || solverResult.status === 'ALL_SOLUTIONS'} class:error={solverResult.status === 'ERROR' || solverResult.status === 'UNSATISFIABLE'}>
          <h4>Result: {solverResult.status}</h4>
          {#if solverResult.status === 'SATISFIED' || solverResult.status === 'ALL_SOLUTIONS'}
            <p>Solution found!</p>
          {:else if solverResult.status === 'UNSATISFIABLE'}
            <p>No solution exists for this puzzle</p>
          {:else if solverResult.status === 'ERROR'}
            <p>Error: {solverResult.error}</p>
          {/if}
          {#if solverResult.time}
            <p>Time: {solverResult.time.toFixed(2)}s</p>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <div class="bottom-toolbar">
    <button on:click={() => dispatch('back')}>Back to Variables</button>
  </div>
</div>

<style>
  .puzzle-editor {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 100%;
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .mode-toggle {
    display: flex;
    gap: 0.5rem;
  }

  .mode-toggle button {
    padding: 0.5rem 1rem;
    background: #e0e0e0;
    color: #333;
  }

  .mode-toggle button.active {
    background: #4CAF50;
    color: white;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }

  .solve-btn {
    background: #2196F3;
  }

  .solve-btn:hover {
    background: #1976D2;
  }

  .cancel-btn {
    background: #f44336;
  }

  .cancel-btn:hover {
    background: #d32f2f;
  }

  .editor-content {
    display: flex;
    gap: 2rem;
    align-items: flex-start;
  }

  .grid-container {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .grid {
    display: grid;
    gap: 0;
    border: 3px solid #333;
  }

  .cell {
    width: 50px;
    height: 50px;
    border: 1px solid #999;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
    background: white;
    transition: all 0.1s;
  }

  .cell:hover {
    background: #f0f0f0;
  }

  .cell.selected {
    background: #e3f2fd;
    border: 2px solid #2196F3;
  }

  .cell.shaded {
    background: #666;
  }

  .cell.shaded:hover {
    background: #555;
  }

  .cell-value {
    font-size: 24px;
    font-weight: bold;
    color: #000;
  }

  .cell-value.solving {
    color: #2196F3;
  }

  .cell.clue .cell-value {
    color: #000;
  }

  .pencil-marks {
    position: absolute;
    inset: 2px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 1px;
    font-size: 10px;
    color: #666;
    pointer-events: none;
  }

  .solving-mode .pencil-marks {
    color: #2196F3;
  }

  .pencil-marks span {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .side-panel {
    flex: 1;
    min-width: 250px;
    max-width: 400px;
  }

  .info-panel {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .info-panel h3 {
    margin: 0 0 1rem 0;
    color: #333;
  }

  .info-panel p {
    margin: 0.5rem 0;
    color: #666;
  }

  .solving-text {
    color: #2196F3;
  }

  .instructions {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #ddd;
  }

  .instructions h4 {
    margin: 0 0 0.75rem 0;
    font-size: 0.9rem;
    color: #666;
  }

  .instructions ul {
    margin: 0;
    padding-left: 1.5rem;
    font-size: 0.85rem;
    color: #666;
  }

  .instructions li {
    margin: 0.25rem 0;
  }

  .setting-info, .solving-info {
    margin-top: 1rem;
    padding: 0.75rem;
    background: #f5f5f5;
    border-radius: 4px;
    font-size: 0.85rem;
    color: #666;
  }

  .solve-status {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
  }

  .solve-status h4 {
    margin: 0 0 0.75rem 0;
  }

  .solve-status p {
    margin: 0.5rem 0;
    color: #666;
  }

  .solve-status.solving {
    border-left: 4px solid #2196F3;
  }

  .solve-status.success {
    border-left: 4px solid #4CAF50;
  }

  .solve-status.success h4 {
    color: #4CAF50;
  }

  .solve-status.error {
    border-left: 4px solid #f44336;
  }

  .solve-status.error h4 {
    color: #f44336;
  }

  .bottom-toolbar {
    padding-top: 1rem;
    border-top: 2px solid #ddd;
  }
</style>
