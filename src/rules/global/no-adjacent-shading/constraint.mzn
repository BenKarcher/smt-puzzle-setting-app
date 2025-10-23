% No Adjacent Shading
% No two shaded cells may touch orthogonally
constraint forall(r in ROWS, c in COLS) (
  if r < rows then
    not (shaded[r, c] /\ shaded[r+1, c])
  else
    true
  endif
);

constraint forall(r in ROWS, c in COLS) (
  if c < cols then
    not (shaded[r, c] /\ shaded[r, c+1])
  else
    true
  endif
);
