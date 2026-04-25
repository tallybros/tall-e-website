const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'dist');

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const MOCK_SETTINGS = {
  model: 'claude-sonnet-4-6',
  brands: [
    { id: 'brand-a', name: 'Fintech startup', description: 'Bold fintech energy.\nDirect.', guide: 'Be direct.', presets: ['What can you help with?', 'Tell me about pricing'], hidden: false },
    { id: 'brand-b', name: 'Wellness brand', description: 'Warm and grounded.', guide: 'Be warm.', presets: ['How do I start?', 'What do you offer?'], hidden: false },
    { id: 'brand-c', name: 'B2B SaaS', description: 'Straight-talking.', guide: 'Focus on ROI.', presets: ['What is your ROI?', 'Book a demo'], hidden: false },
  ],
};

function start(port) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = req.url.split('?')[0];

      if (url.startsWith('/api/settings')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(MOCK_SETTINGS));
        return;
      }
      if (url.startsWith('/api/generate')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ text: 'Mocked response.', model: 'mock', tokens: 4 }));
        return;
      }

      let filePath = path.join(DIST, url === '/' ? 'index.html' : url);
      if (!filePath.startsWith(DIST)) filePath = path.join(DIST, 'index.html');
      const hasExt = path.extname(url) !== '';

      fs.stat(filePath, (err, stat) => {
        if (err || !stat.isFile()) {
          // Missing asset with extension → real 404 (don't mask with index.html).
          // Extensionless URL → SPA route, fall back to index.html.
          if (hasExt) { res.writeHead(404); res.end(); return; }
          filePath = path.join(DIST, 'index.html');
        }
        fs.readFile(filePath, (readErr, data) => {
          if (readErr) { res.writeHead(500); res.end(); return; }
          res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
          res.end(data);
        });
      });
    });
    server.listen(port, () => resolve(server));
    server.on('error', reject);
  });
}

module.exports = { start };
