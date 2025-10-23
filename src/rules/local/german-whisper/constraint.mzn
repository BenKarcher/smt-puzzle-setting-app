% German Whisper: adjacent digits differ by at least 5
constraint forall(i in 1..$num_cells1-1) (
  abs(numbers[$rows1[i], $cols1[i]] - numbers[$rows1[i+1], $cols1[i+1]]) >= 5
);
