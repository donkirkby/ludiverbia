import {LetterSet} from './LetterSet';

test('starts with letters', () => {
    const set = new LetterSet(`\
AB
XY`);
  
    expect(set.format()).toEqual(`\
AB
XY`);
});

test('starts with even columns', () => {
    const set = new LetterSet(`\
ABC
XY`);
  
    expect(set.format()).toEqual(`\
ABC
XY.`);
    expect(set.getSize()).toEqual([2, 3]);
});

test('starts with size', () => {
    const start = `\
AB
XY`;
    const rows = 3,
        columns = 4,
        set = new LetterSet(start, rows, columns);
  
    expect(set.format()).toEqual(`\
AB..
XY..
....`);
});

test('get a letter', () => {
    const set = new LetterSet(`\
ABC
XY`);

    expect(set.getLetter(0, 2)).toEqual('C');
    expect(set.getLetter(1, 2)).toBeUndefined();
});

test('drag a letter', () => {
    const set = new LetterSet('AB\nXY');
  
    set.drag(1, 0);

    expect(set.format()).toEqual('AB\n.Y:X');
});

test('drop a letter', () => {
    const set = new LetterSet(`\
AB.
.Y.:X`);
  
    set.drop(0, 2);

    expect(set.format()).toEqual(`\
ABX
.Y.`);
});

test("can't drag twice", () => {
    const set = new LetterSet(`\
AB
.Y:X`);
  
    expect(() => set.drag(0, 0)).toThrow('Already dragging a letter.');
});

test("can't drop twice", () => {
    const set = new LetterSet(`\
AB
XY`);
  
    expect(() => set.drop(1, 1)).toThrow('Not dragging a letter.');
});

test("can't drag a blank", () => {
    const set = new LetterSet(`\
AB.
XY.`);
  
    expect(() => set.drag(0, 2)).toThrow('No letter to drag at 0, 2.');
});

test('drop on another letter', () => {
    const set = new LetterSet(`\
ABC.
DEF.
GHI.:X`);
  
    set.drop(1, 2);

    expect(set.format()).toEqual(`\
ABC.
DEXF
GHI.`);
});

test('get a word', () => {
    const set = new LetterSet('ABC\nDEF');
  
    expect(set.getWord(1)).toEqual('DEF');
});

test('gaps cancel words', () => {
    const set = new LetterSet('A.CB\nDEF.');

    expect(set.getWord(0)).toBeUndefined();
});


