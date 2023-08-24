export class LetterSet {
    constructor(letters, rows, columns) {
        const [grid, dragging] = letters.split(':')
        const lines = grid.split(/\r\n|(?!\r\n)[\n-\r\x85\u2028\u2029]/);
        this.letters = lines.map(line => line.split(''));
        this.dragging = dragging;
        if (rows !== undefined) {
            for (let row = this.letters.length; row < rows; row++) {
                this.letters.push([]);
            }
        }
        if (columns === undefined) {
            columns = Math.max(...this.letters.map(row => row.length));
        }
        for (const row of this.letters) {
            for (let column = row.length; column < columns; column++) {
                row.push('.');
            }
        }
    }

    format = () => {
        const grid = this.letters.map(row => row.join('')).join('\n');
        if (this.dragging === undefined) {
            return grid;
        }
        return `${grid}:${this.dragging}`;
    }

    getSize = () => [this.letters.length, this.letters[0].length];

    getLetter = (row, column) => {
        const letter = this.letters[row][column];
        return letter === '.' ? undefined : letter;
    }

    getWord = (row) => {
        const rowLetters = this.letters[row];
        let hasBlank = false;
        for (const letter of rowLetters.values()) {
            if (letter === '.') {
                hasBlank = true;
            } else if (hasBlank) {
                // Letter after a blank, no valid word.
                return undefined;
            }
        }
        return rowLetters.join('');
    }

    drag = (row, column) => {
        if (this.dragging !== undefined) {
            throw new Error('Already dragging a letter.');
        }
        this.dragging = this.letters[row][column];
        if (this.dragging === '.') {
            throw new Error(`No letter to drag at ${row}, ${column}.`);
        }
        this.letters[row][column] = '.';
    }

    drop = (row, column) => {
        if (this.dragging === undefined) {
            throw new Error('Not dragging a letter.');
        }
        const replaced = this.letters[row][column];
        this.letters[row][column] = this.dragging;
        this.dragging = undefined;
        if (replaced !== '.') {
            let minDistance = Infinity,
                closestRow = undefined,
                closestColumn = undefined;
            for (const [i, letterRow] of this.letters.entries()) {
                for (const [j, letter] of letterRow.entries()) {
                    if (letter === '.') {
                        const distance = Math.sqrt((row-i)**2+(column-j)**2);
                        if (distance < minDistance) {
                            closestRow = i;
                            closestColumn = j;
                            minDistance = distance;
                        }
                    }
                }
            }
            this.letters[closestRow][closestColumn] = replaced;
        }
    }
}
