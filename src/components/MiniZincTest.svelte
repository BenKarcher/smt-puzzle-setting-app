<script>
  import { PuzzleSolver } from '../core/solver.js';

  let status = 'idle';
  let result = null;
  let error = null;

  async function testSimpleSolve() {
    status = 'solving';
    error = null;
    result = null;

    try {
      const solver = new PuzzleSolver();

      // Configure a simple 3x3 grid with numbers
      solver.configure(
        { type: 'rectangular', rows: 3, cols: 3 },
        ['numbers-all'],
        { 'numbers-all': { min: 1, max: 3 } }
      );

      // Add a simple constraint: all numbers in a row must be different
      solver.addGlobalRule({
        name: 'All different in rows',
        constraint: `constraint forall(r in ROWS) (
          alldifferent([numbers[r, c] | c in COLS])
        );`
      });

      // Add a clue
      solver.addClue(0, 0, 'numbers-all', 1);

      console.log('Testing MiniZinc integration...');
      const solveResult = await solver.solve({ numSolutions: 1 });

      result = solveResult;
      status = solveResult.status === 'SATISFIED' ? 'success' : 'no-solution';
    } catch (e) {
      error = e.message;
      status = 'error';
      console.error('Test failed:', e);
    }
  }
</script>

<div class="test-panel">
  <h2>MiniZinc Integration Test</h2>

  <p>This test creates a simple 3x3 Latin square puzzle with one clue.</p>

  <button on:click={testSimpleSolve} disabled={status === 'solving'}>
    {status === 'solving' ? 'Solving...' : 'Run Test'}
  </button>

  {#if status === 'solving'}
    <div class="status solving">Solving puzzle with MiniZinc WASM...</div>
  {:else if status === 'success'}
    <div class="status success">
      ✓ MiniZinc integration working!
      <details>
        <summary>View result</summary>
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </details>
    </div>
  {:else if status === 'no-solution'}
    <div class="status warning">No solution found (check model)</div>
  {:else if status === 'error'}
    <div class="status error">
      Error: {error}
    </div>
  {/if}

  {#if result && result.modelCode}
    <details>
      <summary>View generated MiniZinc model</summary>
      <pre class="code">{result.modelCode}</pre>
    </details>
  {/if}
</div>

<style>
  .test-panel {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    max-width: 600px;
  }

  h2 {
    margin-top: 0;
  }

  button {
    margin: 1rem 0;
  }

  .status {
    padding: 1rem;
    border-radius: 4px;
    margin: 1rem 0;
  }

  .status.solving {
    background: #e3f2fd;
    color: #1976d2;
  }

  .status.success {
    background: #e8f5e9;
    color: #388e3c;
  }

  .status.warning {
    background: #fff3e0;
    color: #f57c00;
  }

  .status.error {
    background: #ffebee;
    color: #c62828;
  }

  details {
    margin-top: 1rem;
  }

  summary {
    cursor: pointer;
    font-weight: bold;
    padding: 0.5rem;
    background: #f5f5f5;
    border-radius: 4px;
  }

  pre {
    background: #f5f5f5;
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 0.85rem;
  }

  pre.code {
    background: #1e1e1e;
    color: #d4d4d4;
  }
</style>
