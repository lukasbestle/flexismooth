/*!
 * Flexismooth v1.0.0
 * Dependency-free smooth scrolling library
 * 
 * @author  Lukas Bestle <project-flexijs@lukasbestle.com>
 * @link    https://git.lukasbestle.com/flexijs/flexismooth
 * @license MIT
 */
(function(root) {
	'use strict';
	
	/**
	 * Smoothly scrolls to an element or pixel target
	 *
	 * @param  {Element/integer} target  Element to scroll to or pixel value from the top of the page
	 * @param  {object/integer}  options Supports the following options:
	 *                                     time: Time in ms, defaults to 0 ("scroll instantly")
	 *                                     easingFunction: Easing function, defaults to `Flexismooth.easing.easeInOut(2)`
	 *                                     annoyUsers: Don't stop if the animation is interrupted by the user (not recommended!)
	 *                                   If options is a number, it is used as the time value
	 * @return {Promise}                 Resolves when done, rejects when interrupted
	 */
	var Flexismooth = function(target, options) {
		// Default to the top of the page if no target is given
		if(!target) target = 0;
		
		// Fallbacks for the options object
		if(!options) options = {};
		if(typeof options === 'number') options = {time: options};
		
		// Default to easeInOut if no easing function is given
		if(typeof options.easingFunction !== 'function') {
			options.easingFunction = Flexismooth.easing.easeInOut(2);
		}
		
		// Determine offset
		var targetOffset;
		if(typeof target === 'number') {
			// Pixel value given
			targetOffset = Math.round(target);
		} else if(typeof target.getBoundingClientRect === 'function') {
			// Element given, use its offset
			targetOffset = Math.round(target.getBoundingClientRect().top + window.pageYOffset);
		} else {
			// Invalid target
			throw new TypeError('Invalid parameter target.');
		}
		
		// Instantly resolve if the position is already correct
		if(window.pageYOffset === targetOffset) {
			return Promise.resolve('Position is already correct.');
		}
		
		// Instantly resolve if no time is given
		if(!options.time) {
			window.scrollTo(window.pageXOffset, targetOffset);
			return Promise.resolve('Instantly scrolled to position.');
		}
		
		return new Promise(function(resolve, reject) {
			var startTime     = null;
			var startOffset   = window.pageYOffset;
			var currentOffset = startOffset;
			
			var step = function(timestamp) {
				if(startTime === null) startTime = timestamp;
				
				// Check if we got interrupted
				if(!options.annoyUsers && currentOffset !== window.pageYOffset) {
					reject('Scrolling got interrupted.');
					return;
				}
				
				// Calculate animation progress using the easing function
				var timePercentage = (timestamp - startTime) / options.time;
				var progress = options.easingFunction(timePercentage);
				
				// Scroll and request another animation frame until the time is over
				if(timePercentage < 1) {
					// At 0 %   of the animation, scrollTop should be startOffset
					// At 100 % of the animation, scrollTop should be targetOffset
					currentOffset = Math.round(startOffset + progress * (targetOffset - startOffset));
					window.scrollTo(window.pageXOffset, currentOffset);
					
					window.requestAnimationFrame(step);
				} else {
					// Since this is the last frame, we always scroll to the target directly
					// Calculating the currentOffset may give incorrect results
					window.scrollTo(window.pageXOffset, targetOffset);
					
					resolve('Smoothly scrolled to position.');
				}
			};
			
			window.requestAnimationFrame(step);
		});
	};
	
	// Easing functions
	Flexismooth.easing = {
		/**
		 * Generates and returns an easing function with the specified exponent that
		 * converts a float between 0 and 1 to a float that accelerates from zero velocity
		 *
		 * @param  {number}   exponent Degree of the easing function
		 * @return {Function}
		 */
		easeIn: function(exponent) {
			return function(value) {
				return Math.pow(value, exponent);
			};
		},

		/**
		 * Generates and returns an easing function with the specified exponent that
		 * converts a float between 0 and 1 to a float that decelerates to zero velocity
		 *
		 * @param  {number}   exponent   Degree of the easing function
		 * @param  {integer}  subtractor For internal use
		 * @return {Function}
		 */
		easeOut: function(exponent, subtractor) {
			if(!subtractor) subtractor = 1;
			
			return function(value) {
				return subtractor - Math.pow(subtractor - value, exponent);
			};
		},

		/**
		 * Generates and returns an easing function with the specified exponent that
		 * converts a float between 0 and 1 to a float that accelerates from and
		 * decelerates to zero velocity
		 *
		 * @param  {number}   exponent Degree of the easing function
		 * @return {Function}
		 */
		easeInOut: function(exponent) {
			// Prepare components
			var easeIn  = this.easeIn(exponent);
			var easeOut = this.easeOut(exponent, 2);
			
			return function(value) {
				if(value <= 0.5) {
					return easeIn(value * 2) / 2;
				} else {
					return easeOut(value * 2) / 2;
				}
			};
		}
	}
	
	// Export module
	if(typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define([], function() {
			return Flexismooth;
		});
	} else if (typeof module === 'object' && module.exports) {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like environments that support module.exports,
		// like Node.
		module.exports = Flexismooth;
	} else {
		// Browser globals (root is window)
		root.Flexismooth = Flexismooth;
	}
})(this);
