% Latin Square Rules
% All rows must contain different numbers
constraint forall(r in ROWS) (
  alldifferent([numbers[r, c] | c in COLS])
);

% All columns must contain different numbers
constraint forall(c in COLS) (
  alldifferent([numbers[r, c] | r in ROWS])
);
