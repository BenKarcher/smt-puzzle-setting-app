% OPTIONAL FILE: Delete this file if you're using rule.js for code generation instead
%
% This file contains MiniZinc constraint templates with variable substitution.
% Use this for simple constraints that don't need complex JavaScript logic.
%
% Available substitutions (automatically replaced by the compiler):
%   $rows1, $rows2, ... - Arrays of row indices for group 1, 2, etc. (1-indexed)
%   $cols1, $cols2, ... - Arrays of column indices for group 1, 2, etc. (1-indexed)
%   $value1, $value2, ... - Value for group 1, 2, etc. (if requiresValue is true)
%   $num_cells1, $num_cells2, ... - Number of cells in group 1, 2, etc.
%
% Example for a "sum to value" constraint:
% constraint sum(i in 1..$num_cells1)(numbers[$rows1[i], $cols1[i]]) = $value1;
%
% Example for a "two cells differ by 1" constraint:
% constraint abs(numbers[$rows1[1], $cols1[1]] - numbers[$rows1[2], $cols1[2]]) = 1;

% Write your constraint here:
constraint true; % Replace with your actual constraint
