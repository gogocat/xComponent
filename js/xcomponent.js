/** 
*	xcomponent.js
*	@description 
*	xcomponent framework - provide centralist single web worker service call
*/
(function (window, factory) {
    'use strict';
	if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals
        factory();
    }
}(window, function () {
	'use strict';
	
	function xComponent(xtag) {
		this.constructor = xComponent;
		this.xtag = xtag;
		this.worker = new Worker('js/worker.js');
	}
	
	xComponent.prototype = {
		// TODO: move ajax load to webworker
		loadTemplateAndViewModel: function() {
			var self = this;
				
			self.xtag.config = self.xtag.getAttribute('config');
			self.xtag.config = parseStringToJson(self.xtag.config);
			
			if (typeof self.xtag.config.templatePath !== 'string' || typeof self.xtag.config.data !== 'string') {
				return;
			}
			
			// cache this element jquery object
			//self.xtag.$el = $(self.xtag);
			
			$.when( $.get( self.xtag.config.templatePath ), $.get( self.xtag.config.data ) ).done(function( tmplXhr, dataXhr ) {
				self.xtag.tpl = tmplXhr[0]; // this is string including template tag itself
				self.xtag.tmplData = dataXhr[0];
				self.bindTemplate(self.xtag.tpl, self.xtag.tmplData);
			});	
		},
		
		bindTemplate: function(tpl, tmplData) {
			var self = this;
				
			console.log('xcomponent worker: compiling template');
			console.time('xcomponent-workerProcess');
			
			self.worker.postMessage({cmd: 'compileTemplate', template: tpl, data:tmplData });
			
			// on template compiled by web worker
			self.worker.addEventListener('message', function(e) {
				console.timeEnd('xcomponent-workerProcess');
				console.log('worker: compiled template finish');
				// revive string content inside the 'template' tag to html
				self.xtag.innerHTML = $(e.data).filter('template').html();
				
				// test dom search in web worker.
				//var bodyHtml = $('body').html();
				//self.xtag.worker.postMessage({cmd: 'createVdom', html: bodyHtml });
				
				// TODO: make slider / carousel as web component and self execute binding on creation
				self.bindSlider();
			}, false);
		}
		
	};
	
	/** 
	*	parseStringToJson
	*	@description parse JSON like string to JSON like object.
	*	@param [dataStr] string
	*	@return JSON like object
	*/
	function parseStringToJson(dataStr) {
		var regexObject = /^[\{].*[\}]$/gm,
			fn,
			ret = {};
		if (typeof dataStr === 'string') {
			dataStr = dataStr.replace(/(\r\n|\n|\r)/gm,"");
			dataStr = $.trim(dataStr);
			if (regexObject.test(dataStr)){
				fn = new Function('return ' + dataStr );
				ret = fn();
			}
		}
		return ret;
	}
	
	// return class
	return xComponent 
	
}));