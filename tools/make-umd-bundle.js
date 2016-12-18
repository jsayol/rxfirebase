const rollup = require('rollup');
const fs = require('fs');
// const path = require('path');
const nodeResolve =require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

rollup.rollup({
  entry: 'dist/es6/index.js',
  plugins: [
    commonjs(),
    nodeResolve({ jsnext: true, main: true, browser: true })
  ]
}).then(function (bundle) {
  const result = bundle.generate({
    format: 'umd',
    moduleName: 'RxFirebase',
    sourceMap: true
  });
  // const tslib = fs.readFileSync(path.join(process.cwd() + '/node_modules/tslib/tslib.js'), 'utf8');

  // fs.writeFileSync('dist/global/RxFirebase.js', tslib.toString() + result.code);
  fs.writeFileSync('dist/global/RxFirebase.js', result.code);
  fs.writeFileSync('dist/global/RxFirebase.js.map', result.map);
});
