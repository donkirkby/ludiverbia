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

    submit = (i, word) => {
        const letters = word.toUpperCase().split(''),
            newLetterCounts = {},
            expectedStart = this.spine[i];
        if (letters[0] != expectedStart) {
            throw new Error(`Entry ${i} must start with ${expectedStart}.`);
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
        this.entries[i] = word.toUpperCase();
    }

    build = () => {
        return this.spine + '\n' + this.entries.join('\n');
    }
}
