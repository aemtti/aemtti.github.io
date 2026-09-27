// Static server that mirrors GitHub Pages paths for local testing.
// Usage: node tools/serve.mjs [root] [port]
//   default root = the site repo root, port = 8787  →  http://127.0.0.1:8787/play/<slug>/
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(process.argv[2] || path.join(here, '..', '..'))
const port = Number(process.argv[3] || 8787)
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.htm': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.gif': 'image/gif', '.ico': 'image/x-icon', '.wasm': 'application/wasm', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg',
  '.wav': 'audio/wav', '.mp4': 'video/mp4', '.webm': 'video/webm', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8', '.data': 'application/octet-stream', '.glb': 'model/gltf-binary',
}

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  let f = path.join(root, p)
  if (!f.startsWith(root)) { res.writeHead(403).end(); return }
  try {
    if (fs.statSync(f).isDirectory()) {
      if (!p.endsWith('/')) { res.writeHead(301, { Location: p + '/' }).end(); return }
      f = path.join(f, 'index.html')
    }
    const st = fs.statSync(f)
    const type = TYPES[path.extname(f).toLowerCase()] || 'application/octet-stream'
    const range = req.headers.range
    if (range && /^bytes=\d*-\d*$/.test(range)) {
      let [a, b] = range.slice(6).split('-')
      const start = a ? Number(a) : st.size - Number(b), end = a && b ? Number(b) : st.size - 1
      res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${st.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 })
      fs.createReadStream(f, { start, end }).pipe(res)
      return
    }
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': st.size, 'Cache-Control': 'no-store', 'Accept-Ranges': 'bytes' })
    fs.createReadStream(f).pipe(res)
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('404 ' + p)
  }
})
server.listen(port, '127.0.0.1', () => console.log(`serving ${root} at http://127.0.0.1:${port}/`))
