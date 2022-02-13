import { chooseNextPlayer } from "./QuizlApp";

test('choose seat 0 when no counts', () => {
    const players = [{id: 'user1', seat: 1}, {id: 'user2', seat: 0}],
        hitCounts = {},
        expectedNext = 'user2',
        next = chooseNextPlayer(players, hitCounts);

    expect(next).toEqual(expectedNext);
});

test('choose seat 0 when no counts', () => {
    const players = [
        {id: 'user1', seat: 2},
        {id: 'user2', seat: 0},
        {id: 'user3', seat: 1}],
        hitCounts = {user2: 1},
        expectedNext = 'user3',
        next = chooseNextPlayer(players, hitCounts);

    expect(next).toEqual(expectedNext);
});

test('choose from empty list', () => {
    const players = [],
        hitCounts = {},
        expectedNext = undefined,
        next = chooseNextPlayer(players, hitCounts);

    expect(next).toEqual(expectedNext);
});
