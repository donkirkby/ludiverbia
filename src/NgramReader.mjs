export class NgramReader {
    constructor(limit) {
        this.entries = [];
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

    read = (line) => {
        const terms = line.split('\t'),
            word = terms.shift();  // extract first item
        if ( ! /^[A-Za-z]+$/.test(word)) {
            return;
        }
        let maxCount = 0;
        for (const term of terms) {
            const stats = term.split(','),
                count = parseInt(stats[1]);
            maxCount = maxCount < count ? count : maxCount;
        }
        let insertIndex = this.entries.length;
        for (const [index, [_oldWord, oldCount]] of this.entries.entries()) {
            if (oldCount < maxCount) {
                insertIndex = index;
                break;
            }
        }
        this.entries.splice(insertIndex, 0, [word, maxCount]);
        this.entries.splice(this.limit);
    }
}
