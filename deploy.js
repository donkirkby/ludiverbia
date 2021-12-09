const fs = require('fs');
const path = require('path');

function wrapReact(source) {
    return "{% if page.is_react %}\n" + source + "\n{% endif %}\n";
}

function copyIndex(indexSrcPath, destFolderPath) {
    const indexMarkdown = `\
---
title: Halfabet
layout: react
is_react: True
---

The players take turns adding words to the list. After the first two
words, all words must be between the two outermost words,
alphabetically. Whenever you add a fourth word, it stays in the game,
along with the words before it and after it. The other word gets
removed. All words must be regular words in an English dictionary: no
proper nouns or foreign words.

Instead of adding a word, you can bet that your opponent can't find a
word between two of the current words. Click on one of the bet buttons
to show which gap they need to fill in.
`;
    let indexSource = fs.readFileSync(indexSrcPath, 'utf8');
    let destFilePath = path.join(destFolderPath, 'index.md');
    let includesPath = path.join(destFolderPath, '_includes');

    fs.writeFileSync(destFilePath, indexMarkdown);

    let match = indexSource.match(/<link href=".*" rel="stylesheet">/);
    destFilePath = path.join(includesPath, 'head-scripts.html');
    fs.writeFileSync(destFilePath, wrapReact(match[0]));

    match = indexSource.match(/<div id="root"><\/div>(.*)<\/body>/ms);
    destFilePath = path.join(includesPath, 'footer-scripts.html');
    fs.writeFileSync(destFilePath, wrapReact(match[1]));
}

function main() {
    let dest = path.resolve('docs');
    let src = path.resolve('build');
    let d = fs.opendirSync(dest);
    let entry;
    while ((entry = d.readSync()) !== null) {
        let destFilePath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            fs.rmdirSync(destFilePath, {recursive: true});
        }
        else {
            fs.unlinkSync(destFilePath);
        }
    }
    d = fs.opendirSync(src);
    while ((entry = d.readSync()) !== null) {
        let srcFilePath = path.join(src, entry.name),
            destFilePath = path.join(dest, entry.name);
        if (entry.name !== 'index.html') {
            fs.renameSync(srcFilePath, destFilePath);
        } else {
            copyIndex(srcFilePath, dest);
        }
    }
}

main();
