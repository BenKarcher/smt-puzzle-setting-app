<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import { PuzzleSolver } from '../core/solver.js';
  import { getRuleById } from '../lib/rule-loader.js';
  import RuleSelector from './RuleSelector.svelte';
  import ConstraintSidebar from './ConstraintSidebar.svelte';
  import { getGlobalRules, getInstantiableRules, getCompatibleRules } from '../lib/rule-loader-v2.js';
  import { createRenderHelpers } from '../lib/render-helpers.js';

  export let puzzleConfig;

  const dispatch = createEventDispatcher();

  // Constants
  const CELL_SIZE = 60;
  const GRID_LINE_WIDTH = 1;
  const THICK_LINE_WIDTH = 3;

  // Editor state
  let mode = 'setting'; // 'setting' | 'solving'
  let editMode = 'numbers'; // 'numbers' | 'shading' | 'lines-center' | 'lines-edge' | 'regions' | 'select-cells'
  let selectedCell = null;
  let isSolving = false;
  let solveProgress = null;
  let solverResult = null;
  let showMiniZincCode = false;
  let compiledCode = '';
  let showRuleSelector = false;

  // Constraint state
  let globalRules = [];
  let constraintInstances = [];
  let selectedInstance = null;
  let selectedGroup = null;
  let instanceIdCounter = 1;

  // Grid data
  const rows = puzzleConfig.grid.rows;
  const cols = puzzleConfig.grid.cols;
  const hasNumbers = puzzleConfig.variables.includes('numbers-all') || puzzleConfig.variables.includes('numbers-some');
  const hasShading = puzzleConfig.variables.includes('shading');
  const hasLinesCenter = puzzleConfig.variables.includes('lines-center');
  const hasLinesEdge = puzzleConfig.variables.includes('lines-edge');

  // Default edit mode to first available variable type
  $: {
    if (hasNumbers) editMode = 'numbers';
    else if (hasShading) editMode = 'shading';
    else if (hasLinesCenter) editMode = 'lines-center';
    else if (hasLinesEdge) editMode = 'lines-edge';
  }

  // Cell data structures
  let settingData = Array(rows).fill(null).map(() =>
    Array(cols).fill(null).map(() => ({
      value: null,
      pencilMarks: new Set(),
      shaded: null, // null = unknown, true = shaded, false = not shaded (green)
      isClue: false
    }))
  );

  let solvingData = Array(rows).fill(null).map(() =>
    Array(cols).fill(null).map(() => ({
      value: null,
      pencilMarks: new Set(),
      shaded: null
    }))
  );

  // Region data - initialize from grid preset or default to sequential
  let regions = Array(rows).fill(null).map((_, r) =>
    Array(cols).fill(null).map((_, c) => {
      // If grid has preset regions, use them
      if (puzzleConfig.grid.regions) {
        for (let i = 0; i < puzzleConfig.grid.regions.length; i++) {
          if (puzzleConfig.grid.regions[i].some(cell => cell[0] === r && cell[1] === c)) {
            return i + 1; // 1-based region IDs
          }
        }
      }
      // Default: sequential region IDs
      return r * cols + c + 1;
    })
  );

  // Canvas references
  let canvas;
  let ctx;

  const solver = new PuzzleSolver();

  onMount(() => {
    ctx = canvas.getContext('2d');
    canvas.width = cols * CELL_SIZE + GRID_LINE_WIDTH;
    canvas.height = rows * CELL_SIZE + GRID_LINE_WIDTH;
    draw();
  });

  // Redraw when any state changes
  $: if (ctx) {
    // Track all state that affects rendering
    void editMode;
    void selectedInstance;
    void selectedGroup;
    void constraintInstances;
    void settingData;
    void solvingData;
    void selectedCell;
    draw();
  }

  function draw() {
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Step 1: Draw cell backgrounds (shading only)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        drawCellBackground(r, c);
      }
    }

    // Step 2: Draw grid outline
    drawGrid();

    // Step 3: Draw constraint visuals (in order they were added)
    drawConstraints();

    // Step 4: Draw numbers and pencil marks
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        drawCellNumbers(r, c);
      }
    }

    // UI overlays (selection, highlights) - drawn last
    // Highlight cells in current group (if in select-cells mode)
    if (editMode === 'select-cells' && selectedGroup) {
      drawGroupHighlight();
    }

    // Draw selection
    if (selectedCell) {
      drawSelection(selectedCell.r, selectedCell.c);
    }
  }

  function drawCellBackground(r, c) {
    const x = c * CELL_SIZE;
    const y = r * CELL_SIZE;

    const settingCell = settingData[r][c];
    const solvingCell = solvingData[r][c];

    // Background - show both setting and solving shading
    // Setting shading (given) is darker, solving shading is lighter
    ctx.fillStyle = '#fff'; // Default white

    // Given shading (darker)
    if (settingCell.shaded === true) {
      ctx.fillStyle = '#333'; // Dark gray for given shaded
      ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
    } else if (settingCell.shaded === false) {
      ctx.fillStyle = '#c8e6c9'; // Green for given not-shaded
      ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
    } else {
      // No given shading, check solving shading
      if (solvingCell.shaded === true) {
        ctx.fillStyle = '#888'; // Lighter gray for solving shaded
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
      } else if (solvingCell.shaded === false) {
        ctx.fillStyle = '#e8f5e9'; // Lighter green for solving not-shaded
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
      } else {
        // Unknown - white
        ctx.fillStyle = '#fff';
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
      }
    }
  }

  function drawCellNumbers(r, c) {
    const x = c * CELL_SIZE;
    const y = r * CELL_SIZE;

    const settingCell = settingData[r][c];
    const solvingCell = solvingData[r][c];

    // Draw given number (always visible in black)
    if (settingCell.value !== null && settingCell.isClue) {
      ctx.fillStyle = '#000';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(settingCell.value, x + CELL_SIZE / 2, y + CELL_SIZE / 2);
    }
    // Draw solving value (blue, always visible if present)
    else if (solvingCell.value !== null) {
      ctx.fillStyle = '#2196F3';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(solvingCell.value, x + CELL_SIZE / 2, y + CELL_SIZE / 2);
    }

    // Draw pencil marks from both modes
    // Prefer solving mode pencil marks if in solving mode
    const pencilMarks = mode === 'solving' ? solvingCell.pencilMarks : settingCell.pencilMarks;
    if (pencilMarks.size > 0) {
      drawPencilMarks(x, y, pencilMarks, mode === 'solving');
    }
  }

  function drawPencilMarks(x, y, marks, isSolving) {
    ctx.fillStyle = isSolving ? '#2196F3' : '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const marksArray = Array.from(marks).sort();
    const gridSize = 3;
    const cellMargin = 4;
    const markSize = (CELL_SIZE - cellMargin * 2) / gridSize;

    marksArray.forEach(mark => {
      if (mark >= 1 && mark <= 9) {
        const idx = mark - 1;
        const row = Math.floor(idx / gridSize);
        const col = idx % gridSize;
        const mx = x + cellMargin + col * markSize + markSize / 2;
        const my = y + cellMargin + row * markSize + markSize / 2;
        ctx.fillText(mark.toString(), mx, my);
      }
    });
  }

  function drawGrid() {
    ctx.strokeStyle = '#999';
    ctx.lineWidth = GRID_LINE_WIDTH;

    // Vertical lines
    for (let c = 0; c <= cols; c++) {
      const x = c * CELL_SIZE;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rows * CELL_SIZE);
      ctx.stroke();
    }

    // Horizontal lines
    for (let r = 0; r <= rows; r++) {
      const y = r * CELL_SIZE;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(cols * CELL_SIZE, y);
      ctx.stroke();
    }

    // Thick lines based on region boundaries
    ctx.strokeStyle = '#000';
    ctx.lineWidth = THICK_LINE_WIDTH;

    // Draw vertical thick lines between different regions
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Check right neighbor
        if (c < cols - 1 && regions[r][c] !== regions[r][c + 1]) {
          const x = (c + 1) * CELL_SIZE;
          const y = r * CELL_SIZE;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + CELL_SIZE);
          ctx.stroke();
        }
        // Check bottom neighbor
        if (r < rows - 1 && regions[r][c] !== regions[r + 1][c]) {
          const x = c * CELL_SIZE;
          const y = (r + 1) * CELL_SIZE;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + CELL_SIZE, y);
          ctx.stroke();
        }
      }
    }

    // Also draw thick border around entire grid
    ctx.strokeRect(0, 0, cols * CELL_SIZE, rows * CELL_SIZE);
  }

  function drawSelection(r, c) {
    const x = c * CELL_SIZE;
    const y = r * CELL_SIZE;

    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
  }

  function drawConstraints() {
    // Create grid info object
    const gridInfo = {
      rows,
      cols,
      regions
    };

    // Create helper functions with cellSize and gridInfo bound
    const helpers = createRenderHelpers(CELL_SIZE, gridInfo);

    // Draw each constraint instance
    for (const instance of constraintInstances) {
      if (instance.rule.render && typeof instance.rule.render === 'function') {
        try {
          instance.rule.render(instance.groups, ctx, helpers);
        } catch (error) {
          console.error(`Error rendering constraint ${instance.rule.id}:`, error);
        }
      }
    }
  }

  function drawGroupHighlight() {
    if (!selectedGroup) return;

    // Highlight all cells in the current group
    for (let i = 0; i < selectedGroup.cells.length; i++) {
      const [r, c] = selectedGroup.cells[i];
      const x = c * CELL_SIZE;
      const y = r * CELL_SIZE;

      ctx.fillStyle = 'rgba(33, 150, 243, 0.2)'; // Light blue overlay
      ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

      // Draw border
      ctx.strokeStyle = '#2196F3';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);

      // Draw cell index (1-indexed for MiniZinc)
      ctx.fillStyle = '#2196F3';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText((i + 1).toString(), x + CELL_SIZE - 4, y + 4);
    }
  }

  function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const c = Math.floor(x / CELL_SIZE);
    const r = Math.floor(y / CELL_SIZE);

    if (r >= 0 && r < rows && c >= 0 && c < cols) {
      selectedCell = { r, c };

      // If in select-cells mode, toggle cell in current group
      if (editMode === 'select-cells' && selectedGroup) {
        const cellIndex = selectedGroup.cells.findIndex(([cr, cc]) => cr === r && cc === c);
        if (cellIndex >= 0) {
          // Remove cell
          selectedGroup.cells.splice(cellIndex, 1);
        } else {
          // Add cell
          selectedGroup.cells.push([r, c]);
        }
        selectedGroup.cells = [...selectedGroup.cells]; // Trigger reactivity
        constraintInstances = constraintInstances; // Trigger reactivity
      }

      draw();
    } else {
      // Clicked outside grid - exit select-cells mode
      if (editMode === 'select-cells') {
        exitSelectCellsMode();
      }
    }
  }

  function exitSelectCellsMode() {
    selectedInstance = null;
    selectedGroup = null;
    editMode = hasNumbers ? 'numbers' : hasShading ? 'shading' : 'numbers';
    draw();
  }

  function handleKeyPress(event) {
    // Allow Escape to exit select-cells mode even without a selected cell
    if (event.key === 'Escape' && editMode === 'select-cells') {
      exitSelectCellsMode();
      return;
    }

    if (!selectedCell || isSolving) return;

    const { r, c } = selectedCell;
    const key = event.key;
    const currentData = mode === 'setting' ? settingData : solvingData;

    if (editMode === 'numbers' && hasNumbers) {
      // Number input
      if (key >= '1' && key <= '9') {
        const num = parseInt(key);
        const maxNum = puzzleConfig.variableConfig['numbers-all']?.max ||
                      puzzleConfig.variableConfig['numbers-some']?.max || 9;

        if (num <= maxNum) {
          if (event.shiftKey) {
            // Toggle pencil mark
            if (currentData[r][c].pencilMarks.has(num)) {
              currentData[r][c].pencilMarks.delete(num);
            } else {
              currentData[r][c].pencilMarks.add(num);
            }
            currentData[r][c].pencilMarks = new Set(currentData[r][c].pencilMarks); // Trigger reactivity
          } else {
            // Set main value
            currentData[r][c].value = num;
            currentData[r][c].pencilMarks.clear();
            if (mode === 'setting') {
              currentData[r][c].isClue = true;
            }
          }
          draw();
        }
      } else if (key === 'Backspace' || key === 'Delete' || key === '0') {
        // Clear cell
        // In solving mode: only clear solving data, not given clues
        // In setting mode: can clear anything
        if (mode === 'setting') {
          // Can delete anything in setting mode
          currentData[r][c].value = null;
          currentData[r][c].pencilMarks.clear();
          currentData[r][c].isClue = false;
          draw();
        } else {
          // In solving mode: only clear solving data
          currentData[r][c].value = null;
          currentData[r][c].pencilMarks.clear();
          draw();
        }
      }
    } else if (editMode === 'shading' && hasShading) {
      // Shading mode
      if (key === 's' || key === 'S' || key === ' ') {
        // Cycle through: null -> true -> false -> null
        if (currentData[r][c].shaded === null) {
          currentData[r][c].shaded = true; // Black
        } else if (currentData[r][c].shaded === true) {
          currentData[r][c].shaded = false; // Green (not shaded)
        } else {
          currentData[r][c].shaded = null; // Unknown
        }
        draw();
      }
    }

    // Arrow key navigation
    if (key === 'ArrowUp' && r > 0) {
      event.preventDefault(); // Prevent page scroll
      selectedCell = { r: r - 1, c };
      draw();
    }
    if (key === 'ArrowDown' && r < rows - 1) {
      event.preventDefault(); // Prevent page scroll
      selectedCell = { r: r + 1, c };
      draw();
    }
    if (key === 'ArrowLeft' && c > 0) {
      event.preventDefault(); // Prevent page scroll
      selectedCell = { r, c: c - 1 };
      draw();
    }
    if (key === 'ArrowRight' && c < cols - 1) {
      event.preventDefault(); // Prevent page scroll
      selectedCell = { r, c: c + 1 };
      draw();
    }
  }

  function clearSolvingData() {
    solvingData = Array(rows).fill(null).map(() =>
      Array(cols).fill(null).map(() => ({
        value: null,
        pencilMarks: new Set(),
        shaded: null
      }))
    );
    draw();
  }

  async function solvePuzzle() {
    isSolving = true;
    solveProgress = 'Compiling puzzle...';
    solverResult = null;

    try {
      solver.configure(
        puzzleConfig.grid,
        puzzleConfig.variables,
        puzzleConfig.variableConfig
      );

      solveProgress = 'Adding clues...';
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = settingData[r][c];
          if (cell.value !== null && hasNumbers) {
            solver.addClue(r, c, puzzleConfig.variables.find(v => v.startsWith('numbers')), cell.value);
          }
          if (cell.shaded === true && hasShading) {
            solver.addClue(r, c, 'shading', true);
          } else if (cell.shaded === false && hasShading) {
            solver.addClue(r, c, 'shading', false);
          }
        }
      }

      // Add global rules
      solveProgress = 'Adding rules...';
      for (const rule of globalRules) {
        solver.addGlobalRule(rule);
      }

      // Add constraint instances
      solveProgress = 'Adding constraint instances...';
      for (const instance of constraintInstances) {
        solver.addConstraintInstance(instance.rule, instance.groups);
      }

      solveProgress = 'Solving...';
      const result = await solver.solve({ numSolutions: 1 });

      solverResult = result;
      compiledCode = result.modelCode || solver.getCompiledModel();
      isSolving = false;
      solveProgress = null;

      if (result.status === 'SATISFIED' || result.status === 'ALL_SOLUTIONS') {
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
    if (!result.solutions || result.solutions.length === 0) return;

    const solution = result.solutions[0];
    console.log('Parsing solution:', solution);

    if (solution.output) {
      const outputText = typeof solution.output === 'string'
        ? solution.output
        : solution.output.default || '';

      console.log('Solution output:', outputText);

      // Parse numbers grid
      if (hasNumbers && outputText.includes('numbers:')) {
        const numbersMatch = outputText.match(/numbers:\s*([\s\S]*?)(?=\n\n|shading:|$)/);
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
        }
      }

      // Parse shading
      if (hasShading && outputText.includes('shading:')) {
        console.log('Parsing shading...');
        const shadingMatch = outputText.match(/shading:\s*([\s\S]*?)$/);
        if (shadingMatch) {
          const gridText = shadingMatch[1].trim();
          console.log('Shading grid text:', gridText);

          const lines = gridText.split('\n').map(line =>
            line.trim().replace(/[|\[\]]/g, '').split(/\s*,\s*|\s+/).filter(x => x)
          );

          console.log('Parsed shading lines:', lines);

          for (let r = 0; r < Math.min(rows, lines.length); r++) {
            for (let c = 0; c < Math.min(cols, lines[r].length); c++) {
              const val = lines[r][c].toLowerCase();
              console.log(`Setting shading[${r}][${c}] = ${val}`);
              if (val === 'true') {
                solvingData[r][c].shaded = true;
              } else if (val === 'false') {
                solvingData[r][c].shaded = false;
              }
            }
          }
        }
      }

      // Force reactivity
      solvingData = solvingData;
      draw();
    }
  }

  function cancelSolve() {
    isSolving = false;
    solveProgress = null;
  }

  // Constraint management functions
  function handleUpdateGlobalRules(event) {
    const ruleIds = event.detail;
    const allGlobalRules = getGlobalRules();
    globalRules = allGlobalRules.filter(rule => ruleIds.includes(rule.id));
  }

  function handleAddInstance(event) {
    const { rule } = event.detail;
    const instance = {
      id: instanceIdCounter++,
      rule: rule,
      groups: [
        {
          cells: [],
          value: rule.requiresValue ? null : undefined
        }
      ]
    };
    constraintInstances = [...constraintInstances, instance];
    selectedInstance = instance;
    selectedGroup = instance.groups[0];
    editMode = 'select-cells'; // Enter cell selection mode
  }

  function handleSelectInstance(event) {
    selectedInstance = event.detail.instance;
    selectedGroup = event.detail.group;
    editMode = 'select-cells';
  }

  function handleSelectGroup(event) {
    selectedInstance = event.detail.instance;
    selectedGroup = event.detail.group;
    editMode = 'select-cells';
  }

  function handleAddGroup(event) {
    const { instance } = event.detail;
    const newGroup = {
      cells: [],
      value: instance.rule.requiresValue ? null : undefined
    };
    instance.groups = [...instance.groups, newGroup];
    constraintInstances = constraintInstances; // Trigger reactivity
    selectedGroup = newGroup;
    editMode = 'select-cells';
  }

  function handleDeleteInstance(event) {
    const { instance } = event.detail;
    constraintInstances = constraintInstances.filter(i => i !== instance);
    if (selectedInstance === instance) {
      selectedInstance = null;
      selectedGroup = null;
      editMode = hasNumbers ? 'numbers' : hasShading ? 'shading' : 'numbers';
    }
  }

  function handleDeleteGroup(event) {
    const { instance, group } = event.detail;
    instance.groups = instance.groups.filter(g => g !== group);
    constraintInstances = constraintInstances; // Trigger reactivity
    if (selectedGroup === group) {
      selectedGroup = instance.groups[0] || null;
      if (!selectedGroup) {
        editMode = hasNumbers ? 'numbers' : hasShading ? 'shading' : 'numbers';
      }
    }
  }

  function handleDeleteGlobalRule(event) {
    const { ruleId } = event.detail;
    globalRules = globalRules.filter(rule => rule.id !== ruleId);
  }

  function handleUpdateGroup(event) {
    // Group value was updated - trigger reactivity
    constraintInstances = constraintInstances;
  }
