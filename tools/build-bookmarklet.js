var fs          = require('fs'),
	uglify      = require('uglify-js'),
	parts       = ['vendor/dom-TreeWalker-polyfill/src/TreeWalker-polyfill.js', './src/transifexify.js', './src/transifexify-sidebar.js'],
	bookmarklet = '';

parts.forEach(function(e, i, a){
	bookmarklet += fs.readFileSync(e).toString() + '\n';
});

fs.writeFileSync('transifexify-bookmarklet.js', bookmarklet);
fs.writeFileSync('transifexify-bookmarklet.min.js', uglify.minify(bookmarklet, {fromString: true}).code);
