export default class AcrosticState {
    constructor(text, wordList) {
        const lines = text.split(/\r\n|(?!\r\n)[\n-\r\x85\u2028\u2029]/);
        this.spine = lines[0].toUpperCase();
        this.wordList = wordList;
        this.entries = lines.slice(1).map(
            line => line === '' ? undefined : line);
        this.letterCounts = {}
        for (let i = 0; i < this.spine.length; i++) {
            const letter = this.spine[i],
                letterCount = (this.letterCounts[letter] || 0) + 1;
            this.letterCounts[letter] = letterCount;
        }
    }

    /** Add an entry.
     * 
     * @param {int} spineIndex position in the spine word to add the entry
     * @param {String} word word to add
     */
    submit = (spineIndex, word) => {
        const letters = word.toUpperCase().split(''),
            newLetterCounts = {},
            expectedStart = this.spine[spineIndex],
            upperWord = word.toUpperCase();
        if (letters[0] != expectedStart) {
            throw new Error(
                `Entry ${spineIndex} must start with ${expectedStart}.`);
        }
        if (word === this.spine) {
            throw new Error('Main word cannot be an entry.');
        }
        for (let j = 0; j < this.entries.length; j++) {
            if (this.entries[j] === upperWord && spineIndex !== j) {
                throw new Error(`Too many copies of word ${upperWord}.`);
            }
        }
        for (const letter of letters) {
            const newLetterCount = (newLetterCounts[letter] || 0) + 1;
            if (newLetterCount > this.letterCounts[letter]) {
                throw new Error(`Too many copies of letter ${letter}.`);
            }
            newLetterCounts[letter] = newLetterCount;
            if (this.spine.indexOf(letter) < 0) {
                throw new Error(`Letter ${letter} is not allowed.`);
            }
        }
        if (this.wordList !== undefined) {
            if (this.wordList.indexOf(word.toLowerCase()) < 0) {
                throw new Error(`Unknown word: ${word}`)
            }

        } 
        this.entries[spineIndex] = upperWord;
    }

    /** Build state text that this object can be recreated from.
     * 
     * @returns spine word, plus an entry on each line
     */
    build = () => {
        return this.spine + '\n' + this.entries.join('\n');
    }

    /** Find the most common word to improve the score.
     * 
     * @returns [hintWord, spineIndex, listIndex] - where spineIndex is the
     *  position on the spine word to add the hintWord, and listIndex is the
     *  position of the hintWord in the word list. a higher listIndex means the
     *  hintWord is less common.
     */
    getHint = () => {
        const entryLengths = [],
            spineLetterCounts = {};
        for (let i = 0; i < this.spine.length; i++) {
            const entry = this.entries[i];
            entryLengths.push(entry && entry.length || 0);
        }
        for (const [letter, count] of Object.entries(this.letterCounts)) {
            spineLetterCounts[letter.toLowerCase()] = count;
        }
        for (let listIndex = 0; listIndex < this.wordList.length; listIndex++) {
            const word = this.wordList[listIndex],
                wordLetterCounts = {};
            let isValid = true;
            for (let i = 0; i < word.length; i++) {
                const letter = word.charAt(i),
                    wordLetterCount = (wordLetterCounts[letter] || 0) + 1,
                    spineLetterCount = spineLetterCounts[letter] || 0;
                if (wordLetterCount > spineLetterCount) {
                    isValid = false;
                    break;
                }
            }
            if ( ! isValid) {
                continue;
            }
            const startLetter = word.charAt(0).toUpperCase();
            for (let spineIndex = 0; spineIndex < this.spine.length; spineIndex++) {
                if (this.spine.charAt(spineIndex) === startLetter &&
                    word.length > entryLengths[spineIndex]) {
                    return [word.toUpperCase(), spineIndex, listIndex];
                }
            }
        }

        // No hint found, return empty.
        return [undefined, -1, -1];
    }
}