</script>

<svelte:window on:keydown={handleKeyPress} />

<div class="puzzle-editor">
  <div class="toolbar">
    <div class="mode-toggle">
      <button
        class:active={mode === 'setting'}
        on:click={() => { mode = 'setting'; draw(); }}
        disabled={isSolving}
      >
        Setting Mode
      </button>
      <button
        class:active={mode === 'solving'}
        on:click={() => { mode = 'solving'; draw(); }}
        disabled={isSolving}
      >
        Solving Mode
      </button>
    </div>

    <div class="edit-mode-toggle">
      {#if editMode === 'select-cells'}
        <span style="color: #2196F3; font-weight: bold;">
          Selecting cells for: {selectedInstance?.rule.name || 'constraint'}
        </span>
        <button
          class="exit-select-btn"
          on:click={exitSelectCellsMode}
          disabled={isSolving}
        >
          Exit Selection Mode (Esc)
        </button>
      {:else if puzzleConfig.variables.length > 1}
        <span>Edit:</span>
        {#if hasNumbers}
          <button
            class:active={editMode === 'numbers'}
            on:click={() => editMode = 'numbers'}
            disabled={isSolving}
          >
            Numbers
          </button>
        {/if}
        {#if hasShading}
          <button
            class:active={editMode === 'shading'}
            on:click={() => editMode = 'shading'}
            disabled={isSolving}
          >
            Shading
          </button>
        {/if}
        {#if hasLinesCenter}
          <button
            class:active={editMode === 'lines-center'}
            on:click={() => editMode = 'lines-center'}
            disabled={isSolving}
          >
            Lines (Center)
          </button>
        {/if}
        {#if hasLinesEdge}
          <button
            class:active={editMode === 'lines-edge'}
            on:click={() => editMode = 'lines-edge'}
            disabled={isSolving}
          >
            Lines (Edge)
          </button>
        {/if}
      {/if}
    </div>

    <div class="actions">
      <button on:click={clearSolvingData} disabled={isSolving}>
        Clear Solving Data
      </button>

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
    <div class="canvas-container">
      <canvas
        bind:this={canvas}
        on:click={handleCanvasClick}
      ></canvas>
    </div>

    <ConstraintSidebar
      {globalRules}
      {constraintInstances}
      {selectedInstance}
      {selectedGroup}
      on:openRuleSelector={() => showRuleSelector = true}
      on:selectInstance={handleSelectInstance}
      on:selectGroup={handleSelectGroup}
      on:addGroup={handleAddGroup}
      on:deleteInstance={handleDeleteInstance}
      on:deleteGroup={handleDeleteGroup}
      on:deleteGlobalRule={handleDeleteGlobalRule}
      on:updateGroup={handleUpdateGroup}
    />

    <div class="side-panel">
      <div class="info-panel">
        <h3>Grid: {rows} × {cols}</h3>
        <p>Mode: <strong class:solving-text={mode === 'solving'}>{mode}</strong></p>
        <p>Editing: <strong>{editMode}</strong></p>
        <p>Variables: {puzzleConfig.variables.join(', ')}</p>

        <div class="instructions">
          <h4>Controls:</h4>
          <ul>
            {#if editMode === 'numbers'}
              <li><strong>1-9:</strong> Enter number</li>
              <li><strong>Shift+1-9:</strong> Pencil mark</li>
              <li><strong>Backspace/Delete:</strong> Clear cell</li>
            {:else if editMode === 'shading'}
              <li><strong>S/Space:</strong> Cycle shading (unknown → black → green → unknown)</li>
              <li><strong>Dark gray:</strong> Given shaded</li>
              <li><strong>Light gray:</strong> Solving shaded</li>
              <li><strong>Dark green:</strong> Given not-shaded</li>
              <li><strong>Light green:</strong> Solving not-shaded</li>
            {/if}
            <li><strong>Arrows:</strong> Navigate</li>
            <li><strong>Click:</strong> Select cell</li>
          </ul>
        </div>

        <div class="legend">
          <h4>Legend:</h4>
          <ul>
            <li><strong>Black numbers:</strong> Given clues (always visible)</li>
            <li><strong>Blue numbers:</strong> Your solving work (always visible)</li>
            {#if mode === 'setting'}
              <li><em>In setting mode: can edit/delete everything</em></li>
            {:else}
              <li><em>In solving mode: can only edit blue entries</em></li>
            {/if}
          </ul>
        </div>
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
            <p>Solution found! Switch to Solving mode to see it.</p>
          {:else if solverResult.status === 'UNSATISFIABLE'}
            <p>No solution exists for this puzzle</p>
          {:else if solverResult.status === 'ERROR'}
            <p>Error: {solverResult.error}</p>
          {/if}
          {#if solverResult.time}
            <p>Time: {solverResult.time.toFixed(2)}s</p>
          {/if}

          <button class="show-code-btn" on:click={() => showMiniZincCode = !showMiniZincCode}>
            {showMiniZincCode ? 'Hide' : 'Show'} MiniZinc Code
          </button>

          {#if showMiniZincCode && compiledCode}
            <details open>
              <summary>Generated MiniZinc Model</summary>
              <pre class="minizinc-code">{compiledCode}</pre>
            </details>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <div class="bottom-toolbar">
    <button on:click={() => dispatch('back')}>Back to Variables</button>
  </div>
</div>

{#if showRuleSelector}
  <RuleSelector
    variables={puzzleConfig.variables}
    initialGlobalRules={globalRules.map(r => r.id)}
    on:updateGlobalRules={handleUpdateGlobalRules}
    on:addInstance={handleAddInstance}
    on:close={() => showRuleSelector = false}
  />
{/if}

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

  .mode-toggle, .edit-mode-toggle {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .edit-mode-toggle span {
    font-weight: bold;
    margin-right: 0.5rem;
  }

  .mode-toggle button, .edit-mode-toggle button {
    padding: 0.5rem 1rem;
    background: #e0e0e0;
    color: #333;
  }

  .mode-toggle button.active, .edit-mode-toggle button.active {
    background: #4CAF50;
    color: white;
  }

  .exit-select-btn {
    background: #FF9800 !important;
    color: white !important;
  }

  .exit-select-btn:hover {
    background: #F57C00 !important;
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

  .canvas-container {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  canvas {
    cursor: pointer;
    display: block;
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

  .legend {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #ddd;
  }

  .legend h4 {
    margin: 0 0 0.75rem 0;
    font-size: 0.9rem;
    color: #666;
  }

  .legend ul {
    margin: 0;
    padding-left: 1.5rem;
    font-size: 0.85rem;
    color: #666;
  }

  .legend li {
    margin: 0.25rem 0;
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

  .show-code-btn {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background: #673AB7;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .show-code-btn:hover {
    background: #5E35B1;
  }

  .minizinc-code {
    margin-top: 0.5rem;
    padding: 1rem;
    background: #1e1e1e;
    color: #d4d4d4;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 0.75rem;
    line-height: 1.4;
    max-height: 400px;
    overflow-y: auto;
  }

  details {
    margin-top: 1rem;
  }

  details summary {
    cursor: pointer;
    font-weight: bold;
    padding: 0.5rem;
    background: #f5f5f5;
    border-radius: 4px;
    margin-bottom: 0.5rem;
  }

  .bottom-toolbar {
    padding-top: 1rem;
    border-top: 2px solid #ddd;
  }
</style>
