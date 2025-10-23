/**
 * Rule loader V2 - Loads rules with rendering and constraint generation
 * New architecture: metadata.json + optional render.js/constraint.mzn/rule.js
 * Auto-detects all rules in rules/global/ and rules/local/ directories
 */

// Auto-import all metadata files
const globalMetadata = import.meta.glob('../rules/global/*/metadata.json', { eager: true });
const localMetadata = import.meta.glob('../rules/local/*/metadata.json', { eager: true });

// Auto-import optional files for global rules
const globalConstraints = import.meta.glob('../rules/global/*/constraint.mzn', { eager: true, query: '?raw', import: 'default' });
const globalRenders = import.meta.glob('../rules/global/*/render.js', { eager: true, import: 'default' });
const globalCodegen = import.meta.glob('../rules/global/*/rule.js', { eager: true, import: 'default' });

// Auto-import optional files for local rules
const localConstraints = import.meta.glob('../rules/local/*/constraint.mzn', { eager: true, query: '?raw', import: 'default' });
const localRenders = import.meta.glob('../rules/local/*/render.js', { eager: true, import: 'default' });
const localCodegen = import.meta.glob('../rules/local/*/rule.js', { eager: true, import: 'default' });

/**
 * Build rule object from imported modules
 * @param {string} path - Metadata file path
 * @param {object} metadata - Imported metadata
 * @param {string} type - 'global' or 'local'
 * @returns {object} - Complete rule object
 */
function buildRule(path, metadata, type) {
  const basePath = path.replace('/metadata.json', '');

  const rule = { ...metadata.default };

  const constraintPath = `${basePath}/constraint.mzn`;
  const renderPath = `${basePath}/render.js`;
  const codegenPath = `${basePath}/rule.js`;

  if (type === 'global') {
    // Global rules: constraint is used directly (not as template)
    if (globalConstraints[constraintPath]) {
      rule.constraint = globalConstraints[constraintPath];
    }

    // Global rules can also have render functions
    if (globalRenders[renderPath]) {
      rule.render = globalRenders[renderPath];
    }

    // Global rules can also have code generation
    if (globalCodegen[codegenPath]) {
      rule.generateConstraint = globalCodegen[codegenPath];
    }
  } else if (type === 'local') {
    // Local rules: constraint is used as a template
    if (localConstraints[constraintPath]) {
      rule.constraintTemplate = localConstraints[constraintPath];
    }

    // Local rules can have render functions
    if (localRenders[renderPath]) {
      rule.render = localRenders[renderPath];
    }

    // Local rules can have code generation
    if (localCodegen[codegenPath]) {
      rule.generateConstraint = localCodegen[codegenPath];
    }
  }

  return rule;
}

// Build global rules registry (excluding templates)
const globalRules = Object.entries(globalMetadata)
  .filter(([path]) => !path.includes('/_template/'))
  .map(([path, metadata]) => buildRule(path, metadata, 'global'));

// Build local/instantiable rules registry (excluding templates)
const instantiableRules = Object.entries(localMetadata)
  .filter(([path]) => !path.includes('/_template/'))
  .map(([path, metadata]) => buildRule(path, metadata, 'local'));

// Combined registry
const allRules = [...globalRules, ...instantiableRules];

/**
 * Get all available rules
 */
export function getAllRules() {
  return allRules;
}

/**
 * Get rules by type
 */
export function getRulesByType(type) {
  return allRules.filter(rule => rule.type === type);
}

/**
 * Get rule by ID
 */
export function getRuleById(id) {
  return allRules.find(rule => rule.id === id);
}

/**
 * Get rules by category
 */
export function getRulesByCategory(category) {
  return allRules.filter(rule =>
    rule.categories && rule.categories.includes(category)
  );
}

/**
 * Get compatible rules for given variable types
 */
export function getCompatibleRules(variableTypes) {
  return allRules.filter(rule => {
    if (!rule.requiredVariables) return true;
    return rule.requiredVariables.every(reqVar =>
      variableTypes.includes(reqVar) || variableTypes.some(v => v.startsWith(reqVar.split('-')[0]))
    );
  });
}

/**
 * Get all global rules
 */
export function getGlobalRules() {
  return globalRules;
}

/**
 * Get all instantiable rules
 */
export function getInstantiableRules() {
  return instantiableRules;
}

/**
 * Get all unique categories
 */
export function getAllCategories() {
  const categories = new Set();
  allRules.forEach(rule => {
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
  getGlobalRules,
  getInstantiableRules,
  getAllCategories
};
