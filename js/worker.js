
importScripts('vendor/microTemplate.js');

onmessage = function(e) {
  var compiledTmpl = '';
  console.log('worker: message received from main script: ', e);
  if (e.data[0] && e.data[1]) {
	var compiledTmpl = tmpl(e.data[0], e.data[1]);
  }
  console.log('worker: posting message back to main script');
  postMessage(compiledTmpl);
}