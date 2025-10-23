% Killer Cage: sum to $value1 and all different
constraint sum(i in 1..$num_cells1)(numbers[$rows1[i], $cols1[i]]) = $value1;
constraint alldifferent([numbers[$rows1[i], $cols1[i]] | i in 1..$num_cells1]);
