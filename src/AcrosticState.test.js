import AcrosticState from "./AcrosticState";
import wordList from "./wordList.json";

test('starts with a word and no entries', () => {
    const state = new AcrosticState('RACED');

    expect(state.spine).toEqual('RACED');
    expect(state.entries).toEqual([]);
});

test('starts with a mixed-case word', () => {
    const state = new AcrosticState('rAced');

    expect(state.spine).toEqual('RACED');
});

test('submits an entry', () => {
    const state = new AcrosticState('RACED');

    state.submit(1, 'ACE');

    expect(state.entries).toEqual([undefined, 'ACE']);
});

test('submits an entry in mixed case', () => {
    const state = new AcrosticState('RACED');

    state.submit(1, 'Ace');

    expect(state.entries).toEqual([undefined, 'ACE']);
});

test('builds state text', () => {
    const state = new AcrosticState('RACED');

    state.submit(1, 'Ace');

    const stateText = state.build();

    expect(stateText).toEqual('RACED\n\nACE');
});

test('builds from state text', () => {
    const state = new AcrosticState('RACED\n\nACE');

    expect(state.spine).toEqual('RACED');
    expect(state.entries).toEqual([undefined, 'ACE']);
});

test('rejects an entry that uses extra letters', () => {
    const state = new AcrosticState('RACED');

    expect(() => state.submit(1, 'AXE')).toThrow('Letter X is not allowed.');

    expect(state.entries).toEqual([]);
});

test('rejects an entry that uses letters too many times', () => {
    const state = new AcrosticState('RACED');

    expect(() => state.submit(4, 'DEAD')).toThrow('Too many copies of letter D.');

    expect(state.entries).toEqual([]);
});

test('rejects a word that was already used', () => {
    const state = new AcrosticState('DEAD');

    state.submit(3, 'DAD');
    state.submit(3, 'DAD'); // replacing the same entry is allowed.
    expect(() => state.submit(0, 'DAD')).toThrow('Too many copies of word DAD.');

    expect(state.entries).toEqual([undefined, undefined, undefined, 'DAD']);
});

test('rejects the spine as an entry', () => {
    const state = new AcrosticState('RACED');

    expect(() => state.submit(0, 'RACED')).toThrow('Main word cannot be an entry.');

    expect(state.entries).toEqual([]);
});

test('rejects an entry that starts with the wrong letter', () => {
    const state = new AcrosticState('RACED');

    expect(() => state.submit(2, 'ACE')).toThrow('Entry 2 must start with C.');

    expect(state.entries).toEqual([]);
});

test('rejects an entry not in the word list', () => {
    const wordList = ['a', 'ace'],
        state = new AcrosticState('RACED', wordList);

    state.submit(1, 'ACE');
    expect(() => state.submit(1, 'Ader')).toThrow('Unknown word: Ader');

    expect(state.entries).toEqual([undefined, 'ACE']);
});

test('gives a hint', () => {
    const startText = `\
RACED


CARE`,
        wordList = ['a', 'care'],
        state = new AcrosticState(startText, wordList);

    const [hintWord, spineIndex, listIndex] = state.getHint();

    expect(hintWord).toEqual('A');
    expect(spineIndex).toEqual(1);
    expect(listIndex).toEqual(0);

    expect(state.build()).toEqual(startText);
});

test('gives a hint using only letters in the spine', () => {
    const startText = `\
TRACED



CARE`,
        wordList = ['the', 'a', 'care'],
        state = new AcrosticState(startText, wordList);

    const [hintWord, spineIndex, listIndex] = state.getHint();

    expect(hintWord).toEqual('A');
    expect(spineIndex).toEqual(2);
    expect(listIndex).toEqual(1);
});

test('skips hint with too many repeated letters', () => {
    const startText = `\
RACED
RACE
A`,
        wordList = ['a', 'race', 'raced', 'dared', 'dare'],
        state = new AcrosticState(startText, wordList);

    const [hintWord, spineIndex, listIndex] = state.getHint();

    expect(hintWord).toEqual('DARE');
    expect(spineIndex).toEqual(4);
    expect(listIndex).toEqual(4);
});

test('gives a hint that improves the score', () => {
    const startText = `\
RACED

ACE
CARE`,
        wordList = ['a', 'ace', 'care', 'ear'],
        state = new AcrosticState(startText, wordList);

    const [hintWord, spineIndex, listIndex] = state.getHint();

    expect(hintWord).toEqual('EAR');
    expect(spineIndex).toEqual(3);
    expect(listIndex).toEqual(3);
});

test('gives an empty hint when answer is perfect', () => {
    const startText = `\
RACED

ACE
CARE
EAR
DEAR`,
        wordList = ['a', 'ace', 'care', 'ear', 'dear', 'raced'],
        state = new AcrosticState(startText, wordList);

    const [hintWord, spineIndex, listIndex] = state.getHint();

    expect(hintWord).toBeUndefined();
    expect(spineIndex).toEqual(-1);
    expect(listIndex).toEqual(-1);
});

test('real example', () => {
    const state = new AcrosticState('vulgarism', wordList);

    state.submit(0, 'vulgar');
    state.submit(1, 'usa');
    state.submit(2, 'lair');
    state.submit(3, 'girls');
    state.submit(4, 'arms');
    state.submit(5, 'rivals');
    state.submit(6, 'ils');
    state.submit(7, 'simular');
    state.submit(8, 'mails');

    expect(state.getHint()).toEqual([]);
});
