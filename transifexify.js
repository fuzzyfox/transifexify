// wicked closure pattern w/ hat tip to Paul Irish [source](https://gist.github.com/paulirish/315916)
(function(window, document, undefined){
	var textNodesUnder = function(element){
		var node,
			all  = [],
			walk = document.createTreeWalker(element, window.NodeFilter.SHOW_TEXT, null, false);

		while(node = walk.nextNode()){
			node.nodeValue = node.nodeValue.trim();
			if(node.nodeValue !== ''){
				all.push(node);
			}
		}

		return all;
	};

	var selector = window.prompt('Enter a selector to Transifexify');
	document.querySelector(selector).innerHTML = document.querySelector(selector).innerHTML.replace(/\s+/g, ' ').trim();

	var nodes = [],
		transifexJSON = {},
		transifexHTML = '';
	nodes = textNodesUnder(document.querySelector(selector));

	nodes.forEach(function(node, idx){
		transifexJSON['node' + idx + '-' + node.parentNode.localName] = node.nodeValue;
		node.nodeValue = '{{ node' + idx + '-' + node.parentNode.localName + ' }}';
	});

	console.log(transifexJSON);
	window.showModalDialog('data:application/json;' + (window.btoa?'base64,'+btoa(JSON.stringify(transifexJSON)):JSON.stringify(transifexJSON)), null, 'center:1;dialogwidth:600;dialogheight:600');

	transifexHTML = '<html>' + document.documentElement.innerHTML.replace(/<script src="https?:\/\/(.*?)\/transifexify\.js"><\/script>/, '') + '</html>';

	window.showModalDialog('data:text/plain;' + (window.btoa?'base64,'+btoa(transifexHTML):transifexHTML), null, 'center:1;dialogwidth:600;dialogheight:600');
})(this, this.document);
