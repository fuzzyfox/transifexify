var fs          = require('fs'),
	parts       = ['./src/transifexify.js', './src/transifexify-sidebar.js'],
	bookmarklet = '';

parts.forEach(function(e, i, a){
	bookmarklet += fs.readFileSync(e).toString() + '\n';
});

fs.writeFileSync('transifexify-bookmarklet.js', bookmarklet);
