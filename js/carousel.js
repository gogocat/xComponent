
/**
*	Carousel 
*	@description
*	jQuery plugin for Carousel style scroller
*	reference from http://codepen.io/barrel/pen/oBefw
*	the plugin will detect if browser support css3 transition and fall back to use jquery animate
*/
(function($, document, window){
	'use strict';
	var namespace = window.NS || window,
		componentSelector = 'data-carousel',
		pluginName = 'carousel',
		verion = '1.0.0',
        defaultOptions = {
			slideSelector: '.slide',
			scrollLeftSelector: '[data-item-scroll-left]',
			scrollRightSelector: '[data-item-scroll-right]',
			initSlideIndex: 0,
			speed: 500
		},
		csstransitions = '',
		csstransitionend = '',
		debounceTime = 300;
		
		function csstransitionsTest(){
			var elem = document.createElement('div'),
				//test vendor transition prefix 
				props = ['transition', 'WebkitTransition', 'MozTransition', 'OTransition', 'msTransition'],
				result,
				i;
			//Iterate through and set csstransitions string. eg. 'transition' for later use.
			$.each(props, function(index, value){
				result = elem.style[value] !== undefined ? value : false;
				if (result) {
					csstransitions = result;
					return false;
				}
			});
				

			if (csstransitions) {
				switch(csstransitions) {
					case 'WebkitTransition':
						csstransitionend = 'webkitTransitionEnd';
						break;
					case 'MozTransition':
						csstransitionend = 'mozkitTransitionEnd';
						break;
					case 'OTransition':
						csstransitionend = 'oTransitionEnd';
						break;
					case 'msTransition':
						csstransitionend = 'msTransitionEnd';
						break;
					default:
						csstransitionend = 'transitionend';
				}
			}
		}

		
		// Carousel constructor
		function Carousel(element, pluginSelector, opt) {
			opt = opt || {};
			this.constructor = Carousel;
			this.pluginSelector = pluginSelector;
			this.options = $.extend({}, defaultOptions, opt);
			return this.init(element);
		}
		
		Carousel.prototype = {
			totalSlides: 0,
			currentSlideIndex: 0,
			isBusy: false,
			init: function(element){
				var self = this;
				self.element = element;
				self.$element = $(element);
				self.$slides = self.$element.find(self.options.slideSelector);
				self.totalSlides = self.$slides.length;
				self.$currentSlide = self.$slides.eq(self.options.initSlideIndex);
				self.currentSlideIndex = self.options.initSlideIndex;
				self.updateSize();
				self.setupEvents();
				// show actived slide
				self.$currentSlide.addClass('active');
			},
			
			updateSize: function() {
				var self = this,
					slideMaxHeight = 0;
					
				self.$slides.each(function(){
					var thisSlide = $(this),
						thisSlideHeight;
					// reset inline style
					thisSlide.height('');
					thisSlideHeight = thisSlide.height();
					if (thisSlideHeight > slideMaxHeight) {
						slideMaxHeight = thisSlideHeight;
					}
				}).height(slideMaxHeight);
				
				self.$element.removeAttr('style').css('minHeight', self.$slides.eq(0).outerHeight());
				
			},

			setupEvents: function(){
				var self = this,
					resizedTimer = null;
					
				// scroll right on click
				$(self.options.scrollRightSelector).on('click.scrollRight', function(e){
					e.preventDefault();
					self.nextSlide();
				});
				
				// scroll left on click
				$(self.options.scrollLeftSelector).on('click.scrollLeft', function(e){
					e.preventDefault();
					self.prevSlide();
				});
				
				// on window resized
				$(window).on('resize', function(e){
					window.clearTimeout(resizedTimer);
					resizedTimer = window.setTimeout(function(){
						self.updateSize();
					}, debounceTime);
				});

			},
			
			getCurrentSlideIndex: function(){
				var self = this;
				return self.currentSlideIndex;
			},
			
			// slide to right - calls slideToIndex method
			nextSlide: function(){
				var self = this;
				// reject if still animating
				if (self.isBusy){
					return;
				}
				// check if ended
				if (self.currentSlideIndex < self.totalSlides  - 1) {
					self.isBusy = true;
					self.currentSlideIndex += 1;
					self.slideToIndex(self.currentSlideIndex, 'right');
				} 
			},
			
			// slide to left - calls slideToIndex method
			prevSlide: function(){
				var self = this;
				// reject if still animating
				if (self.isBusy){
					return;
				}
				// check if ended
				if (self.currentSlideIndex > 0 ) {
					self.isBusy = true;
					self.currentSlideIndex -= 1;
					self.slideToIndex(self.currentSlideIndex, 'left');
				} 
			},
			
			//	prepare slide animation
			//	update targetSlide style and determine to use css or js animation
			slideToIndex: function(index, direction){
				var self = this,
					$targetSlide = self.$slides.eq(index);
				
				// update target slide css to bring it next to current slide
				$targetSlide.addClass(direction + ' active');

				// csstransitions = false; // for test js anmiation
				
				if (csstransitions){
					self.cssAnimate($targetSlide, direction);
				} else {
					self.jsAnimate($targetSlide, direction);
				}
			},
			
			// update css animation inline style 
			setSlidesCssDuration: function(isReset) {
				var self = this,
					value = (isReset === false) ? '' :  self.options.speed + 'ms';
					
				self.$slides.each(function() {
					this.style[csstransitions + 'Duration'] = value;
				});
			},
			
			// animate using css and clean up after transition
			cssAnimate: function($targetSlide, direction) {
				var self = this;
				// listen once transitionend event and then clean up
				self.$currentSlide.one(csstransitionend, function(e){
					self.$element.removeClass('transition');
					self.setSlidesCssDuration(false);
					self.$currentSlide.removeClass('active shift-left shift-right');
					self.$currentSlide = $targetSlide.removeClass(direction);
					
					// trigger custom event 'afterChange' and pass currentSlideIndex;
					self.$element.trigger('afterChange', self.currentSlideIndex);
					self.isBusy = false;
				});
				// decorate element with CSS classes and start animate by CSS
				// delay required to work with css transition
				setTimeout(function() {
					self.$element.addClass('transition');
					self.setSlidesCssDuration();
					self.$currentSlide.addClass('shift-' + direction);
				}, 100);
			},
			
			// animate using jquery animate method
			jsAnimate: function($targetSlide, direction){
				var self = this,
					animationNext = {},
					animationCurrent = {};

				// See CSS for explanation of .js-reset-left
				if (direction === 'right') {
					self.$currentSlide.addClass('js-reset-left');
				}
				
				animationNext[direction] = '0%';
				animationCurrent[direction] = '100%';

				//Animation: Current slide
				self.$currentSlide.animate(animationCurrent, self.options.speed);

				//Animation: Next slide
				$targetSlide.animate(animationNext, self.options.speed, 'swing', function() {
					//clean inline styles
					self.$currentSlide.removeClass('active js-reset-left').removeAttr('style');
					//update $currentSlide reference
					self.$currentSlide = $targetSlide.removeClass(direction).removeAttr('style');
					// trigger custom event 'afterChange' and pass currentSlideIndex;
					self.$element.trigger('afterChange', self.currentSlideIndex);
					self.isBusy = false;
				});
			}
		};
		
		// setup as jQuery plugin
		$.fn.carousel = function (options) {
			var pluginSelector = this.selector,
				methodName, 
				pluginInstance;
			// if options is a config object, return new instance of the plugin
			if ($.isPlainObject(options) || !options) {
				return this.each(function() {
					if (!$.data(this, pluginName)) { // prevent multiple instancate plugin
						pluginInstance = new Carousel(this, pluginSelector, options);
						$.data(this, pluginName, pluginInstance); // store reference of plugin name
						return pluginInstance;
					}
				});
			}
			// if call method after plugin init. return methid call
			else if (typeof arguments[0] === 'string') {
				pluginInstance = $.data(this[0], pluginName);
				if (pluginInstance) {
					methodName = arguments[0];
					if (pluginInstance[methodName]) {
						return pluginInstance[methodName].apply(pluginInstance, Array.prototype.slice.call(arguments, 1));
					}
				}
			}
		};
		
		// provide version info
		$.fn.carousel.version = verion;	
	
		// do css support check
		csstransitionsTest();

	
	
}(jQuery, document, window));