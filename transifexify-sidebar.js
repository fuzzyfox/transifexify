/* jshint multistr: true */
(function(window, document, undefined){
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
	var T    = new window.Transifexify('body'),
	// Get quick access to the form
		form = document.querySelector('#transifexifyForm');

	// Build form
	T.getAllNodes().forEach(function(node, idx){
		console.log(node);
		form.innerHTML += '<div class="form-group">\
								<input type="text" name="node-'+idx+'" class="form-control input-md"/>\
								<div class="nodeValue">'+node.nodeValue+'</div>\
							</div>';
	});
	form.innerHTML += '<button type="submit" class="btn btn-primary btn-lg pull-right">next</button>';

	// Add event listeners (delegation used)
	
})(this, this.document);
