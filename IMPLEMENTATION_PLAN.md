# Advanced Features Implementation Plan

## Overview
This document outlines the plan for implementing regions, rule selection UI, and advanced constraint instance management.

## 1. Region System

### Data Structure
```javascript
// In PuzzleEditorCanvas.svelte
let regions = Array(rows).fill(null).map((_, r) =>
  Array(cols).fill(null).map((_, c) => regionId)
);
```

### UI Features
- **Region Edit Mode**: New edit mode that shows region IDs in cells
- **Thick Borders**: Draw thick lines between cells with different region IDs
- **Region ID Input**: Click cell to type new region ID (can be multi-digit)

### Canvas Drawing
```javascript
// In drawGrid(), add:
// Draw thick borders between different regions
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    // Check right neighbor
    if (c < cols - 1 && regions[r][c] !== regions[r][c+1]) {
      drawThickVerticalLine(c + 1, r);
    }
    // Check bottom neighbor
    if (r < rows - 1 && regions[r][c] !== regions[r+1][c]) {
      drawThickHorizontalLine(r + 1, c);
    }
  }
}
```

### MiniZinc Output
```minizinc
array[ROWS, COLS] of int: regions = [|
  1, 1, 1, 2, 2, 2, 3, 3, 3 |
  1, 1, 1, 2, 2, 2, 3, 3, 3 |
  ...
|];
```

## 2. Rule Selection UI

### Component Structure
```
RuleSelector.svelte
├── Global Rules (checkboxes)
│   ├── sudoku-standard
│   ├── latin-square
│   ├── no-adjacent-shading
│   └── even-shaded
└── Local Rules (add instance buttons)
    ├── white-dot → [Add Instance]
    ├── black-dot → [Add Instance]
    └── killer-cage → [Add Instance]
```

### State Management
```javascript
// In App.svelte or PuzzleEditorCanvas
let selectedGlobalRules = ['sudoku-standard']; // Array of rule IDs
let localRuleInstances = [
  {
    ruleId: 'killer-cage',
    instanceId: 'killer-cage-1',
    groups: [
      { cells: [[0,0], [0,1], [1,0]], value: 15 }
    ]
  }
];
```

## 3. Constraint Instance Management

### ConstraintInstance Component
```svelte
<ConstraintInstance
  rule={rule}
  instance={instance}
  on:updateGroups={(e) => updateInstance(instance.id, e.detail)}
  on:delete={() => deleteInstance(instance.id)}
/>
```

### Group/Tab Structure
```
Instance: Killer Cage #1
├── Tab: Group 1 [value: 15]
│   └── Cells: (1,1), (1,2), (2,1)
├── Tab: Group 2 [value: 8]
│   └── Cells: (3,3), (3,4)
└── [+ Add Group]
```

### Cell Selection Mode
When editing a group:
1. Click cells on canvas to toggle them in/out of group
2. Cells in current group highlighted with colored border
3. Text field for value (if rule requires it)

## 4. Template Substitution System

### Rule Definition Format
```json
{
  "id": "killer-cage",
  "constraintTemplate": "constraint sum([numbers[$rows1[i], $cols1[i]] | i in 1..length($rows1)]) = $value1;\nconstraint alldifferent([numbers[$rows1[i], $cols1[i]] | i in 1..length($rows1)]);",
  "requiresValue": true,
  "multiGroup": false
}
```

### Compiler Processing
```javascript
compileLocalRuleInstance(rule, instance) {
  let code = rule.constraintTemplate;

  instance.groups.forEach((group, idx) => {
    const groupNum = idx + 1;
    const rows = group.cells.map(c => c[0] + 1); // Convert to 1-based
    const cols = group.cells.map(c => c[1] + 1);

    code = code.replace(`$rows${groupNum}`, `[${rows.join(', ')}]`);
    code = code.replace(`$cols${groupNum}`, `[${cols.join(', ')}]`);
    if (group.value !== undefined) {
      code = code.replace(`$value${groupNum}`, group.value);
    }
  });

  return code;
}
```

### Example: Black Dot
```
Template:
constraint (numbers[$rows1[1],$cols1[1]] = $value1 * numbers[$rows1[2],$cols1[2]]) \\/
           ($value1 * numbers[$rows1[1],$cols1[1]] = numbers[$rows1[2],$cols1[2]]);

Instance with cells [[0,0], [0,1]], value: 2
Becomes:
constraint (numbers[1,1] = 2 * numbers[1,2]) \\/
           (2 * numbers[1,1] = numbers[1,2]);
```

## 5. Updated Rule Metadata Format

```json
{
  "id": "killer-cage",
  "name": "Killer Cage",
  "description": "Numbers in a cage sum to a target and are all different",
  "type": "local",
  "requiredVariables": ["numbers-all"],
  "categories": ["killer", "sum"],
  "constraintTemplate": "constraint sum([numbers[$rows1[i], $cols1[i]] | i in 1..length($rows1)]) = $value1;\nconstraint alldifferent([numbers[$rows1[i], $cols1[i]] | i in 1..length($rows1)]);",
  "requiresValue": true,
  "valueLabel": "Sum",
  "multiGroup": false,
  "groupMinCells": 2,
  "groupMaxCells": null,
  "visual": {
    "type": "region",
    "style": "dashed-border",
    "showLabel": true
  }
}
```

## 6. Implementation Phases

### Phase 1: Regions (Priority)
1. ✅ Add regions array
2. Add thick border drawing
3. Add region edit mode
4. Add region ID display/editing
5. Export regions to MiniZinc

### Phase 2: Rule Selector UI
1. Create RuleSelector component
2. Filter rules by compatible variables
3. Toggle global rules
4. Add instance buttons for local rules

### Phase 3: Instance Management
1. Create ConstraintInstanceList component
2. Create ConstraintInstance component with tabs
3. Add cell selection mode on canvas
4. Update instance state management

### Phase 4: Template Compiler
1. Update compiler.js to handle templates
2. Implement $rows/$cols/$value substitution
3. Support multi-group constraints
4. Add array indexing support

### Phase 5: Rule Updates
1. Convert existing local rules to template format
2. Add JS generator option for complex rules
3. Test all rule types

## File Structure
```
src/
├── components/
│   ├── PuzzleEditorCanvas.svelte (add regions mode)
│   ├── RuleSelector.svelte (NEW)
│   ├── ConstraintInstanceList.svelte (NEW)
│   └── ConstraintInstance.svelte (NEW)
├── core/
│   └── compiler.js (update for templates)
└── rules/
    ├── global/ (unchanged)
    └── local/ (update to template format)
```

## Next Steps
1. Complete region rendering with thick borders
2. Build RuleSelector component
3. Implement instance management UI
4. Update compiler for template substitution
