<script>
  import { createEventDispatcher } from 'svelte';

  export let globalRules = [];
  export let constraintInstances = [];
  export let selectedInstance = null;
  export let selectedGroup = null;

  const dispatch = createEventDispatcher();

  function selectInstance(instance) {
    selectedInstance = instance;
    selectedGroup = instance.groups[0] || null;
    dispatch('selectInstance', { instance, group: selectedGroup });
  }

  function selectGroup(instance, group) {
    selectedInstance = instance;
    selectedGroup = group;
    dispatch('selectGroup', { instance, group });
  }

  function addGroup(instance) {
    dispatch('addGroup', { instance });
  }

  function deleteInstance(instance) {
    dispatch('deleteInstance', { instance });
  }

  function deleteGroup(instance, group) {
    dispatch('deleteGroup', { instance, group });
  }

  function deleteGlobalRule(ruleId) {
    dispatch('deleteGlobalRule', { ruleId });
  }
</script>

<div class="sidebar">
  <div class="sidebar-header">
    <h3>Active Rules</h3>
    <button class="add-btn" on:click={() => dispatch('openRuleSelector')}>
      + Add Rule
    </button>
  </div>

  <div class="sidebar-content">
    <!-- Global Rules -->
    {#if globalRules.length > 0}
      <div class="section">
        <h4>Global Rules</h4>
        {#each globalRules as rule}
          <div class="rule-item">
            <span class="rule-name">{rule.name}</span>
            <button class="delete-btn" on:click={() => deleteGlobalRule(rule.id)}>×</button>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Constraint Instances -->
    {#if constraintInstances.length > 0}
      <div class="section">
        <h4>Local Constraints</h4>
        {#each constraintInstances as instance}
          <div class="instance-card" class:selected={selectedInstance === instance}>
            <div class="instance-header">
              <strong>{instance.rule.name} #{instance.id}</strong>
              <button class="delete-btn" on:click={() => deleteInstance(instance)}>×</button>
            </div>

            <!-- Groups/Tabs -->
            <div class="groups">
              {#if true}
                {@const minGroups = instance.rule.minGroups || 1}
                {@const maxGroups = instance.rule.maxGroups}
                {@const canAddGroup = !maxGroups || instance.groups.length < maxGroups}

                {#each instance.groups as group, idx}
                  <button
                    class="group-tab"
                    class:active={selectedInstance === instance && selectedGroup === group}
                    on:click={() => selectGroup(instance, group)}
                  >
                    Group {idx + 1}
                    {#if instance.rule.requiresValue && group.value !== undefined}
                      <span class="value">({group.value})</span>
                    {/if}
                    {#if instance.groups.length > minGroups}
                      <span class="delete-group" on:click|stopPropagation={() => deleteGroup(instance, group)}>×</span>
                    {/if}
                  </button>
                {/each}

                {#if canAddGroup}
                  <button class="add-group-btn" on:click={() => addGroup(instance)}>
                    + Add Group
                  </button>
                {/if}
              {/if}
            </div>

            <!-- Selected Group Info -->
            {#if selectedInstance === instance && selectedGroup}
              {@const groupIdx = instance.groups.indexOf(selectedGroup)}
              <div class="group-info">
                <div class="cell-list">
                  {selectedGroup.cells.length} cell{selectedGroup.cells.length !== 1 ? 's' : ''}
                  {#if selectedGroup.cells.length > 0}
                    <span class="cells-preview">
                      ({selectedGroup.cells.map(([r,c]) => `${r+1},${c+1}`).join(' ')})
                    </span>
                  {/if}
                </div>

                {#if instance.rule.requiresValue}
                  <input
                    type="number"
                    placeholder={instance.rule.valueLabel || 'Value'}
                    bind:value={selectedGroup.value}
                    on:change={() => dispatch('updateGroup', { instance, group: selectedGroup })}
                  />
                {/if}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}

    {#if globalRules.length === 0 && constraintInstances.length === 0}
      <div class="empty-state">
        <p>No rules added yet</p>
        <p class="hint">Click "+ Add Rule" to get started</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .sidebar {
    width: 300px;
    background: white;
    border-left: 1px solid #ddd;
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 200px);
  }

  .sidebar-header {
    padding: 1rem;
    border-bottom: 1px solid #ddd;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .sidebar-header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #333;
  }

  .add-btn {
    padding: 0.5rem 1rem;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .add-btn:hover {
    background: #45a049;
  }

  .sidebar-content {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }

  .section {
    margin-bottom: 1.5rem;
  }

  .section h4 {
    margin: 0 0 0.75rem 0;
    font-size: 0.9rem;
    color: #666;
    text-transform: uppercase;
  }

  .rule-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background: #f5f5f5;
    border-radius: 4px;
    margin-bottom: 0.5rem;
  }

  .rule-name {
    font-size: 0.9rem;
    color: #333;
  }

  .delete-btn {
    background: none;
    border: none;
    color: #f44336;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 20px;
    height: 20px;
    line-height: 1;
  }

  .delete-btn:hover {
    color: #d32f2f;
  }

  .instance-card {
    border: 2px solid #ddd;
    border-radius: 6px;
    padding: 0.75rem;
    margin-bottom: 0.75rem;
    transition: all 0.2s;
  }

  .instance-card.selected {
    border-color: #2196F3;
    background: #f0f8ff;
  }

  .instance-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .instance-header strong {
    color: #333;
    font-size: 0.95rem;
  }

  .groups {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .group-tab {
    padding: 0.4rem 0.75rem;
    background: #e0e0e0;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
    color: #333;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .group-tab.active {
    background: #2196F3;
    color: white;
  }

  .group-tab .value {
    font-size: 0.8rem;
    opacity: 0.8;
  }

  .delete-group {
    margin-left: 0.25rem;
    font-weight: bold;
  }

  .add-group-btn {
    padding: 0.4rem 0.75rem;
    background: white;
    border: 1px dashed #999;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
    color: #666;
  }

  .add-group-btn:hover {
    border-color: #2196F3;
    color: #2196F3;
  }

  .group-info {
    padding: 0.75rem;
    background: rgba(33, 150, 243, 0.05);
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .cell-list {
    font-size: 0.85rem;
    color: #333;
  }

  .cells-preview {
    font-size: 0.75rem;
    color: #666;
    display: block;
    margin-top: 0.25rem;
  }

  .group-info input {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.9rem;
  }

  .edit-btn {
    padding: 0.5rem;
    background: #2196F3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .edit-btn:hover {
    background: #1976D2;
  }

  .empty-state {
    text-align: center;
    padding: 2rem 1rem;
    color: #999;
  }

  .empty-state p {
    margin: 0.5rem 0;
  }

  .hint {
    font-size: 0.85rem;
    color: #bbb;
  }
</style>
