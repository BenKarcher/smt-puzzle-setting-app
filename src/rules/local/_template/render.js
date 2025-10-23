/**
 * OPTIONAL FILE: Delete this file if your rule doesn't need custom rendering
 *
 * This file contains the visual rendering logic for your constraint on the canvas.
 * If your rule is global or doesn't need special visual indicators, delete this file.
 *
 * Rendering order: shading/backgrounds → grid outline → constraints → numbers
 * Your constraint is rendered BEFORE numbers, so numbers will appear on top.
 *
 * @param {Array} groups - Array of groups: [{cells: [[r,c], ...], value: x}, ...]
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D context for drawing
 * @param {Object} helpers - Helper functions and grid info:
 *   - helpers.cellSize: Size of each cell in pixels
 *   - helpers.gridInfo: {rows, cols, regions} - Grid dimensions and region data
 *
 *   Legacy helpers (kept for backward compatibility):
 *   - helpers.getCellCenter(r, c): Get {x, y} of cell center
 *   - helpers.getCellCorner(r, c): Get {x, y} of cell top-left corner
 *
 *   New coordinate helper:
 *   - helpers.get_coords(r, c): Get {x_min, x, x_max, y_min, y, y_max}
 *
 *   Drawing helpers:
 *   - helpers.draw_line(ctx, cell1, cell2, width, color): Draw line between cells
 *   - helpers.draw_cage(ctx, cells, options): Draw dashed cage border
 *   - helpers.draw_pill(ctx, cells, options): Draw pill/thermometer shape
 *   - helpers.redraw_edge(ctx, cell1, cell2, options): Redraw grid edge
 */
export default function render(groups, ctx, helpers) {
  const {
    cellSize,
    gridInfo,
    get_coords,
    draw_line,
    draw_cage,
    draw_pill,
    redraw_edge,
    // Legacy helpers
    getCellCenter,
    getCellCorner
  } = helpers;

  // Example 1: Draw a cage around cells
  groups.forEach(group => {
    // Draw dashed border around all cells in the group
    draw_cage(ctx, group.cells, {
      color: '#666',
      lineWidth: 2,
      dash: [5, 3]
    });

    // Add a label in the top-left corner
    if (group.value !== undefined && group.cells.length > 0) {
      const [r, c] = group.cells[0];
      const coords = get_coords(r, c);

      ctx.fillStyle = '#666';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(group.value.toString(), coords.x_min + 3, coords.y_min + 3);
    }
  });

  // Example 2: Draw a line between two cells
  // groups.forEach(group => {
  //   if (group.cells.length === 2) {
  //     draw_line(ctx, group.cells[0], group.cells[1], 2, '#000');
  //   }
  // });

  // Example 3: Draw a pill/thermometer through cells
  // groups.forEach(group => {
  //   if (group.cells.length > 1) {
  //     draw_pill(ctx, group.cells, {
  //       fillColor: '#999',
  //       outlineColor: '#fff'
  //     });
  //   }
  // });

  // Example 4: Draw a circle between two adjacent cells
  // groups.forEach(group => {
  //   if (group.cells.length === 2) {
  //     const [r1, c1] = group.cells[0];
  //     const [r2, c2] = group.cells[1];
  //     const coords1 = get_coords(r1, c1);
  //     const coords2 = get_coords(r2, c2);
  //     const cx = (coords1.x + coords2.x) / 2;
  //     const cy = (coords1.y + coords2.y) / 2;
  //
  //     ctx.fillStyle = '#fff';
  //     ctx.strokeStyle = '#000';
  //     ctx.lineWidth = 2;
  //     ctx.beginPath();
  //     ctx.arc(cx, cy, 8, 0, Math.PI * 2);
  //     ctx.fill();
  //     ctx.stroke();
  //   }
  // });

  // Example 5: Access grid info
  // const { rows, cols, regions } = gridInfo;
  // console.log(`Grid is ${rows}x${cols}`);
}
