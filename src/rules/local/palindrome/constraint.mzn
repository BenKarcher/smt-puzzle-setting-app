% Palindrome: digits read the same forwards and backwards
% First cell equals last cell, second equals second-to-last, etc.
constraint forall(i in 1..$num_cells1 div 2) (
  numbers[$rows1[i], $cols1[i]] = numbers[$rows1[$num_cells1 - i + 1], $cols1[$num_cells1 - i + 1]]
);
