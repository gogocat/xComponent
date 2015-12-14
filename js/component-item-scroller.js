// namespace
window.NS = window.NS || {};

(function($, document, window){
	'use strict';
	var namespace = window.NS || window,
		componentSelector = 'data-item-scroller',
		pluginName = 'itemScroller',
		verion = "1.0.0",
        defaultOptions = {
			el: {
				scrollLeft: '[data-item-scroll-left]',
				scrollRight: '[data-item-scroll-right]',
				dataPaneToogler: '[data-pane-toogler]'
			},
			itemScrollerTmplId : 'itemScrollerTmpl',
			slickConfig: {
				arrows: false,
				infinite: false
			}
		};
		
	/**
	*	ItemScroller 
	*	@description 
	*	ItemScroller is a jQuery plugin auto assign to DOM element via data attribute 'data-item-scroller'.
	*	options can be pass declaratively from data attribute
	*	@require Slick plugin, microTemplate.js
	*/
	function ItemScroller(element, pluginSelector, opt) {
		opt = opt || {};
		this.constructor = ItemScroller;
		this.pluginSelector = pluginSelector;
		this.options = $.extend({}, defaultOptions, opt);
		return this.init(element);
	}
	
	ItemScroller.prototype = {
		tmplData: null,
		currentSlideIndex: 0,
		prevSlideIndex: undefined,
		init: function(element){
			var self = this;
			self.element = element;
			self.$element = $(element);
			self.template = $(self.options.itemScrollerTmplId);
			
			// asyn get data then bind with template
			self.getData()
				.then(function(data){
					// bind template
					self.bindTemplate(data);
					
					// cache rendered elements
					self.$sliderBody = self.$element.find('.collapse-pane-body');
					self.$prevNav = self.$element.find(self.options.el.scrollLeft);
					self.$nextNav = self.$element.find(self.options.el.scrollRight);
					
					// assign custom carousel jquery plugin
					if ($.fn.carousel){
						self.$sliderBody.carousel();
						// store the current slide index
						self.currentSlideIndex = self.$sliderBody.carousel('getCurrentSlideIndex');
						
						// event after slide change 
						self.$sliderBody.on('afterChange', function(event, currentSlide){
							self.prevSlideIndex = self.currentSlideIndex || undefined;
							self.currentSlideIndex = currentSlide;
							self.updateNavText();
						});
					}
				});
			
		},
		
		bindTemplate: function(data){
			var self = this,
				compiledTmpl,
				getPrevLinkText = function() {
					var ret = '';
					if (self.currentSlideIndex > 0) {
						ret = data.content[self.currentSlideIndex - 1].title;
					}
					return ret;
				},
				getNextLinkText = function() {
					var ret = '';
					if (self.currentSlideIndex < data.content.length) {
						ret = data.content[self.currentSlideIndex].title;
					}
					return ret;
				},
				getThumbnail= function() {
					var ret = '';
					ret = data.content[self.currentSlideIndex].thumbnail || data.content[0].thumbnail;
					return ret;
				};
				
			if (!data) {
				return;
			}
			try {
				data.prevLinkText = getPrevLinkText();
				data.nextLinkText = getNextLinkText();
				data.thumbnailImg = getThumbnail();
				
				compiledTmpl = window.tmpl("itemScrollerTmpl", data);
				if (compiledTmpl) {
					self.$element.html(compiledTmpl);
				}
			} catch(err) {
				throw err.message;
			}
			return self;
		},
		
		getData: function(url) {
			var self = this,
				reqUrl = url || 'content.json';
				
			return $.get(reqUrl, function() {
						// show spinner
					})
					.done(function(data) {
						// success
						if (data && data.content){
							self.tmplData = data;
						}
					})
					.fail(function() {
						// show error message
					})
					.always(function() {
						// hide spinner
					});
		},
		
		
		updateNavText: function() {
			var self = this,
				preNavText = '',
				nextNavText = '';
			if (self.tmplData && (self.prevSlideIndex !== self.currentSlideIndex)){
				if (self.currentSlideIndex > 0 ) {
					preNavText = self.tmplData.content[self.currentSlideIndex - 1].title;
				}
				if (self.currentSlideIndex < (self.tmplData.content.length - 1)){
					nextNavText = self.tmplData.content[self.currentSlideIndex + 1].title;
				}
				self.$prevNav.text(preNavText);
				self.$nextNav.text(nextNavText);
			}
			return self;
		}
		
	};
	
	
	
	// jQuery bridge 
    $.fn.itemScroller = function (options) {
		var pluginSelector = this.selector,
			methodName, 
			pluginInstance;
		// if options is a config object, return new instance of the plugin
		if ($.isPlainObject(options) || !options) {
			return this.each(function() {
				if (!$.data(this, pluginName)) { // prevent multiple instancate plugin
					pluginInstance = new ItemScroller(this, pluginSelector, options);
					$.data(this, pluginName, pluginInstance); // store reference of plugin name
					return pluginInstance;
				}
			});
		}
		// if call method after plugin init. return methid call
		else if (typeof arguments[0] === "string") {
			pluginInstance = $.data(this[0], pluginName);
			if (pluginInstance) {
				methodName = arguments[0];
				if (pluginInstance[methodName]) {
					return pluginInstance[methodName].apply(pluginInstance, Array.prototype.slice.call(arguments, 1));
				}
			}
		}
    };
	
	$.fn.itemScroller.version = verion;	
	
	/** 
	*	parseAttrToJson
	*	@description parse JSON like string to JSON like object.
	*	@param [dataStr] string
	*	@return JSON like object
	*/
	function parseAttrToJson(dataStr) {
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
	
	// auto assign on DOM ready
	$(document).ready(function(){
		var $component = $('['+ componentSelector + ']');
		if ($component.length){
			$component.each(function(){
				var thisComponent = $(this),
					thisOpt = thisComponent.attr(componentSelector);
				if (thisOpt) {
					thisOpt = parseAttrToJson(thisOpt);
				}	
				thisComponent.itemScroller(thisOpt);
			});
		}
	});
	
}(jQuery, document, window));