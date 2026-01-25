const mongoose = require('mongoose');
const dns = require('dns');
const os = require('os');

const SRV_URI = "mongodb+srv://rahuldharwal12005:NGnxGTj49BC7q6NF@cluster0.zsby7hr.mongodb.net/FeedSnap?retryWrites=true&w=majority";
const STANDARD_URI = "mongodb://rahuldharwal12005:NGnxGTj49BC7q6NF@ac-gxiy-shard-00-00.zsby7hr.mongodb.net:27017,ac-gxiy-shard-00-01.zsby7hr.mongodb.net:27017,ac-gxiy-shard-00-02.zsby7hr.mongodb.net:27017/feedsnap?ssl=true&authSource=admin&retryWrites=true&w=majority";

console.log("--- NETWORK DIAGNOSTICS ---");
console.log(`Hostname: ${os.hostname()}`);
console.log(`Platform: ${os.platform()} ${os.release()}`);
const dnsServers = dns.getServers();
console.log(`Configured DNS Servers: ${JSON.stringify(dnsServers)}`);

async function testDNS(hostname, label) {
    console.log(`\nTesting DNS for ${label} (${hostname})...`);
    try {
        const addresses = await dns.promises.resolve(hostname);
        console.log(`✅ Success! Resolved to: ${JSON.stringify(addresses)}`);
        return true;
    } catch (err) {
        console.error(`❌ Failed: ${err.message}`);
        return false;
    }
}

async function testConnection(uri, label) {
    console.log(`\nTesting MongoDB Connection using ${label}...`);
    console.log(`URI: ${uri.split('@')[1]}`); // Log only non-sensitive part
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log("✅ Success! Connected to MongoDB.");
        await mongoose.disconnect();
    } catch (err) {
        console.error(`❌ Connection Failed: ${err.message}`);
        if (err.cause) console.error(`   Cause: ${err.cause}`);
    }
}

async function run() {
    // 1. Test Basic Internet
    await testDNS('google.com', 'Google');

    // 2. Test MongoDB Cluster DNS (SRV)
    await testDNS('_mongodb._tcp.cluster0.zsby7hr.mongodb.net', 'MongoDB SRV Record');

    // 3. Test Specific Shard DNS
    await testDNS('ac-gxiy-shard-00-00.zsby7hr.mongodb.net', 'MongoDB Shard 00');

    // 4. Test SRV Connection
    await testConnection(SRV_URI, "SRV String");

    // 5. Test Standard Connection
    await testConnection(STANDARD_URI, "Standard String");

    console.log("\n--- DIAGNOSTICS COMPLETE ---");
}

run();
