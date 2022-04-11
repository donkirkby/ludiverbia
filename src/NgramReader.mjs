export class NgramReader {
    constructor(limit) {
        this.entries = [];
        this.words = new Set();
        this.minCount = 0;
        this.limit = limit === undefined ? 10 : limit;
    }

    toString = () => {
        if (this.entries.length === 0) {
            return 'NgramReader<>';
        }
        const first = this.entries[0][0],
            last = this.entries[this.entries.length-1][0];
        return `NgramReader<${first}-${last}>`;
    }

    toJSON = () => {
        return this.entries.map(entry => entry[0]);
    }

    read = (line) => {
        const terms = line.split('\t'),
            word = terms.shift().toUpperCase();  // extract first item
        if ( ! /^[A-Za-z]+$/.test(word)) {
            return;
        }
        let maxCount = 0;
        for (const term of terms) {
            const stats = term.split(','),
                count = parseInt(stats[1]);
            maxCount = maxCount < count ? count : maxCount;
        }
        if (this.words.has(word)) {
            for (const [index, [oldWord, oldCount]] of this.entries.entries()) {
                if (word === oldWord) {
                    maxCount += oldCount;
                    this.entries.splice(index, 1);
                    break;
                }
            }
        }
        if (maxCount < this.minCount) {
            return;
        }
        let insertIndex = this.entries.length;
        for (const [index, [_oldWord, oldCount]] of this.entries.entries()) {
            if (oldCount < maxCount) {
                insertIndex = index;
                break;
            }
        }
        this.entries.splice(insertIndex, 0, [word, maxCount]);
        const dropped = this.entries.splice(this.limit);
        for (const [oldWord, oldCount] of dropped) {
            this.words.delete(oldWord);
            this.minCount = oldCount;
        }
        this.words.add(word);
    }
}
