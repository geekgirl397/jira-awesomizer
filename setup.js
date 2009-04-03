var testFor = ["Dashboard.jspa"];
var include;
for (var i = 0; i < testFor.length; i++) {
	if (document.location.href.indexOf(testFor[i]) >= 0) include = true;
}
if (include) {
	var injector = function(url) {
		var s = document.createElement('script');
		s.src = url;
		document.getElementsByTagName('head')[0].appendChild(s);
	};
	injector("http://localhost/dev/jira/moo.js");
	injector("http://localhost/dev/jira/awesome.js");
}
