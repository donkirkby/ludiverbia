import { dropLetter, fillLetters } from './QuizlGrid';

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
