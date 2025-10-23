/**
 * MiniZinc WASM wrapper for browser-based constraint solving
 *
 * This file uses the MiniZinc JavaScript library (minizinc npm package),
 * which is licensed under the Mozilla Public License Version 2.0 (MPL-2.0).
 *
 * MiniZinc source: https://github.com/MiniZinc/minizinc-js
 * License: https://mozilla.org/MPL/2.0/
 *
 * See THIRD-PARTY-LICENSES.md for complete license information.
 */

import { Model } from 'minizinc';

class MiniZincWrapper {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialize MiniZinc (currently happens automatically on first use)
   */
  async init() {
    // MiniZinc WASM initializes automatically when Model is created
    this.initialized = true;
    return this;
  }

  /**
   * Solve a MiniZinc model
   * @param {string} modelCode - Complete MiniZinc model code
   * @param {object} options - Solver options
   * @param {function} onSolution - Callback for each solution
   * @param {function} onProgress - Callback for progress updates
   * @returns {Promise} Solve result
   */
  async solve(modelCode, options = {}, onSolution = null, onProgress = null) {
    const model = new Model();

    // Add the model code as a file
    model.addFile('puzzle.mzn', modelCode);

    // Default solver options
    const solveOptions = {
      solver: options.solver || 'chuffed', // Chuffed has better performance
      'all-solutions': options.allSolutions || false,
      'num-solutions': options.numSolutions || 1,
      // Note: timeout not supported in WASM build
      ...options.extra
    };

    try {
      const solve = model.solve({ options: solveOptions });

      // Set up event handlers
      if (onSolution) {
        solve.on('solution', (solution) => {
          onSolution(solution);
        });
      }

      if (onProgress) {
        solve.on('trace', (message) => {
          onProgress(message);
        });
      }

      // Wait for completion
      const result = await solve;

      return {
        status: result.status,
        time: result.time,
        solutions: result.solution ? [result.solution] : []
      };
    } catch (error) {
      console.error('MiniZinc solve error:', error);
      return {
        status: 'ERROR',
        error: error.message,
        solutions: []
      };
    }
  }

  /**
   * Check if a puzzle has at least one solution
   * @param {string} modelCode - Complete MiniZinc model code
   * @returns {Promise<boolean>}
   */
  async hasSolution(modelCode) {
    const result = await this.solve(modelCode, { numSolutions: 1 });
    return result.status === 'SATISFIED' || result.status === 'ALL_SOLUTIONS';
  }

  /**
   * Count solutions (up to a limit)
   * @param {string} modelCode - Complete MiniZinc model code
   * @param {number} limit - Maximum number of solutions to find
   * @returns {Promise<number>}
   */
  async countSolutions(modelCode, limit = 10) {
    const solutions = [];

    await this.solve(
      modelCode,
      { allSolutions: true, numSolutions: limit },
      (solution) => {
        solutions.push(solution);
      }
    );

    return solutions.length;
  }
}

// Export singleton instance
export const minizinc = new MiniZincWrapper();
export default minizinc;
