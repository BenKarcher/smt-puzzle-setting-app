/**
 * Arrow Code Generation
 * Advanced codegen: group 1 is pill, groups 2+ are arrows
 * Each arrow sums to the multi-digit number in the pill
 */

export default function generateConstraint(groups, allConstraints, gridInfo) {
  if (groups.length < 2) return '';

  const constraints = [];
  const pill = groups[0];

  // Build multi-digit number from pill cells
  const pillCells = pill.cells.map(([r, c]) => `numbers[${r + 1}, ${c + 1}]`);
  let pillValue;

  if (pillCells.length === 1) {
    pillValue = pillCells[0];
  } else {
    // Multi-digit number: first digit * 10^(n-1) + second * 10^(n-2) + ...
    const terms = pillCells.map((cell, idx) => {
      const power = pillCells.length - idx - 1;
      if (power === 0) {
        return cell;
      } else {
        return `${cell} * ${Math.pow(10, power)}`;
      }
    });
    pillValue = `(${terms.join(' + ')})`;
  }

  // Each arrow (groups 2+) must sum to the pill value
  for (let i = 1; i < groups.length; i++) {
    const arrow = groups[i];
    if (arrow.cells.length === 0) continue;

    const arrowCells = arrow.cells.map(([r, c]) => `numbers[${r + 1}, ${c + 1}]`);
    const arrowSum = arrowCells.join(' + ');

    constraints.push(`% Arrow ${i}: sum equals pill value`);
    constraints.push(`constraint ${arrowSum} = ${pillValue};`);
  }

  return constraints.join('\n');
}
