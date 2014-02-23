var Transifexify = window.Transifexify = (function(window, document, undefined){

	var Transifexify = function(selector){
		return new Transifexify.prototype.init(selector);
	};

	Transifexify.version = '0.0.3';

	var namedNodes = {},
		allNodes   = [];

    // Array Remove - By John Resig (MIT Licensed)
	if(!Array.prototype.remove) Array.prototype.remove = function(from, to) {
		var rest = this.slice((to || from) + 1 || this.length);
		this.length = from < 0 ? this.length + from : from;
		return this.push.apply(this, rest);
	};

	/**
	 * Get all non-whitespace text nodes under a specified element
	 * @param  {Element} element    the Element to get textnodes from
	 * @param  {Array}   exemptions	Array of HTMLElements to remove from search
	 * @return {Array}              Array of text nodes
	 */
	Transifexify.getTextNodes = function(element, exemptions){
		var walk = document.createTreeWalker(element, window.NodeFilter.SHOW_TEXT, null, false),
			all  = [],
			node;

		while(node = walk.nextNode()){
			node.nodeValue = node.nodeValue.trim();

			if((node.nodeValue !== '') && (node.parentNode.nodeName !== 'SCRIPT')){
				all.push(node);
			}
		}

		return all;
	};

	Transifexify.fn = Transifexify.prototype = {
		init: function(selector){
			allNodes = Transifexify.getTextNodes(document.querySelector(selector));
		},

		/**
		 * Name text nodes for generation of nunjucks template file
		 *
		 * Additionally this adds nodes to an internal list of named nodes. This 
		 * can be accessed with `transifexify.getNamedNodes()`.
		 * @param  {Node}   nodeIndex   index (from allNodes) of the text node to name
		 * @param  {String} replacement replacement string for text node value
		 * @return {Node}               a reference to the node passed in
		 */
		nameNode: function(nodeIndex, replacement){
			var node = allNodes[nodeIndex];
			// check if we've already named this node, if so lets remove it
			// from the list of named nodes, and reset its value.
			this.unnameNode(nodeIndex);

			if(replacement.trim() !== ''){
				// add node to named nodes list
				namedNodes[replacement.trim()] = node.nodeValue;
				
				// update node value
				node.nodeValue = '{{ ' + replacement.trim() + ' }}';
			}
			
			return node.cloneNode();
		},

		/**
		 * Reset original node value, and remove from named nodes list.
		 * @param  {Node} nodeIndex index (from allNodes) of the node to reset + remove from list
		 * @return {Node}           reset node
		 */
		unnameNode: function(nodeIndex){
			var node     = allNodes[nodeIndex],
				nodeName = node.nodeValue.substr(3, node.nodeValue.length - 6);
			if(namedNodes.hasOwnProperty(nodeName)){
				var originalValue = namedNodes[nodeName];

				/*
				 before we remove this from the key:value from the named 
				 node list check there are no more nodes using it
				*/
				
				// start count at -1 as we want to count other nodes 
				// besides the one we know we have
				var nodeCount = -1;
				for(var i = 0, j = allNodes.length; i < j; i++){
					if(allNodes[i].nodeValue === nodeName) {
						nodeCount++;
					}
				}

				// if there is only this node w. the key:value remove
				// it from namedNodes
				if(nodeCount){
					delete namedNodes[nodeName];
				}

				// no matter what we do want to return the given node
				// back to its original value
				node.nodeValue = originalValue;
			}

			return node.cloneNode();
		},

		getNamedNodes: function(){
			return (JSON.parse(JSON.stringify(namedNodes)));
		},

		getAllNodes: function(){
			var rtn = [];

			allNodes.forEach(function(node){
				rtn.push(node.cloneNode());
			});

			return rtn;
		},

		getTemplateSource: function(){
			var source = document.documentElement.innerHTML;

				if(document.querySelector('#transifexify')){
					source = source.replace(document.body.innerHTML, document.querySelector('#transifexifyDocument').innerHTML);
					source = source.replace(document.querySelector('#transifexify').outerHTML, '');
				}

				source = source.replace(/<script(.*?)rel="transifexify"(.*?)>(.*?)<\/script>/, '');
				source = source.replace(/<link(.*?)href="(.*?)transifexify.css"(.*?)>/, '');
				source = '<html>' + source + '</html>';

			return source;
		},

		getTransifexJSON: function(){
			return JSON.stringify(this.getNamedNodes());
		}
	};

	// Extend the constructor to allow chaining methods to instances
	Transifexify.prototype.init.prototype = Transifexify.prototype;

	return Transifexify;
}(this, this.document));

