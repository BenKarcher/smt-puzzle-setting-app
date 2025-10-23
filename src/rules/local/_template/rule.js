/**
 * OPTIONAL FILE: Delete this file if constraint.mzn is sufficient
 *
 * This file is for ADVANCED constraints that need:
 * - Access to other constraint instances (e.g., negative constraints)
 * - Complex logic that's hard to express in MiniZinc templates
 * - Dynamic code generation based on grid properties
 *
 * If you have BOTH constraint.mzn and rule.js:
 * - The template is processed FIRST
 * - Then this function is called and can reference variables from the template
 *
 * @param {Array} groups - This constraint's groups: [{cells: [[r,c], ...], value: x}, ...]
 * @param {Array} allConstraints - All constraint instances: [{ruleId: string, groups: Array}, ...]
 * @param {Object} gridInfo - Grid information: {rows: number, cols: number, regions: Array|null}
 * @returns {string} - MiniZinc constraint code
 */
export default function generateConstraint(groups, allConstraints, gridInfo) {
  const { rows, cols, regions } = gridInfo;

  // Example: Generate constraints that reference other rules
  // const whiteDots = allConstraints
  //   .filter(c => c.ruleId === 'white-dot')
  //   .flatMap(c => c.groups);

  // Example: Generate different constraints based on grid size
  // if (rows === 9 && cols === 9) {
  //   return '% Sudoku-specific constraint';
  // }

  // Example: Iterate over groups and generate constraints
  const constraints = [];
  groups.forEach((group, idx) => {
    const groupNum = idx + 1;

    // Access cells in this group
    group.cells.forEach(([r, c]) => {
      const r1 = r + 1; // Convert to 1-indexed
      const c1 = c + 1;

      // Generate constraint for this cell
      constraints.push(`% Constraint for cell (${r1}, ${c1})`);
    });

    // Access value if present
    if (group.value !== undefined) {
      constraints.push(`% Group ${groupNum} has value: ${group.value}`);
    }
  });

  return constraints.join('\n');
}
