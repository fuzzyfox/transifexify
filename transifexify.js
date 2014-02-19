(function(window, document, undefined){

	// finds all text nodes in a given element and its children
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

	// get the selector for the element we want to prep for localization
	var selector = window.prompt('Enter a selector to Transifexify');

	// remove all whitespace from element to tidy results from textNodesUnder
	// of all the whitespace in source.
	document.querySelector(selector).innerHTML = document.querySelector(selector).innerHTML.replace(/\s+/g, ' ').trim();
	
	var nodes = [],
		transifexJSON = {},
		transifexHTML = '<html>';

	// get all text nodes for defined element
	nodes = textNodesUnder(document.querySelector(selector));

	// go through each text node we found and give it a sensible name, add 
	// the contents of that node to a JSON file as {name:node.nodeValue}, and 
	// swap the node value in the DOM for the name we gave it
	nodes.forEach(function(node, idx){
		transifexJSON['node' + idx + '-' + node.parentNode.localName] = node.nodeValue;
		node.nodeValue = '{{ node' + idx + '-' + node.parentNode.localName + ' }}';
	});

	// show transifex json file to user for saving
	window.showModalDialog('data:application/json;' + (window.btoa?'base64,'+btoa(JSON.stringify(transifexJSON)):JSON.stringify(transifexJSON)), null, 'center:1;dialogwidth:600;dialogheight:600');

	// strip out transifexify tag from document
	transifexHTML += document.documentElement.innerHTML.replace(/<script src="https?:\/\/(.*?)\/transifexify\.js"><\/script>/, '');
	transifexHTML += '</html>';

	// show modified HTML document source to user for saving
	window.showModalDialog('data:text/plain;' + (window.btoa?'base64,'+btoa(transifexHTML):transifexHTML), null, 'center:1;dialogwidth:600;dialogheight:600');
})(this, this.document);
