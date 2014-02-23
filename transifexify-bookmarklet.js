/**
 * JavaScript implementation of W3 DOM4 TreeWalker interface.
 *
 * See also:
 * - http://www.w3.org/TR/dom/#interface-treewalker
 * - http://www.w3.org/TR/dom/#dom-document-createtreewalker
 *
 * Attributes like "read-only" and "private" are ignored in this implementation
 * due to ECMAScript 3 (as opposed to ES5) not supporting creation of such properties.
 * There are workarounds, but under "keep it simple" and "don't do stupid things" they
 * are ignored in this implementation.
 */
(function (win, doc) {
	var TreeWalker, NodeFilter, create, toString, is, mapChild, mapSibling,
		traverseChildren, traverseSiblings, nextSkippingChildren;

	if (doc.createTreeWalker) {
		return;
	}

	/* Cross-browser polyfill for these constants */

	NodeFilter = {
		// Constants for acceptNode()
		FILTER_ACCEPT: 1,
		FILTER_REJECT: 2,
		FILTER_SKIP: 3,

		// Constants for whatToShow
		SHOW_ALL: 0xFFFFFFFF,
		SHOW_ELEMENT: 0x1,
		SHOW_ATTRIBUTE: 0x2, // historical
		SHOW_TEXT: 0x4,
		SHOW_CDATA_SECTION: 0x8, // historical
		SHOW_ENTITY_REFERENCE: 0x10, // historical
		SHOW_ENTITY: 0x20, // historical
		SHOW_PROCESSING_INSTRUCTION: 0x40,
		SHOW_COMMENT: 0x80,
		SHOW_DOCUMENT: 0x100,
		SHOW_DOCUMENT_TYPE: 0x200,
		SHOW_DOCUMENT_FRAGMENT: 0x400,
		SHOW_NOTATION: 0x800 // historical
	};

	win.NodeFilter = win.NodeFilter || (NodeFilter.constructor = NodeFilter.prototype = NodeFilter);

	/*
	// FYI only, not used
	Node = {
		ELEMENT_NODE: 1,
		ATTRIBUTE_NODE: 2, // historical
		TEXT_NODE: 3,
		CDATA_SECTION_NODE: 4, // historical
		ENTITY_REFERENCE_NODE: 5, // historical
		ENTITY_NODE: 6, // historical
		PROCESSING_INSTRUCTION_NODE: 7,
		COMMENT_NODE: 8,
		DOCUMENT_NODE: 9,
		DOCUMENT_TYPE_NODE: 10,
		DOCUMENT_FRAGMENT_NODE: 11,
		NOTATION_NODE: 12 // historical
	};
	*/

	/* Local utilities */

	create = Object.create || function (proto) {
		function Empty() {}
		Empty.prototype = proto;
		return new Empty();
	};

	mapChild = {
		first: 'firstChild',
		last: 'lastChild',
		next: 'firstChild',
		previous: 'lastChild'
	};

	mapSibling = {
		next: 'nextSibling',
		previous: 'previousSibling'
	};

	toString = mapChild.toString;

	is = function (x, type) {
		return toString.call(x).toLowerCase() === '[object ' + type.toLowerCase() + ']';
	};

	/* Private methods and helpers */

	/**
	 * @spec http://www.w3.org/TR/dom/#concept-traverse-children
	 * @method
	 * @access private
	 * @param {TreeWalker} tw
	 * @param {string} type One of 'first' or 'last'.
	 * @return {Node|null}
	 */
	traverseChildren = function (tw, type) {
		var child, node, parent, result, sibling;
		node = tw.currentNode[mapChild[type]];
		while (node !== null) {
			result = tw.filter.acceptNode(node);
			if (result === NodeFilter.FILTER_ACCEPT) {
				tw.currentNode = node;
				return node;
			}
			if (result === NodeFilter.FILTER_SKIP) {
				child = node[mapChild[type]];
				if (child !== null) {
					node = child;
					continue;
				}
			}
			while (node !== null) {
				sibling = node[mapChild[type]];
				if (sibling !== null) {
					node = sibling;
					break;
				}
				parent = node.parentNode;
				if (parent === null || parent === tw.root || parent === tw.currentNode) {
					return null;
				} else {
					node = parent;
				}
			}
		}
		return null;
	};

	/**
	 * @spec http://www.w3.org/TR/dom/#concept-traverse-siblings
	 * @method
	 * @access private
	 * @param {TreeWalker} tw
	 * @param {TreeWalker} type One of 'next' or 'previous'.
	 * @return {Node|nul}
	 */
	traverseSiblings = function (tw, type) {
		var node, result, sibling;
		node = tw.currentNode;
		if (node === tw.root) {
			return null;
		}
		while (true) {
			sibling = node[mapSibling[type]];
			while (sibling !== null) {
				node = sibling;
				result = tw.filter.acceptNode(node);
				if (result === NodeFilter.FILTER_ACCEPT) {
					tw.currentNode = node;
					return node;
				}
				sibling = node[mapChild[type]];
				if (result === NodeFilter.FILTER_REJECT) {
					sibling = node[mapSibling[type]];
				}
			}
			node = node.parentNode;
			if (node === null || node === tw.root) {
				return null;
			}
			if (tw.filter.acceptNode(node) === NodeFilter.FILTER_ACCEPT) {
				return null;
			}
		}
	};

	/**
	 * @based on WebKit's NodeTraversal::nextSkippingChildren
	 * https://trac.webkit.org/browser/trunk/Source/WebCore/dom/NodeTraversal.h?rev=137221#L103
	 */
	nextSkippingChildren = function (node, stayWithin) {
		if (node === stayWithin) {
			return null;
		}
		if (node.nextSibling !== null) {
			return node.nextSibling;
		}

		/**
		 * @based on WebKit's NodeTraversal::nextAncestorSibling
		 * https://trac.webkit.org/browser/trunk/Source/WebCore/dom/NodeTraversal.cpp?rev=137221#L43
		 */
		while (node.parentNode !== null) {
			node = node.parentNode;
			if (node === stayWithin) {
				return null;
			}
			if (node.nextSibling !== null) {
				return node.nextSibling;
			}
		}
		return null;
	};

	/* Public API */

	/**
	 * Implemented version: http://www.w3.org/TR/DOM-Level-2-Traversal-Range/traversal.html#Traversal-TreeWalker
	 * Latest version: http://www.w3.org/TR/dom/#interface-treewalker
	 *
	 * @constructor
	 * @param {Node} root
	 * @param {number} whatToShow [optional]
	 * @param {Function} filter [optional]
	 * @throws Error
	 */
	TreeWalker = function (root, whatToShow, filter) {
		var tw = this, active = false;

		if (!root || !root.nodeType) {
			throw new Error('DOMException: NOT_SUPPORTED_ERR');
		}

		tw.root = root;
		tw.whatToShow = Number(whatToShow) || 0;

		tw.currentNode = root;

		if (!is(filter, 'function')) {
			filter = null;
		}

		tw.filter = create(win.NodeFilter.prototype);

		/**
		 * @method
		 * @param {Node} node
		 * @return {Number} Constant NodeFilter.FILTER_ACCEPT,
		 *  NodeFilter.FILTER_REJECT or NodeFilter.FILTER_SKIP.
		 */
		tw.filter.acceptNode = function (node) {
			var result;
			if (active) {
				throw new Error('DOMException: INVALID_STATE_ERR');
			}

			// Maps nodeType to whatToShow
			if (!(((1 << (node.nodeType - 1)) & tw.whatToShow))) {
				return NodeFilter.FILTER_SKIP;
			}

			if (filter === null) {
				return NodeFilter.FILTER_ACCEPT;
			}

			active = true;
			result = filter(node);
			active = false;

			return result;
		};
	};

	TreeWalker.prototype = {

		constructor: TreeWalker,

		/**
		 * @spec http://www.w3.org/TR/dom/#dom-treewalker-parentnode
		 * @method
		 * @return {Node|null}
		 */
		parentNode: function () {
			var node = this.currentNode;
			while (node !== null && node !== this.root) {
				node = node.parentNode;
				if (node !== null && this.filter.acceptNode(node) === NodeFilter.FILTER_ACCEPT) {
					this.currentNode = node;
					return node;
				}
			}
			return null;
		},

		/**
		 * @spec http://www.w3.org/TR/dom/#dom-treewalker-firstchild
		 * @method
		 * @return {Node|null}
		 */
		firstChild: function () {
			return traverseChildren(this, 'first');
		},

		/**
		 * @spec http://www.w3.org/TR/dom/#dom-treewalker-lastchild
		 * @method
		 * @return {Node|null}
		 */
		lastChild: function () {
			return traverseChildren(this, 'last');
		},

		/**
		 * @spec http://www.w3.org/TR/dom/#dom-treewalker-previoussibling
		 * @method
		 * @return {Node|null}
		 */
		previousSibling: function () {
			return traverseSiblings(this, 'previous');
		},

		/**
		 * @spec http://www.w3.org/TR/dom/#dom-treewalker-nextsibling
		 * @method
		 * @return {Node|null}
		 */
		nextSibling: function () {
			return traverseSiblings(this, 'next');
		},

		/**
		 * @spec http://www.w3.org/TR/dom/#dom-treewalker-previousnode
		 * @method
		 * @return {Node|null}
		 */
		previousNode: function () {
			var node, result, sibling;
			node = this.currentNode;
			while (node !== this.root) {
				sibling = node.previousSibling;
				while (sibling !== null) {
					node = sibling;
					result = this.filter.acceptNode(node);
					while (result !== NodeFilter.FILTER_REJECT && node.lastChild !== null) {
						node = node.lastChild;
						result = this.filter.acceptNode(node);
					}
					if (result === NodeFilter.FILTER_ACCEPT) {
						this.currentNode = node;
						return node;
					}
				}
				if (node === this.root || node.parentNode === null) {
					return null;
				}
				node = node.parentNode;
				if (this.filter.acceptNode(node) === NodeFilter.FILTER_ACCEPT) {
					this.currentNode = node;
					return node;
				}
			}
			return null;
		},

		/**
		 * @spec http://www.w3.org/TR/dom/#dom-treewalker-nextnode
		 * @method
		 * @return {Node|null}
		 */
		nextNode: function () {
			var node, result, following;
			node = this.currentNode;
			result = NodeFilter.FILTER_ACCEPT;

			while (true) {
				while (result !== NodeFilter.FILTER_REJECT && node.firstChild !== null) {
					node = node.firstChild;
					result = this.filter.acceptNode(node);
					if (result === NodeFilter.FILTER_ACCEPT) {
						this.currentNode = node;
						return node;
					}
				}
				following = nextSkippingChildren(node, this.root);
				if (following !== null) {
					node = following;
				} else {
					return null;
				}
				result = this.filter.acceptNode(node);
				if (result === NodeFilter.FILTER_ACCEPT) {
					this.currentNode = node;
					return node;
				}
			}
		}
	};

	if (false) {

		/**
		 * @based on WebKit's TreeWalker::nextNode
		 * https://trac.webkit.org/browser/trunk/Source/WebCore/dom/TreeWalker.cpp?rev=137221#L253
		 *
		 * @method
		 * @return {Node|null}
		 */
		TreeWalker.prototype.nextNode = function () {
			var node, result;
			node = this.currentNode;

			children:
			while (true) {
				while (node.firstChild !== null) {
					node = node.firstChild;
					result = this.filter.acceptNode(node);
					if (result === NodeFilter.FILTER_ACCEPT) {
						this.currentNode = node;
						return node;
					}
					if (result === NodeFilter.FILTER_REJECT) {
						break;
					}
				}

				while ((node = nextSkippingChildren(node, this.root)) !== null) {
					result = this.filter.acceptNode(node);
					if (result === NodeFilter.FILTER_ACCEPT) {
						this.currentNode = node;
						return node;
					}
					if (result === NodeFilter.FILTER_SKIP) {
						continue children;
					}
				}
				break;
			}

			return null;
		};

	}

	/**
	 * @spec http://www.w3.org/TR/dom/#dom-document-createtreewalker
	 * @param {Node} root
	 * @param {number} [whatToShow=NodeFilter.SHOW_ALL]
	 * @param {Function|Object} [filter=null]
	 * @return {TreeWalker}
	 */
	doc.createTreeWalker = function (root, whatToShow, filter) {
		whatToShow = whatToShow === undefined ? NodeFilter.SHOW_ALL : whatToShow;

		if (filter && is(filter.acceptNode, 'function')) {
			filter = filter.acceptNode;
		// Support Gecko-ism of filter being a function.
		// https://developer.mozilla.org/en-US/docs/DOM/document.createTreeWalker
		} else if (!is(filter, 'function')) {
			filter = null;
		}

		return new TreeWalker(root, whatToShow, filter);
	};

}(window, document));

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

