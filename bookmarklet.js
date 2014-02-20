(function(window, document, undefined){
	if(!window.transifexifyAdded){
		// add our css file to the document
		var link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = 'http://localhost:8000/transifexify.css';
		document.head.innerHTML = link.outerHTML + document.head.innerHTML;

		// add our wrapping code to body
		document.body.innerHTML = '<div id="transifexifyDocument">'+ document.body.innerHTML +'</div>';

		// inject sidebar
		document.body.innerHTML += '<div id="transifexify"><nav class="navbar navbar-inverse" role="navigation"><div class="navbar-header"><span class="navbar-brand">Transifexify</span></div><div style="height: 0px;padding: 0 15px 0 15px"><ul class="nav navbar-nav navbar-right"><li style="margin:0;"><a href="https://github.com/fuzzyfox/transifexify"><span class="fa fa-github"></span> fuzzyfox/transifexify</a></li></ul></div></nav><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Neque, cupiditate.</p><form action="#" class="form clearfix" id="transifexifyForm"></form></div>';

		// add transifexify sidebar js
		var script = document.createElement('script');
		script.src = 'http://localhost:8000/transifexify-sidebar.js';
		document.body.appendChild(script);
		window.transifexifyAdded = true;
	}
})(window, window.document);
