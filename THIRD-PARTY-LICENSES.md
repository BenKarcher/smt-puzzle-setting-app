# Third-Party Licenses

This project uses the following third-party software:

## MiniZinc

This project uses the MiniZinc constraint modeling system.

- **Package**: `minizinc` (npm package, version 4.4.4)
- **Source**: https://github.com/MiniZinc/minizinc-js
- **License**: Mozilla Public License Version 2.0 (MPL-2.0)
- **Copyright**: Copyright (C) MiniZinc Project contributors

### About MiniZinc

MiniZinc is a free and open-source constraint modeling language. The MiniZinc JavaScript package (`minizinc`) provides WebAssembly bindings that allow MiniZinc to run in web browsers and Node.js environments.

### License Summary

The Mozilla Public License 2.0 is a permissive open-source license that allows:
- Use, modification, and distribution of the software
- Integration into larger works under different licenses
- Commercial use

Key requirements:
- Source code of MPL-licensed files must be made available if modified
- License and copyright notices must be preserved
- Modified files must be documented

### Full License Text

The complete text of the Mozilla Public License Version 2.0 can be found at:
- https://mozilla.org/MPL/2.0/
- In the file: `node_modules/minizinc/LICENSE`

### Attribution

This project includes the MiniZinc JavaScript library, which is subject to the terms of the Mozilla Public License, v. 2.0. The source code for MiniZinc is available at https://github.com/MiniZinc/minizinc-js.

---

## Svelte

This project uses Svelte for UI components.

- **Package**: `svelte` (version ^5.41.2)
- **License**: MIT License
- **Source**: https://github.com/sveltejs/svelte

---

## Vite

This project uses Vite as its build tool.

- **Package**: `vite` (version ^7.1.11)
- **License**: MIT License
- **Source**: https://github.com/vitejs/vite

---

## Complete Dependency Information

For a complete list of all dependencies and their licenses, see `package.json` and run `npm list` to view the full dependency tree.

### Compliance Notes

All dependencies used in this project are licensed under permissive open-source licenses (MIT, MPL-2.0) that permit commercial and non-commercial use, modification, and distribution.

The MiniZinc library (MPL-2.0) is used as a dependency without modification to its source files. As per section 3.3 of the MPL-2.0, this project constitutes a "Larger Work" that combines the MiniZinc library with original code licensed under the MIT License.
