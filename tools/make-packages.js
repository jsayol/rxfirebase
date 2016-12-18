const pkg = require('../package.json');
const fs = require('fs');
const mkdirp = require('mkdirp');
const licenseTool = require('./add-license-to-file');

// License info for minified files
const licenseUrl = 'https://github.com/jsayol/rxfirebase/blob/master/LICENSE.txt';
const license = 'Apache License 2.0 ' + licenseUrl;

delete pkg.files;
delete pkg.scripts;
delete pkg.devDependencies;

const cjsPkg = Object.assign(pkg, {
  name: 'rxfirebase',
  main: 'RxFirebase.js',
  typings: 'RxFirebase.d.ts'
});

// Change rxjs to be a peerDependency
cjsPkg.peerDependencies = Object.assign({}, cjsPkg.peerDependencies, {rxjs: cjsPkg.dependencies['rxjs']});
delete cjsPkg.dependencies['rxjs'];

mkdirp.sync('dist/cjs');
mkdirp.sync('dist/bundles');

// Package-related files
fs.writeFileSync('dist/cjs/package.json', JSON.stringify(cjsPkg, null, 2));
fs.writeFileSync('dist/cjs/LICENSE.txt', fs.readFileSync('./LICENSE.txt').toString());
fs.writeFileSync('dist/cjs/README.md', fs.readFileSync('./README.md').toString());

// Bundles
fs.writeFileSync('dist/bundles/RxFirebase.js', fs.readFileSync('dist/global/RxFirebase.js').toString());
fs.writeFileSync('dist/bundles/RxFirebase.js.map', fs.readFileSync('dist/global/RxFirebase.js.map').toString());
fs.writeFileSync('dist/bundles/RxFirebase.min.js', fs.readFileSync('dist/global/RxFirebase.min.js').toString());
fs.writeFileSync('dist/bundles/RxFirebase.min.js.map', fs.readFileSync('dist/global/RxFirebase.min.js.map').toString());

// Add licenses to tops of bundles
licenseTool.addLicenseToFile('LICENSE.txt', 'dist/bundles/RxFirebase.js');
licenseTool.addLicenseTextToFile(license, 'dist/bundles/RxFirebase.min.js');
