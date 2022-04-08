const fs = require('fs');
const request = require('request');

const download = (url, dest) => {
    const file = fs.createWriteStream(dest),
        sendReq = request.get(url);
    return new Promise((resolve, reject) => {
        // verify response code
        sendReq.on('response', (response) => {
            if (response.statusCode !== 200) {
                fs.unlink(
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
            fs.unlink(dest, () => reject(err.message));
        });

        file.on('error', (err) => { // Handle errors
            // delete the (partial) file and then return the error
            fs.unlink(dest, () => reject(err.message));
        });
    });
};

function downloadIfNeeded(url, dest) {
    return new Promise((resolve) => {
        fs.access(dest, (err) => {
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

function main() {
    // Download all 1-gram files, takes about an hour.
    const baseUrl = 'http://storage.googleapis.com/books/ngrams/books/20200217/eng/';
    for (let i = 0; i < 24; i++) {
        const numText = ('00000'+i).slice(-5),
            fileName = `1-${numText}-of-00024.gz`,
            dest = 'raw_words/' + fileName,
            url = baseUrl + fileName;
        downloadIfNeeded(
            url,
            dest).then(() => {
                console.log(`Finished ${fileName}.`);
            }).catch(error => {
                console.log(`Failed ${fileName}: ${error}`);
            });
        }
};

main();
