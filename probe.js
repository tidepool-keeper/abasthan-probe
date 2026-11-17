const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const port = Number(process.env.PORT) || 3000;
const base = process.env.HOME || "/home/abasthan";
const markFile = path.join(base, "persist-mark.txt");

function stamp() {
  const now = new Date().toISOString();
  fs.appendFileSync(markFile, now + "\n");
  console.log("[probe] " + now);
}
stamp();
setInterval(stamp, 5000);

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("probe alive since " + new Date(process.uptime() * 1000).toISOString() + "\n");
});
server.listen(port, "0.0.0.0", () => {
  console.log("[probe] listening on " + port);
});
