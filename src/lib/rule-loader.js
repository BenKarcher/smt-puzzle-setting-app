/**
 * Rule loader - Dynamically loads rule definitions
 *
 * In production, this would scan the src/rules directory
 * For now, we'll use a static registry that imports rules
 */

// Import all rule metadata
import sudokuMeta from '../rules/global/sudoku-standard/metadata.json';
import latinSquareMeta from '../rules/global/latin-square/metadata.json';
import noAdjacentShadingMeta from '../rules/global/no-adjacent-shading/metadata.json';
import evenShadedMeta from '../rules/global/even-shaded/metadata.json';
import whiteDotMeta from '../rules/local/white-dot/metadata.json';
import blackDotMeta from '../rules/local/black-dot/metadata.json';
import killerCageMeta from '../rules/local/killer-cage/metadata.json';

// Import all constraint files as text
import sudokuConstraint from '../rules/global/sudoku-standard/constraint.mzn?raw';
import latinSquareConstraint from '../rules/global/latin-square/constraint.mzn?raw';
import noAdjacentShadingConstraint from '../rules/global/no-adjacent-shading/constraint.mzn?raw';
import evenShadedConstraint from '../rules/global/even-shaded/constraint.mzn?raw';
import whiteDotConstraint from '../rules/local/white-dot/constraint.mzn?raw';
import blackDotConstraint from '../rules/local/black-dot/constraint.mzn?raw';
import killerCageConstraint from '../rules/local/killer-cage/constraint.mzn?raw';

// Rule registry
const ruleRegistry = [
  { ...sudokuMeta, constraint: sudokuConstraint },
  { ...latinSquareMeta, constraint: latinSquareConstraint },
  { ...noAdjacentShadingMeta, constraint: noAdjacentShadingConstraint },
  { ...evenShadedMeta, constraint: evenShadedConstraint },
  { ...whiteDotMeta, constraint: whiteDotConstraint },
  { ...blackDotMeta, constraint: blackDotConstraint },
  { ...killerCageMeta, constraint: killerCageConstraint }
];

/**
 * Get all available rules
 */
export function getAllRules() {
  return ruleRegistry;
}

/**
 * Get rules by type (global or local)
 */
export function getRulesByType(type) {
  return ruleRegistry.filter(rule => rule.type === type);
}

/**
 * Get rule by ID
 */
export function getRuleById(id) {
  return ruleRegistry.find(rule => rule.id === id);
}

/**
 * Get rules by category
 */
export function getRulesByCategory(category) {
  return ruleRegistry.filter(rule =>
    rule.categories && rule.categories.includes(category)
  );
}

/**
 * Get compatible rules for given variable types
 */
export function getCompatibleRules(variableTypes) {
  return ruleRegistry.filter(rule => {
    // Check if all required variables are available
    return rule.requiredVariables.every(reqVar =>
      variableTypes.includes(reqVar)
    );
  });
}

/**
 * Validate if a rule can be used with current puzzle configuration
 */
export function validateRule(rule, availableVariables) {
  return rule.requiredVariables.every(reqVar =>
    availableVariables.includes(reqVar)
  );
}

/**
 * Get all unique categories
 */
export function getAllCategories() {
  const categories = new Set();
  ruleRegistry.forEach(rule => {
    if (rule.categories) {
      rule.categories.forEach(cat => categories.add(cat));
    }
  });
  return Array.from(categories).sort();
}

export default {
  getAllRules,
  getRulesByType,
  getRuleById,
  getRulesByCategory,
  getCompatibleRules,
  validateRule,
  getAllCategories
};
