const fs = require('fs');
const path = require('path');
const hub = require('./lib/hub');
const Gun = require('./index');

const alias = require('os').userInfo().username;
const testDir = path.join(__dirname, alias); // Make sure username is in the path
if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
}

const gun = Gun({file: false, radisk: false, localStorage: false});

const numFiles = 100;
let filesProcessed = 0;

const originalLog = console.log;
console.log = function(...args) {
    originalLog('LOG:', ...args);
    if (args[0] && typeof args[0] === 'string' && args[0].includes('has been added')) {
        filesProcessed++;
        if (filesProcessed === numFiles) {
            const endTime = Date.now();
            originalLog(`Processed ${numFiles} files in ${endTime - startTime}ms`);
            cleanup();
            process.exit(0);
        }
    }
};

function cleanup() {
    try {
        if (fs.existsSync(testDir)) {
            const files = fs.readdirSync(testDir);
            for (const file of files) {
                fs.unlinkSync(path.join(testDir, file));
            }
            fs.rmdirSync(testDir);
        }
    } catch (e) {
        originalLog('Cleanup error:', e.message);
    }
}

const startTime = Date.now();
hub.watch(testDir, {msg: true, hubignore: false, alias: alias});

setTimeout(() => {
    originalLog('Starting to write files to ', testDir);
    for (let i = 0; i < numFiles; i++) {
        const filePath = path.join(testDir, `test_file_${i}.txt`);
        fs.writeFileSync(filePath, `Content for file ${i}`);
    }
}, 3000);

setTimeout(() => {
    originalLog('Benchmark timed out. Files processed:', filesProcessed);
    cleanup();
    process.exit(1);
}, 30000);
