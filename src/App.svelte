<script>
  import MiniZincTest from './components/MiniZincTest.svelte';
  import GridSelector from './components/GridSelector.svelte';
  import SolutionSpaceConfig from './components/SolutionSpaceConfig.svelte';
  import PuzzleEditorCanvas from './components/PuzzleEditorCanvas.svelte';

  let currentStep = 'test'; // 'test' | 'grid' | 'variables' | 'editor'

  // Puzzle configuration state
  let puzzleConfig = {
    grid: null,
    variables: [],
    variableConfig: {},
    rules: [],
    clues: []
  };

  function handleGridSelected(event) {
    puzzleConfig.grid = event.detail.config;

    // Auto-select default rules from preset
    if (event.detail.config.defaultRules) {
      puzzleConfig.rules = event.detail.config.defaultRules;
    } else {
      puzzleConfig.rules = [];
    }

    currentStep = 'variables';
  }

  function handleVariablesConfigured(event) {
    puzzleConfig.variables = event.detail.variables;
    puzzleConfig.variableConfig = event.detail.variableConfig;

    // Auto-add even-shaded rule if both numbers and shading are present (for testing)
    const hasNumbers = puzzleConfig.variables.some(v => v.startsWith('numbers'));
    const hasShading = puzzleConfig.variables.includes('shading');

    if (hasNumbers && hasShading && !puzzleConfig.rules.includes('even-shaded')) {
      puzzleConfig.rules = [...puzzleConfig.rules, 'even-shaded'];
    }

    currentStep = 'editor';
  }

  function handleBack() {
    if (currentStep === 'variables') {
      currentStep = 'grid';
    } else if (currentStep === 'editor') {
      currentStep = 'variables';
    }
  }
</script>

<main>
  <h1>SMT Puzzle Setter</h1>

  <div class="progress-indicator">
    <div class="step" class:active={currentStep === 'test'}>Test</div>
    <div class="step" class:active={currentStep === 'grid'} class:completed={puzzleConfig.grid}>Grid</div>
    <div class="step" class:active={currentStep === 'variables'} class:completed={puzzleConfig.variables.length > 0}>Variables</div>
    <div class="step" class:active={currentStep === 'editor'}>Editor</div>
  </div>

  <div class="container">
    {#if currentStep === 'test'}
      <MiniZincTest />
      <button on:click={() => currentStep = 'grid'}>Continue to Grid Selection</button>
    {:else if currentStep === 'grid'}
      <GridSelector on:gridSelected={handleGridSelected} />
    {:else if currentStep === 'variables'}
      <SolutionSpaceConfig
        gridConfig={puzzleConfig.grid}
        on:configured={handleVariablesConfigured}
        on:back={handleBack}
      />
    {:else if currentStep === 'editor'}
      <PuzzleEditorCanvas
        puzzleConfig={puzzleConfig}
        on:back={handleBack}
      />
    {/if}
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  }

  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  h1 {
    color: #333;
    margin-bottom: 2rem;
  }

  .container {
    background: #f5f5f5;
    padding: 2rem;
    border-radius: 8px;
  }

  button {
    margin: 0.5rem;
    padding: 0.5rem 1rem;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }

  button:hover {
    background: #45a049;
  }

  .progress-indicator {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    padding: 1rem;
    background: white;
    border-radius: 8px;
  }

  .step {
    flex: 1;
    padding: 0.75rem;
    text-align: center;
    background: #e0e0e0;
    border-radius: 4px;
    font-weight: bold;
    color: #666;
    transition: all 0.3s;
  }

  .step.active {
    background: #4CAF50;
    color: white;
  }

  .step.completed {
    background: #81C784;
    color: white;
  }
</style>
