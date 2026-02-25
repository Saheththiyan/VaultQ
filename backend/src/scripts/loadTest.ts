import http from 'http';

const CONCURRENCY = 100;
const HOST = process.env.SERVER_HOST || 'localhost';
const PORT = process.env.SERVER_PORT || '4000';
const EVENT_CODE = process.env.EVENT_CODE || 'TEST01';

function req(i: number): Promise<{ status: number; ms: number }> {
    return new Promise((resolve) => {
        const t = Date.now();
        const body = JSON.stringify({ content: `Load test question number ${i} - testing scalability` });
        const opts: http.RequestOptions = {
            hostname: HOST, port: PORT,
            path: `/api/events/${EVENT_CODE}/questions`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
        };
        const r = http.request(opts, (res) => {
            res.on('data', () => { }); res.on('end', () => resolve({ status: res.statusCode || 0, ms: Date.now() - t }));
        });
        r.on('error', () => resolve({ status: 0, ms: Date.now() - t }));
        r.write(body); r.end();
    });
}

async function run() {
    console.log(`🚀 Load test: ${CONCURRENCY} concurrent requests → event ${EVENT_CODE}`);
    const results = await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) => req(i + 1)));
    const ok = results.filter(r => r.status >= 200 && r.status < 300).length;
    const limited = results.filter(r => r.status === 429).length;
    const err = results.filter(r => r.status === 0 || r.status >= 500).length;
    const ms = results.map(r => r.ms);
    console.log(`\n📊 Results:`);
    console.log(`  ✅ 2xx:  ${ok}`);
    console.log(`  ⚠️  429:  ${limited}`);
    console.log(`  ❌ Err:  ${err}`);
    console.log(`  ⏱  Avg: ${Math.round(ms.reduce((a, b) => a + b, 0) / ms.length)}ms, Max: ${Math.max(...ms)}ms`);
}

run().catch(console.error);
