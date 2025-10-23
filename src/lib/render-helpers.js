/**
 * Render Helper Functions
 *
 * Utility functions for rendering constraints on the puzzle grid canvas.
 * These helpers are passed to each constraint's render function.
 */

/**
 * Get coordinates for a cell
 * @param {number} row - Row index (0-based)
 * @param {number} col - Column index (0-based)
 * @param {number} cellSize - Size of each cell in pixels
 * @returns {object} Coordinates: {x_min, x, x_max, y_min, y, y_max}
 */
export function get_coords(row, col, cellSize) {
  const x_min = col * cellSize;
  const x_max = (col + 1) * cellSize;
  const x = x_min + cellSize / 2;

  const y_min = row * cellSize;
  const y_max = (row + 1) * cellSize;
  const y = y_min + cellSize / 2;

  return { x_min, x, x_max, y_min, y, y_max };
}

/**
 * Draw a line between the centers of two cells
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} cell1 - First cell [row, col]
 * @param {Array} cell2 - Second cell [row, col]
 * @param {number} width - Line width
 * @param {string} color - Line color
 * @param {number} cellSize - Size of each cell in pixels
 */
export function draw_line(ctx, cell1, cell2, width, color, cellSize) {
  const coords1 = get_coords(cell1[0], cell1[1], cellSize);
  const coords2 = get_coords(cell2[0], cell2[1], cellSize);

  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(coords1.x, coords1.y);
  ctx.lineTo(coords2.x, coords2.y);
  ctx.stroke();
}

/**
 * Draw a cage around specified cells (dashed border on perimeter)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} cells - Array of cells [row, col] that form the cage
 * @param {number} cellSize - Size of each cell in pixels
 * @param {object} options - Drawing options: {color, lineWidth, dash}
 */
export function draw_cage(ctx, cells, cellSize, options = {}) {
  const {
    color = '#666',
    lineWidth = 2,
    dash = [5, 3]
  } = options;

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash(dash);

  // Find all perimeter edges
  cells.forEach(([r, c]) => {
    const coords = get_coords(r, c, cellSize);

    // Check each edge to see if it's on the perimeter
    const hasTop = !cells.some(([r2, c2]) => r2 === r - 1 && c2 === c);
    const hasBottom = !cells.some(([r2, c2]) => r2 === r + 1 && c2 === c);
    const hasLeft = !cells.some(([r2, c2]) => r2 === r && c2 === c - 1);
    const hasRight = !cells.some(([r2, c2]) => r2 === r && c2 === c + 1);
    const offset = cellSize * 0.08; // Slight offset to avoid overlapping grid lines
    if (hasTop) {
      ctx.beginPath();
      ctx.moveTo(coords.x_min, coords.y_min + offset);
      ctx.lineTo(coords.x_max, coords.y_min + offset);
      ctx.stroke();
    }
    if (hasBottom) {
      ctx.beginPath();
      ctx.moveTo(coords.x_min, coords.y_max - offset);
      ctx.lineTo(coords.x_max, coords.y_max - offset);
      ctx.stroke();
    }
    if (hasLeft) {
      ctx.beginPath();
      ctx.moveTo(coords.x_min + offset, coords.y_min);
      ctx.lineTo(coords.x_min + offset, coords.y_max);
      ctx.stroke();
    }
    if (hasRight) {
      ctx.beginPath();
      ctx.moveTo(coords.x_max - offset, coords.y_min);
      ctx.lineTo(coords.x_max - offset, coords.y_max);
      ctx.stroke();
    }
  });

  ctx.setLineDash([]); // Reset dash
}

/**
 * Draw a pill shape through cells (thick line with outline and rounded ends)
 * Useful for thermometer constraints, renban lines, etc.
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} cells - Array of cells [row, col] in order
 * @param {number} cellSize - Size of each cell in pixels
 * @param {object} options - Drawing options: {fillColor, outlineColor}
 */
