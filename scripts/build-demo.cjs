const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');

async function build() {
  const output = path.resolve(__dirname, '../public/demo');
  fs.mkdirSync(output, { recursive: true });
  fs.copyFileSync(path.resolve(__dirname, '../frontend/index.html'), path.join(output, 'index.html'));
  const vendor = path.join(output, 'vendor');
  fs.mkdirSync(vendor, { recursive: true });
  for (const [source, name] of [
    ['bootstrap/dist/css/bootstrap.min.css', 'bootstrap.min.css'],
    ['jquery/dist/jquery.slim.min.js', 'jquery.slim.min.js'],
    ['bootstrap/dist/js/bootstrap.bundle.min.js', 'bootstrap.bundle.min.js'],
  ]) fs.copyFileSync(require.resolve(source), path.join(vendor, name));
  const icons = path.dirname(require.resolve('open-iconic/package.json'));
  fs.cpSync(path.join(icons, 'font'), path.join(vendor, 'icons'), { recursive: true });
  await esbuild.build({
    entryPoints: [path.resolve(__dirname, '../frontend/index.js')],
    bundle: true,
    outdir: path.join(output, 'assets'),
    publicPath: '/demo/assets',
    loader: { '.js': 'jsx', '.jpg': 'file' },
    define: { 'process.env.NODE_ENV': '"production"' },
    minify: true,
  });
  console.log('Demo built at public/demo');
}
build().catch(error => { console.error(error); process.exitCode = 1; });
