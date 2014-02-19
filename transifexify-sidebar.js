(function(window, document, undefined){
	// finds all text nodes in a given element and its children
	var textNodesUnder = function(element){
		var node,
			all  = [],
			walk = document.createTreeWalker(element, window.NodeFilter.SHOW_TEXT, null, false);

		while(node = walk.nextNode()){
			node.nodeValue = node.nodeValue.trim();
			if((node.nodeValue !== '') && (node.parentNode.nodeName !== 'SCRIPT')){
				all.push(node);
			}
		}

		return all;
	};

	// get the selector for the element we want to prep for localization
	var selector = '#transifexifyDocument';

	document.querySelector(selector).innerHTML = document.querySelector(selector).innerHTML.replace(/<script(.*?)>(.*?)<\/script>/g, '');

	// remove all whitespace from element to tidy results from textNodesUnder
	// of all the whitespace in source.
	document.querySelector(selector).innerHTML = document.querySelector(selector).innerHTML.replace(/\s+/g, ' ').trim();

	var nodes = [],
		form  = document.querySelector('#transifexifyForm'),
		transifexJSON = {},
		transifexHTML = '';

	// get all text nodes for defined element
	nodes = textNodesUnder(document.querySelector(selector));

	// go through each text node we found and give it a sensible name, add 
	// the contents of that node to a JSON file as {name:node.nodeValue}, and 
	// swap the node value in the DOM for the name we gave it
	nodes.forEach(function(node, idx){
		form.innerHTML += '<div class="form-group">\
								<input type="text" name="node-'+idx+'" class="form-control input-md"/>\
								<div class="nodeValue">'+node.nodeValue+'</div>\
							</div>';
	});

	// add next button
	form.innerHTML += '<button type="submit" class="btn btn-primary btn-lg pull-right">next</button>';

	// add listeners to each new form element to modify DOM with string names when entered
	var inputs = document.querySelectorAll('#transifexifyForm input[name^=node-]');
	Array.prototype.filter.call(inputs, function(input){
		input.addEventListener('keyup', function(e){
			var idx = parseInt(this.name.substr(5), 10);
			if(this.value.trim() !== ''){
				nodes[idx].nodeValue = '{{ ' + this.value.trim() + ' }}';
			}
			else {
				nodes[idx].nodeValue = this.nextElementSibling.innerHTML;
			}
		});
	});

	// add listener to form submit
	form.addEventListener('submit', function(e){
		// stop form submit
		e.preventDefault();

		Array.prototype.filter.call(inputs, function(input){
			if(input.value.trim() !== ''){
				transifexJSON[input.value.trim()] = input.nextElementSibling.innerHTML;
			}
		});

		// remove transifexify added content
		transifexHTML = document.documentElement.innerHTML.replace(/<script src="http(s?):\/\/(.*?)\/transifexify-sidebar\.js"><\/script>/, '');
		transifexHTML = document.documentElement.innerHTML.replace(/<link href="http(s?):\/\/(.*?)\/transifexify\.css" rel="stylesheet">/, '');
		transifexHTML = document.documentElement.innerHTML.replace(document.querySelector('#transifexify').outerHTML, '');
		transifexHTML = document.documentElement.innerHTML.replace(document.body.innerHTML, document.querySelector('#transifexifyDocument').innerHTML);
		preFinishTransifexHTML = transifexHTML; // for close function
		transifexHTML = '<html>' + transifexHTML + '</html>';

		form.innerHTML = '<div class="form-group">\
								<label for="" class="control-label"></label>\
								<textarea rows="10" name="transifexJSON" class="form-control input-md">'+ JSON.stringify(transifexJSON) +'</textarea>\
							</div>';
		form.innerHTML += '<div class="form-group">\
								<label for="" class="control-label"></label>\
								<textarea rows="10" name="transifexHTML" class="form-control input-md">'+ transifexHTML +'</textarea>\
							</div>';

		form.innerHTML += '<button id="transifexifyClose" class="btn btn-primary btn-lg pull-right">done</button>';

		document.querySelector('#transifexifyClose').addEventListener('click', function(){
			window.location.reload();
		});
		return false;
	});
})(this, this.document);
