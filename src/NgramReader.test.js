import { NgramReader } from './NgramReader.mjs';

test('starts with no entries', () => {
    const reader = new NgramReader();

    expect(reader.entries).toEqual([]);
    expect(reader.limit).toEqual(10);  // default
});

test('reads an entry', () => {
    const reader = new NgramReader();

    reader.read('apple\t2000,123,20');
 
    expect(reader.entries).toEqual([['apple', 123, 123]]);
});

test('reads biggest entry', () => {
    const reader = new NgramReader();

    reader.read('apple\t2000,123,20\t2001,456,10\t2002,234,12');
 
    expect(reader.entries).toEqual([['apple', 456, 456]]);
});

test('sorts multiple entries', () => {
    const reader = new NgramReader();

    reader.read('apple\t2000,123,20');
    reader.read('banana\t2000,456,20');
 
    expect(reader.entries).toEqual([['banana', 456, 456], ['apple', 123, 123]]);
});

test('limits entries', () => {
    const limit = 2,
        reader = new NgramReader(limit);

    reader.read('apple\t2000,123,20');
    reader.read('banana\t2000,456,20');
    reader.read('cherry\t2000,345,20');
 
    expect(reader.entries).toEqual([['banana', 456, 456], ['cherry', 345, 345]]);
});

test('excludes punctuation', () => {
    const reader = new NgramReader();

    reader.read('apple\t2000,123,20');
    reader.read('banana\t2000,456,20');
    reader.read('cherry_pie\t2000,345,20');
 
    expect(reader.entries).toEqual([['banana', 456, 456], ['apple', 123, 123]]);
});

test('Displays bounds', () => {
    const reader = new NgramReader();

    reader.read('apple\t2000,123,20');
    reader.read('banana\t2000,456,20');
 
    expect(reader.toString()).toEqual('NgramReader<banana-apple>');
});

test('Displays single entry bounds', () => {
    const reader = new NgramReader();

    reader.read('apple\t2000,123,20');
 
    expect(reader.toString()).toEqual('NgramReader<apple-apple>');
});

test('Displays empty bounds', () => {
    const reader = new NgramReader();

    expect(reader.toString()).toEqual('NgramReader<>');
});

test('Converts to JSON', () => {
    const reader = new NgramReader();

    reader.read('apple\t2000,123,20');
    reader.read('banana\t2000,456,20');

    expect(JSON.stringify(reader.toJSON())).toEqual('["banana","apple"]');
});

test('reports capitalization rates', () => {
    const reader = new NgramReader();

    reader.read('apple\t2000,300,20');
    reader.read('Apple\t2000,50,20');
    reader.read('APPLE\t2000,30,20');
    reader.read('APple\t2000,20,20');
    reader.read('banana\t2000,200,20');

    expect(reader.calculateCapitalRates()).toEqual(
        [['apple', 0.25], ['banana', 0]]);
});

test('reports capitalization rates with cutoff', () => {
    const reader = new NgramReader(),
        minCapitalRate = 0.8;

    reader.read('apple\t2000,125,20');
    reader.read('Apple\t2000,875,20');
    reader.read('banana\t2000,21,20');
    reader.read('Banana\t2000,79,20');

    expect(reader.calculateCapitalRates(minCapitalRate)).toEqual(
        [['apple', 0.875]]);
});

test('converts to JSON with cutoff', () => {
    const reader = new NgramReader(),
        maxCapitalRate = 0.8;

    reader.read('apple\t2000,125,20');
    reader.read('Apple\t2000,875,20');
    reader.read('banana\t2000,21,20');
    reader.read('Banana\t2000,79,20');

    expect(JSON.stringify(reader.toJSON(maxCapitalRate))).toEqual('["banana"]');
});
