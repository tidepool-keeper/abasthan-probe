const fs = require("node:fs");
const path = require("node:path");

function stamp() {
  const now = new Date().toISOString();
  const base = process.env.HOME || "/home/abasthan";
  const file = path.join(base, "abathon-persist-mark.txt");
  fs.appendFileSync(file, now + "\n");
  console.log("[abathon] " + now + " cwd=" + process.cwd());
}

stamp();
setInterval(stamp, 5000);
console.log("[abathon] abathon worker started (5s interval)");
