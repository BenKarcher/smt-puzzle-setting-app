<script>
  import { createEventDispatcher } from 'svelte';
  import { getGlobalRules, getInstantiableRules, getCompatibleRules } from '../lib/rule-loader-v2.js';

  export let variables;
  export let initialGlobalRules = [];

  const dispatch = createEventDispatcher();

  let selectedGlobalRules = [...initialGlobalRules];

  const allGlobalRules = getGlobalRules();
  const allInstantiableRules = getInstantiableRules();

  // Filter rules by compatible variables
  $: compatibleGlobalRules = getCompatibleRules(variables).filter(r => r.type === 'global');
  $: compatibleInstantiableRules = getCompatibleRules(variables).filter(r => r.type === 'instantiable');

  function toggleGlobalRule(ruleId) {
    if (selectedGlobalRules.includes(ruleId)) {
      selectedGlobalRules = selectedGlobalRules.filter(id => id !== ruleId);
    } else {
      selectedGlobalRules = [...selectedGlobalRules, ruleId];
    }
    dispatch('updateGlobalRules', selectedGlobalRules);
  }

  function addInstance(rule) {
    dispatch('addInstance', { rule });
    dispatch('close');
  }

  function close() {
    dispatch('close');
  }
</script>

<div class="modal-backdrop" on:click={close}>
  <div class="modal" on:click|stopPropagation>
    <div class="modal-header">
      <h2>Add Rules & Constraints</h2>
      <button class="close-btn" on:click={close}>×</button>
    </div>

    <div class="modal-content">
      <!-- Global Rules Section -->
      <section>
        <h3>Global Rules</h3>
        <p class="section-desc">These rules apply to the entire grid</p>

        <div class="rule-list">
          {#each compatibleGlobalRules as rule}
            <label class="rule-item">
              <input
                type="checkbox"
                checked={selectedGlobalRules.includes(rule.id)}
                on:change={() => toggleGlobalRule(rule.id)}
              />
              <div class="rule-info">
                <strong>{rule.name}</strong>
                <p>{rule.description}</p>
              </div>
            </label>
          {/each}

          {#if compatibleGlobalRules.length === 0}
            <p class="empty">No compatible global rules for selected variables</p>
          {/if}
        </div>
      </section>

      <!-- Instantiable Rules Section -->
      <section>
        <h3>Local Constraints</h3>
        <p class="section-desc">Click to add an instance of a constraint</p>

        <div class="rule-grid">
          {#each compatibleInstantiableRules as rule}
            <button class="constraint-card" on:click={() => addInstance(rule)}>
              <strong>{rule.name}</strong>
              <p>{rule.description}</p>
              <span class="add-icon">+ Add Instance</span>
            </button>
          {/each}

          {#if compatibleInstantiableRules.length === 0}
            <p class="empty">No compatible local constraints for selected variables</p>
          {/if}
        </div>
      </section>
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background: white;
    border-radius: 8px;
    max-width: 800px;
    max-height: 80vh;
    width: 90%;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #ddd;
  }

  .modal-header h2 {
    margin: 0;
    color: #333;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 2rem;
    color: #666;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    line-height: 1;
  }

  .close-btn:hover {
    color: #333;
  }

  .modal-content {
    padding: 1.5rem;
    overflow-y: auto;
  }

  section {
    margin-bottom: 2rem;
  }

  section:last-child {
    margin-bottom: 0;
  }

  h3 {
    margin: 0 0 0.5rem 0;
    color: #333;
  }

  .section-desc {
    margin: 0 0 1rem 0;
    color: #666;
    font-size: 0.9rem;
  }

  .rule-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .rule-item {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    border: 2px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .rule-item:hover {
    border-color: #4CAF50;
    background: #f9f9f9;
  }

  .rule-item input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }

  .rule-info {
    flex: 1;
  }

  .rule-info strong {
    display: block;
    margin-bottom: 0.25rem;
    color: #333;
  }

  .rule-info p {
    margin: 0;
    color: #666;
    font-size: 0.9rem;
  }

  .rule-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .constraint-card {
    padding: 1rem;
    border: 2px solid #ddd;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .constraint-card:hover {
    border-color: #2196F3;
    background: #f0f8ff;
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(33, 150, 243, 0.2);
  }

  .constraint-card strong {
    color: #333;
  }

  .constraint-card p {
    margin: 0;
    color: #666;
    font-size: 0.85rem;
    flex: 1;
  }

  .add-icon {
    color: #2196F3;
    font-weight: bold;
    font-size: 0.9rem;
  }

  .empty {
    color: #999;
    font-style: italic;
    padding: 1rem;
    text-align: center;
  }
</style>
