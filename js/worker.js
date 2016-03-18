importScripts('simple-dom.js'); // virtual DOM
importScripts('vendor/zepto.js'); // simple jQuery equivalent 
importScripts('vendor/knockout-3.4.0.debug.js'); // ko debug version
importScripts('vendor/microTemplate.js');

var $vDom = null;
// test
console.log('worker: window?', typeof window !== 'undefined');
console.log('worker: document?', typeof document !== 'undefined');

function compileTemplate(eData) {
	var compiledTemplate = '';
	if (eData.template && eData.data){
		compiledTemplate = tmpl(eData.template, eData.data);
	}
	postMessage(compiledTemplate);
	//return compiledTemplate;
}

function createVdom(htmlString) {
	if (typeof htmlString === 'string'){
		$vDom = $('<div/>');
		$vDom[0].innerHTML = htmlString;
	}
	console.log('worker: createVdom: ', $vDom);
	
	// test DOM search inside web worker
	searchVdom('h5');
}

function searchVdom(selector) {
	var $el = '';
	if ($vDom && typeof htmlString === 'string'){
		$el = $vDom.find(selector);
	}
	//return postMessage($el);
}

function processMessage(e) {
  var eData;
  
  console.log('worker: message received from main script: ', e);
  if (e.data) {
	  eData = e.data;
  }
  
  switch (eData.cmd) {
	  case 'compileTemplate':
		compileTemplate(eData);
      break;
    case 'createVdom':
		createVdom(eData.html);
      break;
	case 'searchVdom':
		searchVdom(eData.selector);
      break;
    default:
      postMessage('Unknown command');
  };
  console.log('worker: posting message back to main script');
};

// listen message
self.addEventListener('message', function(e) {
	return processMessage(e);
}, false);