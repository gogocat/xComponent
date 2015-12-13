
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

xtag.register('comp-slider', {
  lifecycle: {
    created: function(){
		var self = this,
			_this = this.xtag;
			
		_this.config = this.getAttribute('config');
		_this.config = parseStringToJson(_this.config);
		
		if (typeof _this.config.templatePath !== 'string' || typeof _this.config.data !== 'string') {
			return;
		}
		// create web worker
		_this.worker = new Worker('js/worker.js'); // path is relative to index.html
		
		$.when( $.get( _this.config.templatePath ), $.get( _this.config.data ) ).done(function( tmplXhr, dataXhr ) {
			_this.tpl = tmplXhr[0]; //$(tmplXhr[0]).filter('template').html();
			_this.tmplData = self.augmentData(dataXhr[0]);
			if (_this.tmplData) {
				self.bindTemplate(_this.tmplData);
			}
		});
    }
  },
  methods: {

	augmentData: function(data) {
		var self = this,
			_this = this.xtag;

		if (data && data.content){
			data.prevLinkText = '';
			data.nextLinkText = '';
			data.thumbnailImg = '';
			return data;
		}		
	},
    bindTemplate: function(tmplData){
		var self = this,
			_this = this.xtag;
			
		console.log('bindTemplate with data: ', tmplData);
		
		/*
		// no web worker
		console.time('template-process');
		var result = tmpl(_this.tpl, tmplData);
		self.innerHTML = $(result).filter('template').html();
		console.timeEnd('template-process');
		*/
		
		console.time('workerProcess');
		_this.worker.postMessage([_this.tpl, tmplData]);
		_this.worker.onmessage = function(e) {
			console.timeEnd('workerProcess');
			// use content inside 'template' tag
			self.innerHTML = $(e.data).filter('template').html();
			console.log('Message received from worker');
		};
		
    },
    stop: function(){
      //this.xtag.interval = clearInterval(this.xtag.interval);
    },
    update: function(){
		
    }
  },
  events: {
    tap: function(){
      
    }
  }
});