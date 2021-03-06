/* global ActiveXObject */

/**
 * Transifexify
 * 
 * A small utility library for manipulating TextNodes to create nunjucks 
 * key:value JSON files, and their associated html template files.
 *
 * Primarily intended to help convert static webpages into localizable 
 * pages. i.e. Webmaker Teaching Kits + Activities
 *
 * @author William Duyck wduyck@mozillafoundation.org
 * @license	Mozilla Public License, version 2.0
 */

// ------------------------------------------------------------------------- //


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
	 * simple XHR wrapper
	 * @param  {Object} config basic settings for the call
	 * @return {Void}
	 */
	var ajax = function(config, async){
		var xhr,
			url = config.url,
			method = config.method || 'GET',
			success = config.success || function(){},
			error = config.error || function(){};

		try {
			xhr = new XMLHttpRequest();
		}
		catch(e) {
			xhr = new ActiveXObject('Msxml2.XMLHTTP');
		}

		if(typeof async === 'undefined'){
			async = true;
		}

		xhr.onreadystatechange = function(){
			if(xhr.readyState === 4){
				if(xhr.status === 200){
					success.call(null, xhr);
				}
				else {
					error.call(null, xhr);
				}
			}
		};

		xhr.open(method, url, async);
		xhr.send(null);

		return xhr;
	};

	/**
	 * Get all non-whitespace text nodes under a specified element
	 * @param  {Element} element    the Element to get textnodes from
	 * @param  {Array}   exemptions	Array of HTMLElements to remove from search
	 * @return {Array}              Array of text nodes
	 *
	 * TODO:
	 *  + make exemptions do something ;)
	 *  + improve the whitespace ignoring condition
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

		/**
		 * Get a copy of all the named nodes
		 * @return {Object} a copy of the named nodes internal object
		 */
		getNamedNodes: function(){
			return (JSON.parse(JSON.stringify(namedNodes)));
		},

		/**
		 * Get a copy of all the nodes Transifexify cares about
		 * @return {Array} array of cloned nodes
		 */
		getAllNodes: function(){
			var rtn = [];

			allNodes.forEach(function(node){
				rtn.push(node.cloneNode());
			});

			return rtn;
		},

		/**
		 * get the original source of the current page
		 * @return {String} html source
		 */
		getOriginalSource: function(){
			var rtn = false;
			ajax({
				url: window.location.href,
				success: function(xhr){
					rtn = xhr.responseText;
				}
			}, false);

			return rtn;
		},

		/**
		 * Get the nunjucks template file
		 * @return {String} HTML source for the nunjucks template
		 */
		getTemplateSource: function(){
			// get rendered source
			var source = document.documentElement.innerHTML;

				// remove transifexify added sidebar if exists
				if(document.querySelector('#transifexify')){
					source = source.replace(document.body.innerHTML, document.querySelector('#transifexifyDocument').innerHTML);
					source = source.replace(document.querySelector('#transifexify').outerHTML, '');
				}

				// remove transifexify from the source
				source = source.replace(/<script(.*?)rel="transifexify"(.*?)>(.*?)<\/script>/, '');
				source = source.replace(/<link(.*?)href="(.*?)transifexify.css"(.*?)>/, '');
				
				// get the doctype declaration.
				var doctype = this.getOriginalSource().match(/<!DOCTYPE((.|\n|\r)*?)>/i);
				console.log(doctype);

				source = (doctype[0] || '') + '<html>' + source + '</html>';

			return source;
		},

		/**
		 * Get the JSON key:value file used by Transifex/nunjucks
		 * @return {String} JSON key:value file for document's strings
		 */
		getTransifexJSON: function(){
			return JSON.stringify(this.getNamedNodes());
		}
	};

	// Extend the constructor to allow chaining methods to instances
	Transifexify.prototype.init.prototype = Transifexify.prototype;

	return Transifexify;
}(this, this.document));
