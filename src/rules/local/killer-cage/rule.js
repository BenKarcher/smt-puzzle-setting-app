/**
 * Arrow Code Generation
 * Advanced codegen: group 1 is pill, groups 2+ are arrows
 * Each arrow sums to the multi-digit number in the pill
 */

export default function generateConstraint(groups, allConstraints, gridInfo) {

  const constraints = [];
  // Each arrow (groups 2+) must sum to the pill value
  groups.forEach((group) => {
    if (group.cells.length === 0) return;

    const killerCells = group.cells.map(([r, c]) => `numbers[${r + 1}, ${c + 1}]`);
    const killerSum = killerCells.join(' + ');
    const killerList = `[${killerCells.join(', ')}]`;

    constraints.push(`%all different in killer cage`);
    constraints.push(`constraint all_different(${killerList});`);
    if (typeof group.value !== "number") return;
    constraints.push(`constraint ${killerSum} = ${group.value};`);
  });
  return constraints.join('\n');
}
