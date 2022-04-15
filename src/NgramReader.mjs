/** Count ngrams for words in Google ngram data.
 * 
 * We want to skip words that are (almost) always in upper case, so we count
 * the number of times we see it in lower case as a ratio of all the times it
 * appeared.
 */
export class NgramReader {
    constructor(limit) {
        this.entries = []; // [[word, lowerCount, totalCount]]
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

    toJSON = maxCapitalRate => {
        const filtered = maxCapitalRate === undefined
            ? this.entries
            : this.entries.filter(entry => (1-entry[1]/entry[2]) < maxCapitalRate)
        return filtered.map(entry => entry[0]);
    }

    calculateCapitalRates = minCapitalRate => {
        const capitalRates = this.entries.map(
            ([word, lowerCount, totalCount]) => [word, 1-lowerCount/totalCount]),
            filtered = (minCapitalRate === undefined)
                ? capitalRates
                : capitalRates.filter(entry => entry[1] >= minCapitalRate);
        filtered.sort((a, b) => b[1] - a[1]);
        return filtered;
    }

    read = (line) => {
        const terms = line.split('\t'),
            word = terms.shift();  // extract first item
        if ( ! /^[A-Za-z]+$/.test(word)) {
            return;
        }
        const lowerWord = word.toLowerCase(),
            isLower = lowerWord === word;
        let maxCount = 0;
        for (const term of terms) {
            const stats = term.split(','),
                count = parseInt(stats[1]);
            maxCount = maxCount < count ? count : maxCount;
        }
        let lowerCount = isLower ? maxCount : 0
        if (this.words.has(lowerWord)) {
            for (const [index, entry] of this.entries.entries()) {
                const [oldWord, oldLowerCount, oldCount] = entry;
                if (lowerWord === oldWord) {
                    maxCount += oldCount;
                    lowerCount += oldLowerCount;
                    this.entries.splice(index, 1);
                    break;
                }
            }
        }
        if (maxCount < this.minCount) {
            return;
        }
        let insertIndex = this.entries.length;
        for (const [index, entry] of this.entries.entries()) {
            if (entry[2] < maxCount) {
                insertIndex = index;
                break;
            }
        }
        this.entries.splice(insertIndex, 0, [lowerWord, lowerCount, maxCount]);
        const dropped = this.entries.splice(this.limit);
        for (const [oldWord, _oldLowerCount, oldCount] of dropped) {
            this.words.delete(oldWord);
            this.minCount = oldCount;
        }
        this.words.add(lowerWord);
    }
}
