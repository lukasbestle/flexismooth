var test = require('tape-catch');
var Flexismooth = require('../flexismooth');

// Mock window object
global.window = {
	// Page scroll "getters"
	pageXOffset: 0,
	pageYOffset: 0,
	
	// Page scroll "setter"
	scrollTo: function(x, y) {
		this.pageXOffset = x;
		this.pageYOffset = y;
	},
	
	// Mockable requestAnimationFrame instance
	rafCallback: null,
	requestAnimationFrame: function(callback) {
		if(this.rafCallback) throw new Error('An animation frame was already requested.');
		this.rafCallback = callback;
	},
	provideAnimationFrame: function(timestamp) {
		var callback = this.rafCallback;
		if(!callback) throw new Error('No animation frame was requested.');
		
		// Reset callback before providing animation frame
		// because it will request a new one before terminating
		this.rafCallback = null;
		callback(timestamp);
	}
};

/**
 * Sets up the test foundation
 *
 * @param {object} t       Tape test object
 * @param {object} options Object with the following options:
 *                           start    Y coord to start with
 *                           params   Parameters for the Flexismooth function
 *                           end      Y coord to expect on success
 *                           result   Expected result, either `resolve`, `reject` or `exception`,
 *                                    defaults to `resolve`
 *                           message  Expected param for the Promise callback
 *                           callback Optional callback after the Promise resolves/rejects
 */
var setupTest = function(t, options) {
	// Scroll to an arbitrary X position to test if it gets changed
	window.scrollTo(21, options.start);
	t.equal(window.pageXOffset, 21, 'start X offset should be correct');
	t.equal(window.pageYOffset, options.start, 'start Y offset should be correct');
	
	if(options.result === 'exception') {
		try {
			Flexismooth.apply(undefined, options.params);
			t.fail('should throw an exception');
		} catch(e) {
			t.equal(e.message, options.message, 'exception message should be correct');
		}
		t.end();
		return;
	}
	
	Flexismooth.apply(undefined, options.params).then(function(result) {
		t.equal(window.pageXOffset, 21, 'end X offset should be correct');
		t.equal(window.pageYOffset, options.end, 'end Y offset should be correct');
		
		if(!options.result || options.result === 'resolve') {
			t.equal(result, options.message, 'message should be correct');
			
			if(options.callback) {
				options.callback(result, 'resolve');
			} else {
				t.end();
			}
		} else {
			t.fail('should not succeed (message: ' + result + ')');
			t.end();
		}
	}).catch(function(err) {
		if(options.result === 'reject') {
			t.equal(err, options.message, 'error message should be correct');
			
			if(options.callback) {
				options.callback(err, 'reject');
			} else {
				t.end();
			}
		} else {
			t.fail('should not fail (message: ' + err + ')');
			t.end();
		}
	});
};

/**
 * Sets up the test foundation for smooth scrolling and tests animation frames
 *
 * @param {object} t       Tape test object
 * @param {object} options See setupTest(), additionally supports the following options:
 *                           time      Expected animation time
 *                           easing    Expected easing function, defaults to easeInOut(2)
 *                           interrupt Whether to interrupt scrolling
 */
var setupSmoothTest = function(t, options) {
	// Reset requestAnimationFrame callback
	window.rafCallback = null;
	
	// Setup a normal test
	setupTest(t, options);
	
	var easingFunction = options.easing || Flexismooth.easing.easeInOut(2);
	
	// Simulate animation frames
	window.provideAnimationFrame(133742);
	t.equal(window.pageYOffset, options.start, 'Y offset after first animation frame should be correct');
	
	window.provideAnimationFrame(133742 + options.time * 0.318);
	t.equal(window.pageYOffset, Math.round(options.start + easingFunction(0.318) * (options.end - options.start)), 'Y offset at 31.8% of the animation should be correct');
	
	window.provideAnimationFrame(133742 + options.time * 0.5);
	t.equal(window.pageYOffset, Math.round(options.start + easingFunction(0.5) * (options.end - options.start)), 'Y offset at 50% of the animation should be correct');
	
	window.provideAnimationFrame(133742 + options.time * 0.75);
	t.equal(window.pageYOffset, Math.round(options.start + easingFunction(0.75) * (options.end - options.start)), 'Y offset at 75% of the animation should be correct');
	
	if(options.interrupt) {
		window.pageYOffset -= 1;
		
		if(options.result === 'reject') {
			window.provideAnimationFrame(133742 + options.time - 1);
			
			// We expect the last call of provideAnimationFrame to finish the operation
			t.equal(window.rafCallback, null, 'should not request more animation frames');
			return;
		}
	}
	
	window.provideAnimationFrame(133742 + options.time - 1);
	t.equal(window.pageYOffset, options.end, 'Y offset near the end of the animation should be correct');
	
	window.provideAnimationFrame(133742 + options.time);
	t.equal(window.pageYOffset, options.end, 'Y offset at the end of the animation should be correct');
	
	// We expect the last call of provideAnimationFrame to finish the operation
	t.equal(window.rafCallback, null, 'should not request more animation frames');
};

