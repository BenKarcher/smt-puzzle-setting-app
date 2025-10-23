/**
 * Region Sum Line Code Generation
 * Requires advanced codegen to group cells by region and ensure equal sums
 */

export default function generateConstraint(groups, allConstraints, gridInfo) {
  console.log('Generating region-sum-line constraints');
  if (groups.length === 0) return '';

  const constraints = [];
  const { regions } = gridInfo;

  // Region sum lines require regions to be defined
  if (!regions) {
    console.warn('Region sum line constraint requires regions to be defined in the grid');
    return '% Region sum line constraint skipped: no regions defined';
  }

  groups.forEach((group, groupIdx) => {
    if (!group.cells || group.cells.length === 0) return;

    // Group cells by their region
    const cellsByRegion = {};
    group.cells.forEach(([r, c]) => {
      const regionNum = regions[r][c];
      if (!cellsByRegion[regionNum]) {
        cellsByRegion[regionNum] = [];
      }
      cellsByRegion[regionNum].push([r, c]);
    });

    // Get all region numbers that have cells
    const regionNums = Object.keys(cellsByRegion).map(Number).sort((a, b) => a - b);

    if (regionNums.length <= 1) {
      // Line is entirely in one region, no constraint needed
      return;
    }

    constraints.push(`% Region sum line ${groupIdx + 1}: equal sums in each region`);

    // Create sum expressions for each region
    const regionSums = regionNums.map(regionNum => {
      const cells = cellsByRegion[regionNum];
      const cellExprs = cells.map(([r, c]) => `numbers[${r + 1}, ${c + 1}]`);
      return `(${cellExprs.join(' + ')})`;
    });

    // All region sums must be equal
    for (let i = 1; i < regionSums.length; i++) {
      constraints.push(`constraint ${regionSums[0]} = ${regionSums[i]};`);
    }
  });

  return constraints.join('\n');
}
