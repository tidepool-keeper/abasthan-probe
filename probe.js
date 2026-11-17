{
  "name": "abasthan-probe",
  "version": "1.0.0",
  "private": true,
  "engines": { "node": ">=18" },
  "scripts": { "start": "node probe.js" }
}


const fs = require("node:fs");
const path = require("node:path");

function stamp() {
  const now = new Date().toISOString();
  const base = process.env.HOME || "/home/abasthan";
  const file = path.join(base, "abasthan-persist-mark.txt");
  fs.appendFileSync(file, `${now}\n`);
  console.log(`[probe] ${now} cwd=${process.cwd()}`);
}

stamp();
setInterval(stamp, 5000);
console.log("[probe] probe worker started (5s interval)");
