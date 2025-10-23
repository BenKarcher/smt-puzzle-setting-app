% Standard Sudoku Rules
% All rows must contain different numbers
constraint forall(r in ROWS) (
  alldifferent([numbers[r, c] | c in COLS])
);

% All columns must contain different numbers
constraint forall(c in COLS) (
  alldifferent([numbers[r, c] | r in ROWS])
);

% All regions must contain different numbers
constraint forall(reg in REGIONS) (
  alldifferent([numbers[r, c] | r in ROWS, c in COLS where region[r, c] = reg])
);
