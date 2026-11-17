const http = require("node:http");
const net = require("node:net");
const fs = require("node:fs");
const path = require("node:path");

const port = Number(process.env.PORT) || 3000;
const markFile = path.join(process.env.HOME || "/home/abasthan", "persist-mark.txt");
const bootAt = new Date().toISOString();

function append() { try { fs.appendFileSync(markFile, new Date().toISOString() + "\n"); } catch (e) {} }
append(); setInterval(append, 10000);

// 出网测试：raw TCP 连任意 host:port
function tcpTest(host, tport, timeout = 8000) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const sock = new net.Socket();
    let done = false;
    const finish = (ok, msg) => {
      if (done) return; done = true;
      try { sock.destroy(); } catch (e) {}
      resolve({ ok, ms: Date.now() - t0, msg });
    };
    sock.setTimeout(timeout);
    sock.on("connect", () => finish(true, "connected"));
    sock.on("timeout", () => finish(false, "timeout"));
    sock.on("error", (e) => finish(false, e.code || e.message));
    try { sock.connect(tport, host); } catch (e) { finish(false, String(e.message)); }
  });
}

// 出网测试：HTTP GET
async function httpTest(url, timeout = 10000) {
  const t0 = Date.now();
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), timeout);
    const r = await fetch(url, { signal: ctl.signal });
    clearTimeout(t);
    const body = (await r.text()).slice(0, 120);
    return { ok: true, ms: Date.now() - t0, status: r.status, body };
  } catch (e) {
    return { ok: false, ms: Date.now() - t0, msg: String(e.message).slice(0, 120) };
  }
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, "http://x");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");

  if (u.pathname === "/mark") {
    let lines = 0, first = "?";
    try {
      const c = fs.readFileSync(markFile, "utf8").trim().split("\n").filter(Boolean);
      lines = c.length; first = c[0];
    } catch (e) {}
    return res.end(`booted_at=${bootAt}\nfirst_line=${first}\nline_count=${lines}\n`);
  }

  if (u.pathname === "/tcp") {
    const host = u.searchParams.get("host");
    const p = Number(u.searchParams.get("port") || 443);
    if (!host) return res.end("need host");
    const r = await tcpTest(host, p);
    return res.end(`tcp ${host}:${p} -> ok=${r.ok} ms=${r.ms} ${r.msg || ""}\n`);
  }

  if (u.pathname === "/http") {
    const url = u.searchParams.get("url");
    if (!url) return res.end("need url");
    const r = await httpTest(url);
    return res.end(`http ${url} -> ok=${r.ok} ms=${r.ms} status=${r.status || ""} ${r.body || r.msg || ""}\n`);
  }

  res.end(`ok booted_at=${bootAt}\n`);
});

server.listen(port, "0.0.0.0", () => console.log("[probe] listening " + port + " boot " + bootAt));
