(function(window, document, undefined){
	if(!window.transifexifyAdded){
		// make request for transifexify sidebar
		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'http://localhost:8000/transifexify.html');
		xhr.onload = function(e){
			if(xhr.readyState === 4 && xhr.status === 200){
				// we can go full steam... sidebar will load
				// add our css file to doc
				var link = document.createElement('link');
				link.rel = 'stylesheet';
				link.href = 'http://localhost:8000/transifexify.css';
				document.head.innerHTML = link.outerHTML + document.head.innerHTML;

				// add our wrapping code to body
				document.body.innerHTML = '<div id="transifexifyDocument">'+ document.body.innerHTML +'</div>';

				// inject sidebar
				document.body.innerHTML += xhr.responseText;

				// add transifexify sidebar js
				var script = document.createElement('script');
				script.src = 'http://localhost:8000/transifexify-sidebar.js';
				document.body.appendChild(script);
			}
			else {
				console.log('Failed to load sidebar: ', xhr, e);
				var script = document.createElement('script');
				script.src = 'http://localhost:8000/transifexify.js';
				document.body.appendChild('script');
			}

			window.transifexifyAdded = true;
		};
		xhr.send();
	}
})(window, window.document);
