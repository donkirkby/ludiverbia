const fs = require('fs');
const path = require('path');

function wrapReact(source) {
    return "{% if page.is_react %}\n" + source + "\n{% endif %}\n";
}

function copyIndex(indexSrcPath, destFolderPath) {
    let indexSource = fs.readFileSync(indexSrcPath, 'utf8');
    let includesPath = path.join(destFolderPath, '_includes');

    let match = indexSource.match(/<script defer="defer".*" rel="stylesheet">/);
    let destFilePath = path.join(includesPath, 'head-scripts.html');
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
        let destFilePath = path.join(dest, entry.name),
            isUntouched = (
                entry.name.startsWith('_') ||
                entry.name.startsWith('Gemfile') ||
                entry.name.endsWith('.md')
            );
        if (isUntouched) {
            // Leave untouched.
        }
        else if (entry.isDirectory()) {
            fs.rmSync(destFilePath, {recursive: true});
        }
        else {
            fs.unlinkSync(destFilePath);
        }
    }
    const entries = fs.readdirSync(src);
    entries.sort();  // Fails if we hit index.html before _includes.
    for (entry of entries) {
        let srcFilePath = path.join(src, entry),
            destFilePath = path.join(dest, entry);
        if (entry !== 'index.html') {
            fs.renameSync(srcFilePath, destFilePath);
        } else {
            copyIndex(srcFilePath, dest);
        }
    }
}

main();
