const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const port = Number(process.env.PORT) || 3000;
const base = process.env.HOME || "/home/abasthan";
const markFile = path.join(base, "persist-mark.txt");

const bootAt = new Date().toISOString();
const bootEpoch = Math.floor(Date.now() / 1000);

function append() {
  fs.appendFileSync(markFile, new Date().toISOString() + "\n");
}
append();
setInterval(append, 5000);

const server = http.createServer((req, res) => {
  if (req.url === "/mark") {
    let content = "(no file)";
    let lines = 0;
    try {
      content = fs.readFileSync(markFile, "utf8");
      lines = content.trim().split("\n").filter(Boolean).length;
    } catch (e) {
      content = "(missing: " + e.code + ")";
    }
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(
      "booted_at=" + bootAt + "\n" +
      "first_line=" + content.split("\n")[0] + "\n" +
      "last_line=" + content.trim().split("\n").slice(-1)[0] + "\n" +
      "line_count=" + lines + "\n" +
      "mark_file=" + markFile + "\n" +
      "home=" + base + "\n" +
      "cwd=" + process.cwd() + "\n"
    );
    return;
  }
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("ok booted_at=" + bootAt + "\n");
});

server.listen(port, "0.0.0.0", () => console.log("[probe] listening " + port));