/* jshint multistr: true */
(function(window, document, undefined){
	// prevent multiple instances of the sidebar
	if(window.TransifexifySidebar){
		return;
	}
	window.TransifexifySidebar = true;
	
	// Inject CSS
	var urlParser = document.createElement('a');
	urlParser.href = document.querySelector('script[rel="transifexify"]').src;

	var link = document.createElement('link');			
	link.href = '//' + urlParser.host + urlParser.pathname.substr(0, urlParser.pathname.lastIndexOf('/')) + '/transifexify.css';
	link.setAttribute('rel', 'stylesheet');

	document.head.insertBefore(link, document.head.firstChild);

	// Wrap body with custom DIV
	document.body.innerHTML = '<div id="transifexifyDocument">' + document.body.innerHTML + '</div>';

	// Inject sidebar HTML
	document.body.innerHTML += '<div id="transifexify">\
									<nav class="navbar navbar-inverse" role="navigation">\
										<div class="navbar-header">\
											<span class="navbar-brand">Transifexify</span>\
										</div>\
										<div style="height: 0px;padding: 0 15px 0 15px">\
											<ul class="nav navbar-nav navbar-right">\
												<li style="margin:0;">\
													<a href="https://github.com/fuzzyfox/transifexify">\
														<span class="fa fa-github"></span> fuzzyfox/transifexify\
													</a>\
												</li>\
											</ul>\
										</div>\
									</nav>\
									<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Neque, cupiditate.</p>\
									<form action="#" class="form clearfix" id="transifexifyForm"></form>\
								</div>';

	// Get own Transifexify object for use by sidebar
	var T    = new window.Transifexify('#transifexifyDocument'),
	// Get quick access to the form
		form = document.querySelector('#transifexifyForm');

	// Build form
	T.getAllNodes().forEach(function(node, idx){
		form.innerHTML += '<div class="form-group">\
								<input type="text" name="node-'+idx+'" class="form-control input-md"/>\
								<div class="nodeValue">'+node.nodeValue+'</div>\
							</div>';
	});
	form.innerHTML += '<button type="submit" class="btn btn-primary btn-lg pull-right">next</button>';

	// Add event listeners (delegation used)
	form.addEventListener('keyup', function(event){
		// deal with node naming (input fields)
		if(event.target.nodeName === 'INPUT'){
			var input = event.target,
				idx = parseInt(input.name.substr(5), 10);
			T.nameNode(idx, input.value.trim());
		}
	});
	form.addEventListener('submit', function(event){
		// stop form submit
		event.preventDefault();

		// update sidebar to show outputs
		form.innerHTML = '<div class="form-group">\
								<label for="" class="control-label"></label>\
								<textarea rows="10" name="transifexJSON" class="form-control input-md">'+ T.getTransifexJSON() +'</textarea>\
							</div>';
		form.innerHTML += '<div class="form-group">\
								<label for="" class="control-label"></label>\
								<textarea rows="10" name="transifexHTML" class="form-control input-md">'+ T.getTemplateSource() +'</textarea>\
							</div>';

		form.innerHTML += '<button id="transifexifyClose" class="btn btn-primary btn-lg pull-right">done</button>';

		// add listener to the done button
		document.querySelector('#transifexifyClose').addEventListener('click', function(){
			window.location.reload();
		});

		return false;
	});

})(this, this.document);

