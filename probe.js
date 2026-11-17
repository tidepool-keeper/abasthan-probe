const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const port = Number(process.env.PORT) || 3000;
const markFile = path.join(process.env.HOME || "/home/abasthan", "persist-mark.txt");
const bootAt = new Date().toISOString();

function append() { try { fs.appendFileSync(markFile, new Date().toISOString() + "\n"); } catch (e) {} }
append(); setInterval(append, 10000);

http.createServer((req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  if (new URL(req.url, "http://x").pathname === "/mark") {
    let lines = 0, first = "?";
    try {
      const c = fs.readFileSync(markFile, "utf8").trim().split("\n").filter(Boolean);
      lines = c.length; first = c[0];
    } catch (e) {}
    return res.end(`booted_at=${bootAt}\nfirst_line=${first}\nline_count=${lines}\n`);
  }
  res.end(`ok booted_at=${bootAt}\n`);
}).listen(port, "0.0.0.0", () => console.log("[probe] listening " + port + " boot " + bootAt));
