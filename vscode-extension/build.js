const esbuild = require('esbuild');
const process = require('process');
const fs = require('fs');

const watch = process.argv.includes('--watch');

const buildOptions = {
  entryPoints: ['src/extension.ts'],
  bundle: true,
  external: ['vscode'],
  format: 'cjs',
  target: 'node16',
  outfile: 'dist/extension.js',
  sourcemap: true,
  platform: 'node',
};

async function build() {
  if (watch) {
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    console.log('Watching for changes...');
  } else {
    await esbuild.build(buildOptions);
    console.log('Build complete!');
  }
}

build().catch(console.error);
