% Shade Exactly the Even Digits
% A cell is shaded if and only if it contains an even number
constraint forall(r in ROWS, c in COLS) (
  shaded[r, c] <-> (numbers[r, c] mod 2 = 0)
);
