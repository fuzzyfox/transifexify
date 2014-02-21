(function(window, document, undefined){
	var script = document.createElement('script');
		script.src = '{{server}}{{pathname}}/transifexify-bookmarklet.js';
		script.setAttribute('rel', 'transifexify');
	document.body.appendChild(script);
})(this, this.document);
