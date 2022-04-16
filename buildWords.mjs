import {createReadStream, createWriteStream, unlink, access, writeFile} from 'fs';
import readline from 'readline';
import request from 'request';
import {compose}  from 'stream';
import {createGunzip} from 'zlib';

import { NgramReader } from './src/NgramReader.mjs';
// import pkg from './src/NgramReader.mjs';
// const { NgramReader } = pkg;

const download = (url, dest) => {
    const file = createWriteStream(dest),
        sendReq = request.get(url);
    return new Promise((resolve, reject) => {
        // verify response code
        sendReq.on('response', (response) => {
            if (response.statusCode !== 200) {
                unlink(
                    dest,
                    () => reject('Response status was ' + response.statusCode));
            }

            sendReq.pipe(file);
        });

        // close() is async, resolve after close completes
        file.on('finish', () => file.close(resolve));

        // check for request errors
        sendReq.on('error', (err) => {
            // delete the (partial) file and then return the error
            unlink(dest, () => reject(err.message));
        });

        file.on('error', (err) => { // Handle errors
            // delete the (partial) file and then return the error
            unlink(dest, () => reject(err.message));
        });
    });
};

function downloadIfNeeded(url, dest) {
    return new Promise((resolve) => {
        access(dest, (err) => {
            if (err === null) {
                resolve();
            }
            else {
                // File not found, download it.
                console.log(`Downloading ${url}`)
                resolve(download(url, dest));
            }
        });
    });
}

function downloadNgramsIfNeeded() {
    // Download all 1-gram files, takes about an hour.
    const promises = [],
        baseUrl = 'http://storage.googleapis.com/books/ngrams/books/20200217/eng/';
    for (let i = 0; i < 24; i++) {
        const numText = ('00000'+i).slice(-5),
            fileName = `1-${numText}-of-00024.gz`,
            dest = 'raw_words/' + fileName,
            url = baseUrl + fileName;
        promises.push(downloadIfNeeded(
            url,
            dest).catch(error => {
                console.log(`Failed ${fileName}: ${error}`);
            }));
        }
    return Promise.all(promises);
};

async function gunzipLineByLine(wordListPath) {
    const ngrams = new NgramReader(50000),
        startTime = new Date();
    let readCount = 0;
  
    for (let i = 0; i < 24; i++) {
        const numText = ('00000'+i).slice(-5),
            filename = `raw_words/1-${numText}-of-00024.gz`,
            fileStream = createReadStream(filename),
            decompressed = compose(fileStream, createGunzip()),
            rl = readline.createInterface({
                input: decompressed,
                crlfDelay: Infinity
            });
            // Note: we use the crlfDelay option to recognize all instances of CR LF
            // ('\r\n') in input as a single line break.
        console.timeLog('Reading', filename)

        for await (const line of rl) {
            ngrams.read(line);
            readCount += 1;
            if (readCount % 1000000 === 0) {
                const endTime = new Date(),
                    duration = endTime - startTime,
                    itemDuration = Math.round(duration / readCount*1000)/1000;
                console.timeLog(
                    'Reading',
                    `${readCount} ngrams: ${ngrams} at ${itemDuration}ms/item.`)
            }
        }
    }
    console.timeEnd('Reading');
    const maxCapitalRate = 0.95,
        wordList = ngrams.toJSON(maxCapitalRate);
    writeFile(
        wordListPath,
        JSON.stringify(wordList, null, 1).replaceAll('\n ', '\n'),
        err => {
            if (err !== null) {
                console.log(`Failed to write word list: ${err}`);
            }
        });
    writeFile(
        'src/rawWords.csv',
        ngrams.toRawCSV(),
        err => {
            if (err !== null) {
                console.log(`Failed to write raw words: ${err}`);
            }
        });
    return wordList;
}

async function main() {
    await downloadNgramsIfNeeded();
    console.time('Reading');
    gunzipLineByLine('src/wordList.json');
}

main();
