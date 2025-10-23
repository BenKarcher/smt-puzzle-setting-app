% Black Dot (2:1 Ratio) Constraint
% One cell must be exactly double the other
constraint (numbers[$rows1[1], $cols1[1]] = 2 * numbers[$rows1[2], $cols1[2]]) \/
           (2 * numbers[$rows1[1], $cols1[1]] = numbers[$rows1[2], $cols1[2]]);
