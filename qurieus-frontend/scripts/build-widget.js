const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Ensure the public directory exists
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Build the widget bundle
esbuild.build({
  entryPoints: ['src/components/ChatWidget/index.tsx'],
  bundle: true,
  minify: true,
  format: 'iife',
  globalName: 'ChatWidget',
  outfile: 'public/chat-widget.js',
  external: ['react', 'react-dom'],
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts',
    '.js': 'jsx',
    '.jsx': 'jsx',
    '.json': 'json',
    '.css': 'css',
  },
}).catch(() => process.exit(1));

// Copy the embed script
fs.copyFileSync(
  path.join(__dirname, '../public/chat-widget.js'),
  path.join(__dirname, '../public/chat-widget.embed.js')
); 