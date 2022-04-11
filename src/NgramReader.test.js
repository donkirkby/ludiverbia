import { NgramReader } from './NgramReader.mjs';

test('starts with no entries', () => {
    const reader = new NgramReader();

    expect(reader.entries).toEqual([]);
    expect(reader.limit).toEqual(10);  // default
});

test('reads an entry', () => {
    const reader = new NgramReader();

    reader.read('apple\t2000,123,20');
 
    expect(reader.entries).toEqual([['apple', 123]]);
});

test('reads biggest entry', () => {
    const reader = new NgramReader();

    reader.read('apple\t2000,123,20\t2001,456,10\t2002,234,12');
 
    expect(reader.entries).toEqual([['apple', 456]]);
});

test('sorts multiple entries', () => {
    const reader = new NgramReader();

    reader.read('apple\t2000,123,20');
    reader.read('banana\t2000,456,20');
 
    expect(reader.entries).toEqual([['banana', 456], ['apple', 123]]);
});

test('limits entries', () => {
    const limit = 2,
        reader = new NgramReader(limit);

    reader.read('apple\t2000,123,20');
    reader.read('banana\t2000,456,20');
    reader.read('cherry\t2000,345,20');
 
    expect(reader.entries).toEqual([['banana', 456], ['cherry', 345]]);
});

test('excludes punctuation', () => {
    const reader = new NgramReader();

    reader.read('apple\t2000,123,20');
    reader.read('Banana\t2000,456,20');
    reader.read('cherry_pie\t2000,345,20');
 
    expect(reader.entries).toEqual([['Banana', 456], ['apple', 123]]);
});

test('Displays bounds', () => {
    const reader = new NgramReader();

    reader.read('apple\t2000,123,20');
    reader.read('Banana\t2000,456,20');
 
    expect(reader.toString()).toEqual('NgramReader<Banana-apple>');
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
