const fs = require('fs');
const Gun = require('./index');

function measureSync() {
    const gun = Gun({file: false, radisk: false, localStorage: false});
    const start = process.hrtime.bigint();
    for (let i = 0; i < 1000; i++) {
        const data = fs.readFileSync('lib/hub.js', 'utf8');
        gun.get('test').get(i).put(data);
    }
    const end = process.hrtime.bigint();
    console.log(`Sync read took: ${Number(end - start) / 1000000} ms`);
}

async function measureAsync() {
    const gun = Gun({file: false, radisk: false, localStorage: false});
    const start = process.hrtime.bigint();
    const promises = [];
    for (let i = 0; i < 1000; i++) {
        promises.push(fs.promises.readFile('lib/hub.js', 'utf8').then(data => {
            gun.get('test').get(i).put(data);
        }));
    }
    await Promise.all(promises);
    const end = process.hrtime.bigint();
    console.log(`Async read took: ${Number(end - start) / 1000000} ms`);
}

(async () => {
    measureSync();
    await measureAsync();
    process.exit(0);
})();
