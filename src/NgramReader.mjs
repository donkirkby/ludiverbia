/** Count ngrams for words in Google ngram data.
 * 
 * We want to skip words that are (almost) always in upper case, so we count
 * the number of times we see it in lower case as a ratio of all the times it
 * appeared.
 */
export class NgramReader {
    constructor(limit) {
        this.entries = []; // [[word, lowerCount, totalCount]]
        this.words = new Map(); // {word: entry}
        this.minCount = 0;
        this.finalLimit = limit === undefined ? 10 : limit;
        this.limit = this.finalLimit * 2;
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
            : this.entries.filter(entry => (1-entry[1]/entry[2]) < maxCapitalRate);
        
        // entry = [word, lowerCount, totalCount]
        filtered.sort((a, b) => b[1] - a[1]);
        return filtered.map(entry => entry[0]).slice(0, this.finalLimit);
    }

    toRawCSV = () => {
        const rows = this.entries.map(entry => entry.join())
        return 'word,lower,total\n' + rows.join('\n');
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
            isLower = lowerWord === word,
            oldEntry = this.words.get(lowerWord);
        let maxCount = 0;
        for (const term of terms) {
            const stats = term.split(','),
                count = parseInt(stats[1]);
            maxCount = maxCount < count ? count : maxCount;
        }
        let lowerCount = isLower ? maxCount : 0;
        if (oldEntry !== undefined) {
            const oldTotalCount = oldEntry[2],
                oldIndex = binarySearch(
                    this.entries,
                    entry => (entry[2] === oldTotalCount
                        ? entry[0] < lowerWord
                        : entry[2] > oldTotalCount));
            maxCount += oldTotalCount;
            lowerCount += oldEntry[1];
            this.entries.splice(oldIndex, 1);
        }
        if (maxCount < this.minCount) {
            return;
        }
        let insertIndex = binarySearch(
            this.entries,
            entry => (entry[2] === maxCount
                ? entry[0] < lowerWord
                : entry[2] > maxCount));
        const newEntry = [lowerWord, lowerCount, maxCount];
        this.entries.splice(insertIndex, 0, newEntry);
        const dropped = this.entries.splice(this.limit);
        for (const [oldWord, _oldLowerCount, oldCount] of dropped) {
            this.words.delete(oldWord);
            this.minCount = oldCount;
        }
        this.words.set(lowerWord, newEntry);
    }
}

/** Binary search for an item in an array.
 * 
 * @param {Array} items - where to search
 * @param {function} isBeforeTarget - function that returns true if an item
 *  comes before the target.
 * @returns the index where the item was found or should be inserted.
 */
function binarySearch(items, isBeforeTarget) {
    let low = -1, high = items.length;
    while (1 + low < high) {
        const mid = low + ((high - low) >> 1);
        if ( ! isBeforeTarget(items[mid])) {
            high = mid;
        } else {
            low = mid;
        }
    }
    return high;
}