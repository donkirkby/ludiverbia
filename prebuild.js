function main() {
    if ( ! process.version.startsWith('v16.')) {
        throw('This project requires node v16.');
    }
}

main();
