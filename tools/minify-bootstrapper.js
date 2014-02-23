var fs = require('fs'),
	bootstrapper = fs.readFileSync('bootstrapper.js').toString();

bootstrapper = bootstrapper.replace(/\n[ \t]+/g, '\n');
bootstrapper = bootstrapper.replace(/[ \t]*\n/g, '');

fs.writeFileSync('bootstrapper.min.js', bootstrapper);
