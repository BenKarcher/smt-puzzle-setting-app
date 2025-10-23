% Thermometer: digits strictly increase along the line
% First cell is the bulb, subsequent cells must be strictly greater
constraint forall(i in 1..$num_cells1-1) (
  numbers[$rows1[i], $cols1[i]] < numbers[$rows1[i+1], $cols1[i+1]]
);
