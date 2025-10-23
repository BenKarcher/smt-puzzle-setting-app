/**
 * High-level solver orchestration
 */

import minizinc from './minizinc-wrapper.js';
import MiniZincCompiler from './compiler.js';

export class PuzzleSolver {
  constructor() {
    this.compiler = new MiniZincCompiler();
    this.currentModel = null;
  }

  /**
   * Configure the puzzle
   */
  configure(grid, variables, variableConfig) {
    this.compiler.reset();
    this.compiler.setGrid(grid);
    this.compiler.setVariables(variables, variableConfig);
    return this;
  }

  /**
   * Add a global rule
   */
  addGlobalRule(rule) {
    this.compiler.addGlobalRule(rule);
    return this;
  }

  /**
   * Add a local rule with placement
   */
  addLocalRule(rule, placement) {
    this.compiler.addLocalRule(rule, placement);
    return this;
  }

  /**
   * Add a constraint instance with groups
   */
  addConstraintInstance(rule, groups) {
    this.compiler.addConstraintInstance(rule, groups);
    return this;
  }

  /**
   * Add a clue
   */
  addClue(row, col, variableType, value) {
    this.compiler.addClue(row, col, variableType, value);
    return this;
  }

  /**
   * Get the compiled MiniZinc model (for debugging)
   */
  getCompiledModel() {
    return this.compiler.compile();
  }

  /**
   * Solve the puzzle
   * @param {object} options - Solver options
   * @returns {Promise<object>} Solve result
   */
  async solve(options = {}) {
    this.currentModel = this.compiler.compile();
    console.log('Compiled MiniZinc model:\n', this.currentModel);

    const solutions = [];

    const result = await minizinc.solve(
      this.currentModel,
      {
        solver: options.solver || 'chuffed', // Chuffed has better performance
        allSolutions: options.allSolutions || false,
        numSolutions: options.numSolutions || 1
      },
      (solution) => {
        console.log('Solution found:', solution);
        solutions.push(solution);
      }
    );

    return {
      ...result,
      solutions,
      modelCode: this.currentModel
    };
  }

  /**
   * Check if puzzle has a unique solution
   */
  async hasUniqueSolution() {
    this.currentModel = this.compiler.compile();

    const count = await minizinc.countSolutions(this.currentModel, 2);
    return count === 1;
  }

  /**
   * Validate puzzle (has at least one solution)
   */
  async validate() {
    this.currentModel = this.compiler.compile();
    return await minizinc.hasSolution(this.currentModel);
  }
}

export default PuzzleSolver;
