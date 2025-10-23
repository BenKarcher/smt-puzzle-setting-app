/**
 * White Dot (Consecutive) Rendering
 * Draws white circle between two adjacent cells
 */

export default function render(groups, ctx, helpers) {
  const { cellSize } = helpers;

  groups.forEach(group => {
    if (!group.cells || group.cells.length !== 2) return;

    const [r1, c1] = group.cells[0];
    const [r2, c2] = group.cells[1];

    // Calculate center point between the two cells
    const x1 = c1 * cellSize + cellSize / 2;
    const y1 = r1 * cellSize + cellSize / 2;
    const x2 = c2 * cellSize + cellSize / 2;
    const y2 = r2 * cellSize + cellSize / 2;
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;

    // Draw white circle with black border
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
}
