# SMT Puzzle Setter

A modular web-based puzzle setter with MiniZinc constraint solving. Create and solve logic puzzles with variant rules by mix-and-matching constraint definitions.

## Features

- **Grid Geometry Selection**: Choose from common presets (Sudoku 9x9, 6x6, 4x4, Latin Squares) or create custom rectangular grids
- **Flexible Solution Spaces**: Mix and match variable types:
  - Numbers in all cells
  - Numbers in some cells
  - Cell shading (black/white)
  - Lines through cell centers (loop puzzles)
  - Lines on cell edges
- **Modular Rule System**: Combine global and local rules to create complex puzzle variants
- **Pure Client-Side**: All solving happens in the browser using MiniZinc WASM
- **Extensible**: Easy to add new rules without modifying core code

## Quick Start

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

Visit http://localhost:5173/ to start creating puzzles.

## Project Structure

```
smt-puzzle/
├── src/
│   ├── core/              # Vanilla JS solving logic
│   │   ├── minizinc-wrapper.js   # MiniZinc WASM API wrapper
│   │   ├── compiler.js           # Compiles grid+rules → .mzn
│   │   └── solver.js             # High-level solver orchestration
│   ├── components/        # Svelte UI components
│   │   ├── GridSelector.svelte
│   │   ├── SolutionSpaceConfig.svelte
│   │   ├── MiniZincTest.svelte
│   │   └── (more to come...)
│   ├── lib/
│   │   ├── grid-presets.js    # Sudoku and other presets
│   │   └── rule-loader.js     # Dynamic rule loading
│   ├── rules/             # Rule definitions (JSON + .mzn)
│   │   ├── global/        # Rules that apply to entire grid
│   │   │   ├── sudoku-standard/
│   │   │   ├── latin-square/
│   │   │   ├── no-adjacent-shading/
│   │   │   └── even-shaded/
│   │   └── local/         # Rules for specific cells/regions
│   │       ├── white-dot/
│   │       ├── black-dot/
│   │       └── killer-cage/
│   └── App.svelte         # Main application
├── public/
│   └── rule-visuals/      # Images for local rule markers
├── vite.config.js
└── package.json
```

## How It Works

### 1. Grid Selection
Users select a grid geometry from presets (Sudoku, Latin Square) or create a custom rectangular grid.

### 2. Solution Space Configuration
Choose what types of values can be placed:
- **Numbers (all cells)**: Every cell contains a number from a range (e.g., 1-9)
- **Numbers (some cells)**: Some cells have numbers, others are empty
- **Shading**: Cells can be shaded or unshaded
- **Lines**: Draw loops or paths through/around cells

### 3. Puzzle Editor (Coming Soon)
- Place clues (given values)
- Add global rules (apply to entire grid)
- Place local rules (apply to specific cells/regions)

### 4. Solving
The compiler combines:
- Grid dimensions
- Variable declarations
- Clue constraints
- Rule constraints

Into a complete MiniZinc model, which is solved using the Gecode or Chuffed solver in WASM.

## Rule System

### Rule Definition Format

Each rule lives in `src/rules/[type]/[rule-name]/`:

**metadata.json**:
```json
{
  "id": "no-adjacent-shading",
  "name": "No Adjacent Shading",
  "description": "No two shaded cells may touch orthogonally",
  "type": "global",
  "requiredVariables": ["shading"],
  "categories": ["shading"],
  "parameters": []
}
```

**constraint.mzn**: MiniZinc constraint code
```minizinc
constraint forall(r in ROWS, c in COLS) (
  if r < rows then
    not (shaded[r, c] /\ shaded[r+1, c])
  else
    true
  endif
);
```

### Available Rules

#### Global Rules
- **Sudoku Standard**: Rows, columns, and boxes all different
- **Latin Square**: Rows and columns all different
- **No Adjacent Shading**: Shaded cells can't touch orthogonally
- **Even Shaded**: Shaded cells must contain even numbers

#### Local Rules
- **White Dot**: Two cells differ by 1
- **Black Dot**: Two cells have a 2:1 ratio
- **Killer Cage**: Region sums to a value, all different

### Adding New Rules

1. Create a new directory: `src/rules/[global|local]/my-rule/`
2. Add `metadata.json` with rule definition
3. Add `constraint.mzn` with MiniZinc constraints
4. Import in `src/lib/rule-loader.js`
5. Refresh page - rule appears automatically!

**Example: Diagonal Constraint**

```bash
mkdir -p src/rules/global/diagonal
```

`metadata.json`:
```json
{
  "id": "diagonal",
  "name": "Diagonal Constraint",
  "description": "Both main diagonals contain all different numbers",
  "type": "global",
  "requiredVariables": ["numbers-all"],
  "categories": ["uniqueness", "diagonal"]
}
```

`constraint.mzn`:
```minizinc
% Main diagonal all different
constraint alldifferent([numbers[i, i] | i in 1..min(rows, cols)]);

% Anti-diagonal all different
constraint alldifferent([numbers[i, cols-i+1] | i in 1..min(rows, cols)]);
```

Then add to `rule-loader.js` and it's ready to use!

## Technology Stack

- **Frontend**: Svelte 5 + Vite 7
- **Constraint Solving**: MiniZinc 4.4 (WASM) with Gecode/Chuffed solvers
- **Architecture**: Pure client-side, no backend required

## Development Status

### Completed ✅
- [x] Project setup with Vite + Svelte
- [x] MiniZinc WASM integration
- [x] Compiler (grid + rules → MiniZinc model)
- [x] Grid presets and custom grids
- [x] Variable type system
- [x] Rule loading and parsing
- [x] GridSelector UI
- [x] SolutionSpaceConfig UI
- [x] 7 example rules (Sudoku, Latin Square, Shading, Kropki, Killer)

### In Progress 🚧
- [ ] PuzzleEditor canvas component
- [ ] RuleLibrary browser
- [ ] Interactive clue placement
- [ ] Visual rule placement (dots, cages, etc.)

### Planned 📋
- [ ] Solve/Check puzzle functionality
- [ ] Solution display
- [ ] Export/Import puzzles (JSON)
- [ ] Rule export (share custom rules)
- [ ] More rules (Aqre, Thermometers, Arrows, etc.)
- [ ] Community rule gallery

## Contributing

Want to add a new puzzle rule?

1. Create a folder in `src/rules/global/` or `src/rules/local/`
2. Add `metadata.json` and `constraint.mzn`
3. Test it works
4. Submit a PR!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Third-Party Licenses

This project uses the MiniZinc constraint modeling system, which is licensed under the Mozilla Public License Version 2.0 (MPL-2.0).

See [THIRD-PARTY-LICENSES.md](THIRD-PARTY-LICENSES.md) for complete license information and attributions for all dependencies.

## Acknowledgments

- **MiniZinc Project**: For the excellent constraint modeling system and WebAssembly implementation
  - Website: https://www.minizinc.org/
  - License: Mozilla Public License Version 2.0
- **minizinc-js**: JavaScript/WASM bindings for MiniZinc
  - Repository: https://github.com/MiniZinc/minizinc-js
  - npm package: https://www.npmjs.com/package/minizinc
- **Svelte**: For the reactive UI framework
- **Vite**: For the fast build tooling
- Inspired by puzzle platforms like f-puzzles and SudokuPad
