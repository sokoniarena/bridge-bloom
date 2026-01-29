const fs = require('fs');
const path = require('path');

const filesToCopy = [
  'sitemap.xml',
  'robots.txt',
  'favicon.ico',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'pwa-192x192.png',
  'pwa-512x512.png'
];

filesToCopy.forEach(file => {
  const source = path.join(__dirname, '..', 'public', file);
  const dest = path.join(__dirname, '..', 'dist', file);
  
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, dest);
    console.log(`✅ Copied: ${file}`);
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});