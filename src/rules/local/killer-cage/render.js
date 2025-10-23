/**
 * Killer Cage Rendering
 * Draws dashed borders around cage perimeter and sum value in corner
 */

export default function render(groups, ctx, helpers) {
  const { cellSize, draw_cage, get_coords } = helpers;

  groups.forEach(group => {
    if (!group.cells || group.cells.length === 0) return;

    // Draw dashed border around cage using helper
    draw_cage(ctx, group.cells, {
      color: '#666',
      lineWidth: 2,
      dash: [5, 3]
    });

    // Draw sum value in top-left corner of first cell
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
}
