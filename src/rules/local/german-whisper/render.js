/**
 * German Whisper Rendering
 * Light green line through cells
 */

export default function render(groups, ctx, helpers) {
  const { get_coords, cellSize } = helpers;

  groups.forEach(group => {
    if (!group.cells || group.cells.length === 0) return;

    // Draw light green line through cells
    ctx.strokeStyle = '#81C784';
    ctx.lineWidth = cellSize * 0.25;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    group.cells.forEach(([r, c], idx) => {
      const coords = get_coords(r, c);
      if (idx === 0) {
        ctx.moveTo(coords.x, coords.y);
      } else {
        ctx.lineTo(coords.x, coords.y);
      }
    });
    ctx.stroke();
  });
}
