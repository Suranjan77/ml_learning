export type Matrix = number[][];
export type FilterKind = "vertical" | "horizontal" | "sharpen";

export const INPUT: Matrix = [
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 0, 0, 1, 1, 0],
  [0, 1, 0, 0, 0, 0, 1, 0],
  [0, 1, 0, 1, 1, 0, 1, 0],
  [0, 1, 0, 1, 1, 0, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

export const FILTERS: Record<FilterKind, Matrix> = {
  vertical: [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]],
  horizontal: [[-1, -1, -1], [0, 0, 0], [1, 1, 1]],
  sharpen: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]],
};

export function patchAt(input: Matrix, row: number, column: number, size = 3): Matrix {
  return input.slice(row, row + size).map((values) => values.slice(column, column + size));
}

export function dotProduct(a: Matrix, b: Matrix): number {
  return a.reduce((total, row, y) => total + row.reduce((sum, value, x) => sum + value * b[y][x], 0), 0);
}

export function convolve(input: Matrix, kernel: Matrix): Matrix {
  const size = kernel.length;
  return Array.from({ length: input.length - size + 1 }, (_, row) =>
    Array.from({ length: input[0].length - size + 1 }, (_, column) => dotProduct(patchAt(input, row, column, size), kernel)),
  );
}

export function relu(matrix: Matrix): Matrix {
  return matrix.map((row) => row.map((value) => Math.max(0, value)));
}

export function maxPool(matrix: Matrix, size = 2): Matrix {
  const rows = Math.floor(matrix.length / size);
  const columns = Math.floor(matrix[0].length / size);
  return Array.from({ length: rows }, (_, row) => Array.from({ length: columns }, (_, column) => {
    const values = patchAt(matrix, row * size, column * size, size).flat();
    return Math.max(...values);
  }));
}
