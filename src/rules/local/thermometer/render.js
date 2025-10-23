/**
 * Thermometer Rendering
 * Thick light grey line with a circle at one end (the bulb)
 */

export default function render(groups, ctx, helpers) {
  const { draw_pill, get_coords, cellSize } = helpers;

  groups.forEach(group => {
    if (!group.cells || group.cells.length === 0) return;

    // Draw the thermometer line (pill shape)
    draw_pill(ctx, group.cells, {
      fillColor: '#bbb',
      outlineColor: '#fff'
    });

    // Draw bulb (circle at first cell)
    const [r, c] = group.cells[0];
    const coords = get_coords(r, c);

    ctx.fillStyle = '#bbb';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = cellSize * 0.05;
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, cellSize * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
}
