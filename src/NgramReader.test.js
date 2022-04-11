import { NgramReader } from './NgramReader.mjs';

test('starts with no entries', () => {
    const reader = new NgramReader();

    expect(reader.entries).toEqual([]);
    expect(reader.limit).toEqual(10);  // default
});

test('reads an entry', () => {
    const reader = new NgramReader();

    reader.read('apple\t2000,123,20');
 
    expect(reader.entries).toEqual([['APPLE', 123]]);
});

test('reads biggest entry', () => {
    const reader = new NgramReader();

    reader.read('apple\t2000,123,20\t2001,456,10\t2002,234,12');
 
    expect(reader.entries).toEqual([['APPLE', 456]]);
});

test('sorts multiple entries', () => {
    const reader = new NgramReader();

    reader.read('apple\t2000,123,20');
    reader.read('banana\t2000,456,20');
 
    expect(reader.entries).toEqual([['BANANA', 456], ['APPLE', 123]]);
});

test('limits entries', () => {
    const limit = 2,
        reader = new NgramReader(limit);

    reader.read('apple\t2000,123,20');
    reader.read('banana\t2000,456,20');
    reader.read('cherry\t2000,345,20');
 
    expect(reader.entries).toEqual([['BANANA', 456], ['CHERRY', 345]]);
});

test('combines top entries', () => {
    const limit = 2,
        reader = new NgramReader(limit);

    reader.read('apple\t2000,123,20');
    reader.read('banana\t2000,456,20');
    reader.read('Apple\t2000,1,1');
 
    expect(reader.entries).toEqual([['BANANA', 456], ['APPLE', 124]]);
});

test('excludes punctuation', () => {
    const reader = new NgramReader();

    reader.read('apple\t2000,123,20');
    reader.read('Banana\t2000,456,20');
    reader.read('cherry_pie\t2000,345,20');
 
    expect(reader.entries).toEqual([['BANANA', 456], ['APPLE', 123]]);
});

test('Displays bounds', () => {
    const reader = new NgramReader();

    reader.read('apple\t2000,123,20');
    reader.read('Banana\t2000,456,20');
 
    expect(reader.toString()).toEqual('NgramReader<BANANA-APPLE>');
});

test('Displays single entry bounds', () => {
    const reader = new NgramReader();

    reader.read('apple\t2000,123,20');
 
    expect(reader.toString()).toEqual('NgramReader<APPLE-APPLE>');
});

test('Displays empty bounds', () => {
    const reader = new NgramReader();

    expect(reader.toString()).toEqual('NgramReader<>');
});

test('Converts to JSON', () => {
    const reader = new NgramReader();

    reader.read('apple\t2000,123,20');
    reader.read('Banana\t2000,456,20');

    expect(JSON.stringify(reader.toJSON())).toEqual('["BANANA","APPLE"]');
});
