/**
 * Grid preset definitions for common puzzle types
 */

export const gridPresets = {
  'sudoku': {
    name: 'Sudoku (9x9)',
    description: 'Standard 9x9 Sudoku grid with 3x3 boxes',
    rows: 9,
    cols: 9,
    regions: generateSudokuBoxes(9, 9, 3, 3),
    defaultVariables: ['numbers-all'],
    defaultVariableConfig: {
      'numbers-all': { min: 1, max: 9 }
    },
    defaultRules: ['sudoku-standard']
  },

  'sudoku-6x6': {
    name: 'Sudoku (6x6)',
    description: '6x6 Sudoku grid with 2x3 boxes',
    rows: 6,
    cols: 6,
    regions: generateSudokuBoxes(6, 6, 2, 3),
    defaultVariables: ['numbers-all'],
    defaultVariableConfig: {
      'numbers-all': { min: 1, max: 6 }
    },
    defaultRules: ['sudoku-standard']
  },

  'sudoku-4x4': {
    name: 'Sudoku (4x4)',
    description: '4x4 Sudoku grid with 2x2 boxes',
    rows: 4,
    cols: 4,
    regions: generateSudokuBoxes(4, 4, 2, 2),
    defaultVariables: ['numbers-all'],
    defaultVariableConfig: {
      'numbers-all': { min: 1, max: 4 }
    },
    defaultRules: ['sudoku-standard']
  },

  'latin-square-6x6': {
    name: 'Latin Square (6x6)',
    description: '6x6 grid where each row and column contains unique numbers',
    rows: 6,
    cols: 6,
    regions: null,
    defaultVariables: ['numbers-all'],
    defaultVariableConfig: {
      'numbers-all': { min: 1, max: 6 }
    },
    defaultRules: ['latin-square']
  },

  'latin-square-9x9': {
    name: 'Latin Square (9x9)',
    description: '9x9 grid where each row and column contains unique numbers',
    rows: 9,
    cols: 9,
    regions: null,
    defaultVariables: ['numbers-all'],
    defaultVariableConfig: {
      'numbers-all': { min: 1, max: 9 }
    },
    defaultRules: ['latin-square']
  }
};

/**
 * Generate Sudoku box regions
 * @param {number} rows - Total rows
 * @param {number} cols - Total columns
 * @param {number} boxRows - Rows per box
 * @param {number} boxCols - Columns per box
 * @returns {Array} Array of regions, each containing cell coordinates
 */
function generateSudokuBoxes(rows, cols, boxRows, boxCols) {
  const regions = [];
  const numBoxRows = rows / boxRows;
  const numBoxCols = cols / boxCols;

  for (let br = 0; br < numBoxRows; br++) {
    for (let bc = 0; bc < numBoxCols; bc++) {
      const region = [];
      for (let r = 0; r < boxRows; r++) {
        for (let c = 0; c < boxCols; c++) {
          region.push([br * boxRows + r, bc * boxCols + c]);
        }
      }
      regions.push(region);
    }
  }

  return regions;
}

/**
 * Get preset by ID
 */
export function getPreset(presetId) {
  return gridPresets[presetId] || null;
}

/**
 * Get list of all presets
 */
export function getAllPresets() {
  return Object.keys(gridPresets).map(id => ({
    id,
    ...gridPresets[id]
  }));
}

/**
 * Create custom rectangular grid configuration
 */
export function createCustomGrid(rows, cols) {
  return {
    type: 'rectangular',
    rows,
    cols,
    regions: null,
    defaultVariables: [],
    defaultVariableConfig: {},
    defaultRules: []
  };
}

export default gridPresets;
