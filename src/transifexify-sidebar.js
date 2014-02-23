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