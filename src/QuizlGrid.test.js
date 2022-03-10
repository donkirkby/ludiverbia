import { scoreGuess, dropLetter, fillLetters } from './QuizlGrid';

const ALPHABET_LETTERS = {
  50: 'a', 51: 'b', 52: 'c', 53: 'd', 54: 'e',
  60: 'f', 61: 'g', 62: 'h', 63: 'i', 64: 'j',
  70: 'k', 71: 'l', 72: 'm', 73: 'n', 74: 'o',
  80: 'p', 81: 'q', 82: 'r', 83: 's', 84: 't',
  90: 'u', 91: 'v', 92: 'w', 93: 'x', 94: 'y'
};

test('drops letter', () => {
  const oldLetters = {},
    newLetters = dropLetter('X', 'cell11', oldLetters);

    expect(newLetters).toEqual({50: 'X'});
});

test('moves letter', () => {
  const oldLetters = {51: 'X'},
    newLetters = dropLetter('X', 'cell11', oldLetters);

    expect(newLetters).toEqual({50: 'X'});
});

test('fills remaining letters', () => {
  const oldLetters = {51: 'X'},
    newLetters = fillLetters(oldLetters);

    expect(newLetters[51]).toEqual('X');
    expect(Object.entries(newLetters).length).toEqual(25);
});

test('guess not in grid', () => {
  expect(scoreGuess('bcdea', ALPHABET_LETTERS)).toBe(-10);
});

test('guess in row', () => {
  expect(scoreGuess('abcde', ALPHABET_LETTERS)).toBe(25);
});

test('guess in column', () => {
  expect(scoreGuess('afkpu', ALPHABET_LETTERS)).toBe(25);
});

test('guess ignores case', () => {
  expect(scoreGuess('abCde', ALPHABET_LETTERS)).toBe(25);
});

test('guess some visible letters', () => {
  const someHiddenLetters = {
    50: 'a', 51: 'B', 52: 'C', 53: 'd', 54: 'e',
    60: 'f', 61: 'g', 62: 'h', 63: 'i', 64: 'j',
    70: 'k', 71: 'l', 72: 'm', 73: 'n', 74: 'o',
    80: 'p', 81: 'q', 82: 'r', 83: 's', 84: 't',
    90: 'u', 91: 'v', 92: 'w', 93: 'x', 94: 'y'
  }
  expect(scoreGuess('abcde', someHiddenLetters)).toBe(23);
});

test('guess all visible letters', () => {
  const someHiddenLetters = {
    50: 'A', 51: 'B', 52: 'C', 53: 'D', 54: 'E',
    60: 'F', 61: 'g', 62: 'h', 63: 'i', 64: 'j',
    70: 'k', 71: 'l', 72: 'm', 73: 'n', 74: 'o',
    80: 'p', 81: 'q', 82: 'r', 83: 's', 84: 't',
    90: 'u', 91: 'v', 92: 'w', 93: 'x', 94: 'y'
  }
  expect(scoreGuess('abcde', someHiddenLetters)).toBe(0);
});
