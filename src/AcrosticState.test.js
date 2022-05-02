import AcrosticState from "./AcrosticState";

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
