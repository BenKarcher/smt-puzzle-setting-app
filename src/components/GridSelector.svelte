<script>
  import { getAllPresets, createCustomGrid } from '../lib/grid-presets.js';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  const presets = getAllPresets();

  let selectionMode = 'preset'; // 'preset' | 'custom'
  let selectedPreset = 'sudoku';
  let customRows = 9;
  let customCols = 9;

  function selectGrid() {
    if (selectionMode === 'preset') {
      const preset = presets.find(p => p.id === selectedPreset);
      dispatch('gridSelected', {
        type: 'preset',
        preset: selectedPreset,
        config: preset
      });
    } else {
      dispatch('gridSelected', {
        type: 'custom',
        config: createCustomGrid(customRows, customCols)
      });
    }
  }
</script>

<div class="grid-selector">
  <h2>Step 1: Choose Grid Geometry</h2>

  <div class="mode-selector">
    <label class:active={selectionMode === 'preset'}>
      <input type="radio" bind:group={selectionMode} value="preset" />
      Preset Grid
    </label>
    <label class:active={selectionMode === 'custom'}>
      <input type="radio" bind:group={selectionMode} value="custom" />
      Custom Rectangular Grid
    </label>
  </div>

  {#if selectionMode === 'preset'}
    <div class="preset-grid">
      {#each presets as preset}
        <label class="preset-card" class:selected={selectedPreset === preset.id}>
          <input type="radio" bind:group={selectedPreset} value={preset.id} />
          <div class="preset-content">
            <h3>{preset.name}</h3>
            <p class="description">{preset.description}</p>
            <p class="dimensions">{preset.rows} × {preset.cols}</p>
          </div>
        </label>
      {/each}
    </div>
  {:else}
    <div class="custom-config">
      <label>
        Rows:
        <input type="number" bind:value={customRows} min="2" max="20" />
      </label>
      <label>
        Columns:
        <input type="number" bind:value={customCols} min="2" max="20" />
      </label>
      <div class="preview">
        Grid size: {customRows} × {customCols} = {customRows * customCols} cells
      </div>
    </div>
  {/if}

  <div class="actions">
    <button class="primary" on:click={selectGrid}>
      Next: Configure Solution Space
    </button>
  </div>
</div>

<style>
  .grid-selector {
    max-width: 800px;
  }

  h2 {
    margin-top: 0;
    color: #333;
  }

  .mode-selector {
    display: flex;
    gap: 1rem;
    margin: 1.5rem 0;
  }

  .mode-selector label {
    flex: 1;
    padding: 1rem;
    border: 2px solid #ddd;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .mode-selector label.active {
    border-color: #4CAF50;
    background: #f1f8f4;
  }

  .mode-selector input[type="radio"] {
    cursor: pointer;
  }

  .preset-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    margin: 1.5rem 0;
  }

  .preset-card {
    padding: 1rem;
    border: 2px solid #ddd;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }

  .preset-card:hover {
    border-color: #999;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .preset-card.selected {
    border-color: #4CAF50;
    background: #f1f8f4;
  }

  .preset-card input[type="radio"] {
    position: absolute;
    opacity: 0;
  }

  .preset-content h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
    color: #333;
  }

  .description {
    margin: 0.5rem 0;
    font-size: 0.9rem;
    color: #666;
    line-height: 1.4;
  }

  .dimensions {
    margin: 0.5rem 0 0 0;
    font-weight: bold;
    color: #4CAF50;
  }

  .custom-config {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    margin: 1.5rem 0;
  }

  .custom-config label {
    display: block;
    margin-bottom: 1rem;
    font-weight: bold;
  }

  .custom-config input[type="number"] {
    display: block;
    width: 100%;
    max-width: 200px;
    padding: 0.5rem;
    font-size: 1rem;
    border: 2px solid #ddd;
    border-radius: 4px;
    margin-top: 0.25rem;
  }

  .preview {
    margin-top: 1.5rem;
    padding: 1rem;
    background: #f1f8f4;
    border-radius: 4px;
    color: #333;
  }

  .actions {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 2px solid #ddd;
  }

  button.primary {
    padding: 0.75rem 1.5rem;
    font-size: 1.1rem;
  }
</style>
