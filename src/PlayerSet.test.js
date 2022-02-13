import { buildPlayers } from "./PlayerSet";

test('null returns empty list', () => {
    const players = buildPlayers(null, [{id: "u1", name: "alex"}]);
    expect(players).toEqual([]);
});

test('still empty returns undefined', () => {
    const players = buildPlayers(null, []);
    expect(players).toBeUndefined();
});

test('builds sorted list of users', () => {
    const players = buildPlayers(
        {user123: {name: "alice", seat: 1}, user234: {name: "bob", seat: 0}},
        []);
    expect(players).toEqual([
        {id: "user234", name: "bob", seat: 0},
        {id: "user123", name: "alice", seat: 1}
    ]);
});

test('builds extra fields for users', () => {
    const players = buildPlayers(
        {
            user123: {name: "alice", seat: 1, mood: "grumpy"},
            user234: {name: "bob", seat: 0, age: 23}
        },
        []);
    expect(players).toEqual([
        {id: "user234", name: "bob", seat: 0, age: 23},
        {id: "user123", name: "alice", seat: 1, mood: "grumpy"}
    ]);
});

test('detects changed players', () => {
    const players = buildPlayers(
        {
            user123: {name: "alice", seat: 1, mood: "grumpy"},
            user234: {name: "bob", seat: 0, age: 23}
        },
        [
            {id: "user234", name: "bob", seat: 0, age: 24},
            {id: "user123", name: "alice", seat: 1, mood: "grumpy"}
        ]);
    expect(players).toEqual([
        {id: "user234", name: "bob", seat: 0, age: 23},
        {id: "user123", name: "alice", seat: 1, mood: "grumpy"}
    ]);
});

test('detects unchanged players', () => {
    const players = buildPlayers(
        {
            user123: {name: "alice", seat: 1, mood: "grumpy"},
            user234: {name: "bob", seat: 0, age: 23}
        },
        [
            {id: "user234", name: "bob", seat: 0, age: 23},
            {id: "user123", name: "alice", seat: 1, mood: "grumpy"}
        ]);
    expect(players).toBeUndefined();
});

test('rotates requested player into first', () => {
    const players = buildPlayers(
        {
            user123: {name: "alice", seat: 1},
            user234: {name: "bob", seat: 0},
            user567: {name: "sean", seat: 2}
        },
        [],
        "user123");
    expect(players).toEqual([
        {id: "user123", name: "alice", seat: 1},
        {id: "user567", name: "sean", seat: 2},
        {id: "user234", name: "bob", seat: 0},
    ]);
});
