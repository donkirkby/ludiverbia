import { dropLetter } from './QuizlGrid';

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
