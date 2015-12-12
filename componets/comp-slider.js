

xtag.register('comp-slider', {
  lifecycle: {
    created: function(){
		var self = this,
			_this = this.xtag,
			sDOM = document.currentScript.ownerDocument;
			
		_this.tpl = sDOM.getElementById('itemScrollerTmpl').innerHTML;
		_this.worker = new Worker('js/worker.js'); // path is relative to index.html
		this.getData();
    }
  },
  methods: {
	getData: function(url) {
		var self = this,
			_this = this.xtag,
			reqUrl = url || 'content.json';
			
		return $.get(reqUrl, function() {
					// show spinner
				})
				.done(function(data) {
					// success
					if (data && data.content){
						_this.tmplData = data;
						// additional data
						_this.tmplData.prevLinkText = '';
						_this.tmplData.nextLinkText = '';
						_this.tmplData.thumbnailImg = '';
				
						self.bindTemplate(_this.tmplData);
					}
				})
				.fail(function() {
					// show error message
				})
				.always(function() {
					// hide spinner
				});
	},
    bindTemplate: function(tmplData){
		var self = this,
			_this = this.xtag;
			
		console.log('bindTemplate with data: ', tmplData);
		_this.worker.postMessage([_this.tpl, tmplData]);
		_this.worker.onmessage = function(e) {
			self.innerHTML = e.data;
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