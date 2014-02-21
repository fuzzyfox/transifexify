var fs = require('fs'),
	bookmarklet = fs.readFileSync('bookmarklet.js').toString();

bookmarklet = bookmarklet.replace(/\n[ \t]+/g, '\n');
bookmarklet = bookmarklet.replace(/[ \t]*\n/g, '');

fs.writeFileSync('bookmarklet.min.js', bookmarklet);