///////////////////////////////////////////////////////////

test('default target', function(t) {
	setupTest(t, {
		start:   42,
		params:  [undefined, 0],
		end:     0,
		message: 'Instantly scrolled to position.'
	});
});

test('invalid target (string)', function(t) {
	setupTest(t, {
		start:   42,
		params:  ['this is not a scroll target', 0],
		end:     0,
		result:  'exception',
		message: 'Invalid parameter target.'
	});
});

test('invalid target (invalid object)', function(t) {
	setupTest(t, {
		start:   42,
		params:  [{thisIs: 'not a scroll target'}, 0],
		end:     0,
		result:  'exception',
		message: 'Invalid parameter target.'
	});
});

test('already correct position (default target)', function(t) {
	setupTest(t, {
		start:   0,
		params:  [undefined, 0],
		end:     0,
		message: 'Position is already correct.'
	});
});

test('already correct position (instant scrolling)', function(t) {
	setupTest(t, {
		start:   42,
		params:  [42, 0],
		end:     42,
		message: 'Position is already correct.'
	});
});

test('already correct position (element)', function(t) {
	var element = {
		getBoundingClientRect: function() {
			return {top: 0};
		}
	}
	
	setupTest(t, {
		start:   42,
		params:  [element, 0],
		end:     42,
		message: 'Position is already correct.'
	});
});

test('already correct position (smooth scrolling)', function(t) {
	setupTest(t, {
		start:    42,
		params:   [42, 1000],
		end:      42,
		message:  'Position is already correct.',
		callback: function(result) {
			t.equal(window.rafCallback, null, 'animation frame should not be requested');
			t.end();
		}
	});
});

test('scroll to pixel value (instant scrolling)', function(t) {
	setupTest(t, {
		start:   42,
		params:  [1337, 0],
		end:     1337,
		message: 'Instantly scrolled to position.'
	});
});

test('float value as target', function(t) {
	setupTest(t, {
		start:   42,
		params:  [1337.7, 0],
		end:     1338,
		message: 'Instantly scrolled to position.'
	});
});

test('default options', function(t) {
	setupTest(t, {
		start:   42,
		params:  [1337, undefined],
		end:     1337,
		message: 'Instantly scrolled to position.'
	});
});

test('empty object as second parameter', function(t) {
	setupTest(t, {
		start:   42,
		params:  [1337, {}],
		end:     1337,
		message: 'Instantly scrolled to position.'
	});
});

test('time as second parameter', function(t) {
	setupSmoothTest(t, {
		start:   0,
		params:  [500, 1000],
		end:     500,
		time:    1000,
		message: 'Smoothly scrolled to position.'
	});
});

test('time as option', function(t) {
	setupSmoothTest(t, {
		start:   0,
		params:  [500, {time: 654}],
		end:     500,
		time:    654,
		message: 'Smoothly scrolled to position.'
	});
});

test('custom easing function', function(t) {
	setupSmoothTest(t, {
		start:   0,
		params:  [500, {time: 100, easingFunction: Flexismooth.easing.easeInOut(10)}],
		end:     500,
		time:    100,
		easing:  Flexismooth.easing.easeInOut(10),
		message: 'Smoothly scrolled to position.'
	});
});

test('scroll to element', function(t) {
	var element = {
		getBoundingClientRect: function() {
			// Should not happen in a browser, but Flexismooth should account for float values
			return {top: -449.8};
		}
	}
	
	setupTest(t, {
		start:   1000,
		params:  [element, 0],
		end:     550,
		message: 'Instantly scrolled to position.'
	});
});

test('scroll to element (smooth scrolling)', function(t) {
	var element = {
		getBoundingClientRect: function() {
			// Should not happen in a browser, but Flexismooth should account for float values
			return {top: -449.8};
		}
	}
	
	setupSmoothTest(t, {
		start:   1000,
		params:  [element, 9001],
		end:     550,
		time:    9001,
		message: 'Smoothly scrolled to position.'
	});
});

test('scrolling interruption', function(t) {
	setupSmoothTest(t, {
		start:     0,
		params:    [500, {time: 100}],
		end:       500,
		time:      100,
		interrupt: true,
		result:    'reject',
		message:   'Scrolling got interrupted.'
	});
});

test('scrolling interruption (annoyUsers mode)', function(t) {
	setupSmoothTest(t, {
		start:     0,
		params:    [500, {time: 100, annoyUsers: true}],
		end:       500,
		time:      100,
		interrupt: true,
		result:    'resolve',
		message:   'Smoothly scrolled to position.'
	});
});
