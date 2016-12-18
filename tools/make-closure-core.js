const compiler = require('google-closure-compiler-js').compile;
const fs = require('fs');

const source = fs.readFileSync('dist/global/RxFirebase.js', 'utf8');

const compilerFlags = {
  jsCode: [{src: source}],
  languageIn: 'ES5',
  createSourceMap: true,
};

const output = compiler(compilerFlags);

fs.writeFileSync('dist/global/RxFirebase.min.js', output.compiledCode, 'utf8');
fs.writeFileSync('dist/global/RxFirebase.min.js.map', output.sourceMap, 'utf8');