export function draw_pill(ctx, cells, cellSize, options = {}) {
  const {
    fillColor = '#999',
    outlineColor = '#fff'
  } = options;

  if (cells.length === 0) return;

  const outerThickness = cellSize * 0.9;
  const innerThickness = cellSize * 0.85;

  // Draw outer (fill) pill
  ctx.strokeStyle = fillColor;
  ctx.lineWidth = outerThickness;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  cells.forEach(([r, c], i) => {
    const coords = get_coords(r, c, cellSize);
    if (i === 0) {
      ctx.moveTo(coords.x, coords.y);
    } else {
      ctx.lineTo(coords.x, coords.y);
    }
  });
  ctx.stroke();

  // Draw inner (outline) pill
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = innerThickness;

  ctx.beginPath();
  cells.forEach(([r, c], i) => {
    const coords = get_coords(r, c, cellSize);
    if (i === 0) {
      ctx.moveTo(coords.x, coords.y);
    } else {
      ctx.lineTo(coords.x, coords.y);
    }
  });
  ctx.stroke();
}

/**
 * Redraw the edge between two adjacent cells
 * Useful when a constraint needs to be rendered behind grid lines
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} cell1 - First cell [row, col]
 * @param {Array} cell2 - Second cell [row, col]
 * @param {number} cellSize - Size of each cell in pixels
 * @param {object} options - Drawing options: {color, lineWidth}
 */
export function redraw_edge(ctx, cell1, cell2, cellSize, options = {}) {
  const {
    color = '#000',
    lineWidth = 1
  } = options;

  const [r1, c1] = cell1;
  const [r2, c2] = cell2;

  // Determine which edge to redraw
  const coords1 = get_coords(r1, c1, cellSize);

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash([]);

  ctx.beginPath();

  // Vertical edge (same column)
  if (c1 === c2) {
    if (r2 === r1 + 1) {
      // Bottom edge of cell1 / top edge of cell2
      ctx.moveTo(coords1.x_min, coords1.y_max);
      ctx.lineTo(coords1.x_max, coords1.y_max);
    } else if (r2 === r1 - 1) {
      // Top edge of cell1 / bottom edge of cell2
      ctx.moveTo(coords1.x_min, coords1.y_min);
      ctx.lineTo(coords1.x_max, coords1.y_min);
    }
  }
  // Horizontal edge (same row)
  else if (r1 === r2) {
    if (c2 === c1 + 1) {
      // Right edge of cell1 / left edge of cell2
      ctx.moveTo(coords1.x_max, coords1.y_min);
      ctx.lineTo(coords1.x_max, coords1.y_max);
    } else if (c2 === c1 - 1) {
      // Left edge of cell1 / right edge of cell2
      ctx.moveTo(coords1.x_min, coords1.y_min);
      ctx.lineTo(coords1.x_min, coords1.y_max);
    }
  }

  ctx.stroke();
}

/**
 * Create a helpers object to pass to render functions
 * @param {number} cellSize - Size of each cell in pixels
 * @param {object} gridInfo - Grid information {rows, cols, regions}
 * @returns {object} Helper functions with cellSize and gridInfo bound
 */
export function createRenderHelpers(cellSize, gridInfo) {
  return {
    cellSize,
    gridInfo,

    // Legacy helpers (kept for backward compatibility)
    getCellCenter: (r, c) => {
      const coords = get_coords(r, c, cellSize);
      return { x: coords.x, y: coords.y };
    },
    getCellCorner: (r, c) => {
      const coords = get_coords(r, c, cellSize);
      return { x: coords.x_min, y: coords.y_min };
    },

    // New helpers
    get_coords: (r, c) => get_coords(r, c, cellSize),
    draw_line: (ctx, cell1, cell2, width, color) =>
      draw_line(ctx, cell1, cell2, width, color, cellSize),
    draw_cage: (ctx, cells, options) =>
      draw_cage(ctx, cells, cellSize, options),
    draw_pill: (ctx, cells, options) =>
      draw_pill(ctx, cells, cellSize, options),
    redraw_edge: (ctx, cell1, cell2, options) =>
      redraw_edge(ctx, cell1, cell2, cellSize, options)
  };
}
