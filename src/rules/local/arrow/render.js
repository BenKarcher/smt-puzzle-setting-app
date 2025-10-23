/**
 * Arrow Rendering
 * Group 1 is the pill (bulb), subsequent groups are arrows
 */

export default function render(groups, ctx, helpers) {
  const { draw_pill, get_coords, cellSize } = helpers;

  if (groups.length < 2) return;

  // Group 1 is the pill (bulb)
  const pill = groups[0];
  if (pill.cells && pill.cells.length > 0) {
    draw_pill(ctx, pill.cells, {
      fillColor: '#ccc',
      outlineColor: '#fff'
    });
  }

  // Groups 2+ are arrows
  for (let i = 1; i < groups.length; i++) {
    const arrow = groups[i];
    if (!arrow.cells || arrow.cells.length < 2) continue;

    // Draw arrow line (thinner than pill)
    ctx.strokeStyle = '#999';
    ctx.lineWidth = cellSize * 0.3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    arrow.cells.forEach(([r, c], idx) => {
      const coords = get_coords(r, c);
      if (idx === 0) {
        ctx.moveTo(coords.x, coords.y);
      } else {
        ctx.lineTo(coords.x, coords.y);
      }
    });
    ctx.stroke();

    // Draw arrowhead at the end
    if (arrow.cells.length >= 2) {
      const lastIdx = arrow.cells.length - 1;
      const [r1, c1] = arrow.cells[lastIdx - 1];
      const [r2, c2] = arrow.cells[lastIdx];

      const coords1 = get_coords(r1, c1);
      const coords2 = get_coords(r2, c2);

      const dx = coords2.x - coords1.x;
      const dy = coords2.y - coords1.y;
      const angle = Math.atan2(dy, dx);

      const arrowLength = cellSize * 0.4;
      const arrowWidth = Math.PI / 6;

      ctx.fillStyle = '#999';
      ctx.beginPath();
      ctx.moveTo(coords2.x, coords2.y);
      ctx.lineTo(
        coords2.x - arrowLength * Math.cos(angle - arrowWidth),
        coords2.y - arrowLength * Math.sin(angle - arrowWidth)
      );
      ctx.lineTo(
        coords2.x - arrowLength * Math.cos(angle + arrowWidth),
        coords2.y - arrowLength * Math.sin(angle + arrowWidth)
      );
      ctx.closePath();
      ctx.fill();
    }
  }
}
