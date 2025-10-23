% REQUIRED for most global rules (unless using rule.js instead)
%
% This file contains the MiniZinc constraints that apply to the entire grid.
% Global rules don't use groups or substitutions like $rows1, $cols1.
%
% Available variables you can use:
%   ROWS, COLS - Sets of row/column indices (e.g., 1..9)
%   rows, cols - Grid dimensions as integers
%   numbers[ROWS, COLS] - The number grid (if requiredVariables includes numbers)
%   shaded[ROWS, COLS] - The shading grid (if requiredVariables includes shading)
%   region[ROWS, COLS] - Region assignments (if requiresRegions is true)
%   REGIONS - Set of region indices
%
% Examples:
%
% All rows must have unique numbers:
% constraint forall(r in ROWS) (
%   alldifferent([numbers[r, c] | c in COLS])
% );
%
% No two adjacent cells can both be shaded:
% constraint forall(r in ROWS, c in COLS where c < cols) (
%   not (shaded[r, c] /\ shaded[r, c+1])
% );

% Write your global constraint here:
constraint true; % Replace with your actual constraint
