<script>
  import { createEventDispatcher } from 'svelte';

  export let gridConfig;

  const dispatch = createEventDispatcher();

  // Available variable types
  const variableTypes = [
    {
      id: 'numbers-all',
      name: 'Numbers in all cells',
      description: 'Every cell contains a number from a specified range',
      icon: '🔢',
      configurable: true,
      configFields: [
        { key: 'min', label: 'Minimum', type: 'number', default: 1 },
        { key: 'max', label: 'Maximum', type: 'number', default: 9 }
      ]
    },
    {
      id: 'numbers-some',
      name: 'Numbers in some cells',
      description: 'Some cells contain numbers, others are empty (Coming soon)',
      icon: '1️⃣',
      configurable: true,
      disabled: true,
      configFields: [
        { key: 'min', label: 'Minimum', type: 'number', default: 1 },
        { key: 'max', label: 'Maximum', type: 'number', default: 9 }
      ]
    },
    {
      id: 'shading',
      name: 'Cell shading',
      description: 'Each cell is either shaded or unshaded',
      icon: '⬛',
      configurable: false
    },
    {
      id: 'lines-center',
      name: 'Lines through cell centers',
      description: 'Line segments pass through the center of cells (for loop puzzles) - Coming soon',
      icon: '➰',
      configurable: false,
      disabled: true
    },
    {
      id: 'lines-edge',
      name: 'Lines on cell edges',
      description: 'Lines drawn on the edges between cells - Coming soon',
      icon: '├─',
      configurable: false,
      disabled: true
    }
  ];

  // Selected variable types
  let selectedTypes = new Set(gridConfig.defaultVariables || []);
  let variableConfig = { ...gridConfig.defaultVariableConfig } || {};

  // Initialize config for selected types
  $: {
    selectedTypes.forEach(typeId => {
      if (!variableConfig[typeId]) {
        const varType = variableTypes.find(v => v.id === typeId);
        if (varType && varType.configurable) {
          variableConfig[typeId] = {};
          varType.configFields.forEach(field => {
            variableConfig[typeId][field.key] = field.default;
          });
        }
      }
    });
  }

  function toggleType(typeId) {
    if (selectedTypes.has(typeId)) {
      selectedTypes.delete(typeId);
      selectedTypes = selectedTypes;
    } else {
      // Mutually exclusive: numbers-all and numbers-some
      if (typeId === 'numbers-all' && selectedTypes.has('numbers-some')) {
        selectedTypes.delete('numbers-some');
      } else if (typeId === 'numbers-some' && selectedTypes.has('numbers-all')) {
        selectedTypes.delete('numbers-all');
      }

      selectedTypes.add(typeId);
      selectedTypes = selectedTypes;
    }
  }

  function proceed() {
    if (selectedTypes.size === 0) {
      alert('Please select at least one variable type');
      return;
    }

    dispatch('configured', {
      variables: Array.from(selectedTypes),
      variableConfig
    });
  }

  function goBack() {
    dispatch('back');
  }
</script>

<div class="solution-space-config">
  <h2>Step 2: Configure Solution Space</h2>

  <p class="info">
    Select what types of values can be placed in or around cells.
    You can mix and match multiple types for complex puzzle variants.
  </p>

  <div class="variable-types">
    {#each variableTypes as varType}
      <div class="variable-card" class:selected={selectedTypes.has(varType.id)} class:disabled={varType.disabled}>
        <label class="variable-header">
          <input
            type="checkbox"
            checked={selectedTypes.has(varType.id)}
            on:change={() => toggleType(varType.id)}
            disabled={varType.disabled}
          />
          <span class="icon">{varType.icon}</span>
          <div class="variable-info">
            <h3>{varType.name}</h3>
            <p>{varType.description}</p>
          </div>
        </label>

        {#if selectedTypes.has(varType.id) && varType.configurable}
          <div class="variable-config">
            <h4>Configuration:</h4>
            {#each varType.configFields as field}
              <label class="config-field">
                {field.label}:
                <input
                  type={field.type}
                  bind:value={variableConfig[varType.id][field.key]}
                  min={field.min}
                  max={field.max}
                />
              </label>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>

  {#if selectedTypes.size > 0}
    <div class="selection-summary">
      <h3>Selected:</h3>
      <ul>
        {#each Array.from(selectedTypes) as typeId}
          {@const varType = variableTypes.find(v => v.id === typeId)}
          <li>
            {varType.icon} {varType.name}
            {#if varType.configurable}
              ({JSON.stringify(variableConfig[typeId])})
            {/if}
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  <div class="actions">
    <button on:click={goBack}>Back</button>
    <button class="primary" on:click={proceed} disabled={selectedTypes.size === 0}>
      Next: Puzzle Editor
    </button>
  </div>
</div>

<style>
  .solution-space-config {
    max-width: 900px;
  }

  h2 {
    margin-top: 0;
    color: #333;
  }

  .info {
    background: #e3f2fd;
    padding: 1rem;
    border-radius: 8px;
    margin: 1rem 0;
    color: #1976d2;
  }

  .variable-types {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin: 1.5rem 0;
  }

  .variable-card {
    background: white;
    border: 2px solid #ddd;
    border-radius: 8px;
    padding: 1rem;
    transition: all 0.2s;
  }

  .variable-card.selected {
    border-color: #4CAF50;
    background: #f1f8f4;
  }

  .variable-card.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .variable-card.disabled .variable-header {
    cursor: not-allowed;
  }

  .variable-header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    cursor: pointer;
  }

  .variable-header input[type="checkbox"] {
    margin-top: 0.5rem;
    cursor: pointer;
    width: 20px;
    height: 20px;
  }

  .icon {
    font-size: 2rem;
    line-height: 1;
  }

  .variable-info {
    flex: 1;
  }

  .variable-info h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
    color: #333;
  }

  .variable-info p {
    margin: 0;
    color: #666;
    line-height: 1.4;
  }

  .variable-config {
    margin-top: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 4px;
    border: 1px solid #ddd;
  }

  .variable-config h4 {
    margin: 0 0 0.75rem 0;
    font-size: 0.9rem;
    color: #666;
  }

  .config-field {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  .config-field input {
    margin-left: 0.5rem;
    padding: 0.25rem 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    width: 100px;
  }

  .selection-summary {
    background: #f1f8f4;
    padding: 1rem;
    border-radius: 8px;
    margin: 1.5rem 0;
  }

  .selection-summary h3 {
    margin: 0 0 0.75rem 0;
    color: #333;
  }

  .selection-summary ul {
    margin: 0;
    padding-left: 1.5rem;
  }

  .selection-summary li {
    margin: 0.25rem 0;
    color: #333;
  }

  .actions {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 2px solid #ddd;
    display: flex;
    gap: 1rem;
  }

  button.primary {
    padding: 0.75rem 1.5rem;
    font-size: 1.1rem;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
