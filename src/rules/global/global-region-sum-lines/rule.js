/**
 * OPTIONAL FILE: Delete this file if constraint.mzn is sufficient
 *
 * This file is for ADVANCED global constraints that need complex logic.
 * Most global rules can be expressed in constraint.mzn directly.
 *
 * Use this only if you need:
 * - Dynamic code generation based on grid properties
 * - Access to other constraint instances
 * - Logic too complex for MiniZinc templates
 *
 * @param {Array} groups - Empty array for global rules
 * @param {Array} allConstraints - All constraint instances: [{ruleId: string, groups: Array}, ...]
 * @param {Object} gridInfo - Grid information: {rows: number, cols: number, regions: Array|null}
 * @returns {string} - MiniZinc constraint code
 */
export default function generateConstraint(groups, allConstraints, gridInfo) {
  console.log(allConstraints);
  const { rows, cols, regions } = gridInfo;
  const cells = new Set();
  for (const constraint of allConstraints.filter(c => c.ruleId === 'region-sum-line')) {
    for (const group of constraint.groups) {
      for (const cell of group.cells) {
        cells.add(cell);
      }
    }
  }
  const sum_string = Array.from(cells).map(([r, c]) => `${regions[r][c]}*(numbers[${r+1},${c+1}]==n)`).join(' + ');
  const constraints = [];
  constraints.push("var int: global_region_sum_line_sum;");
  constraints.push(`constraint forall(n in 1..${rows})(let {var int: global_region_sum_line_total = (${sum_string})} in global_region_sum_line_sum = global_region_sum_line_total \\/ global_region_sum_line_total = 0);`);

  return constraints.join('\n');
}
