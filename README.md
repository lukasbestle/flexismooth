# Flexismooth

[![Build Status](https://travis-ci.org/lukasbestle/flexismooth.svg?branch=master)](https://travis-ci.org/lukasbestle/flexismooth)

> Dependency-free smooth scrolling library

## About the FlexiJS series

There are JavaScript libraries for everything you would ever want to do in a browser. A lot of them either:

- depend on a large library (like Underscore or jQuery) or even framework even though they only need tiny fractions of the features or
- have awful code quality.

Most fit in both categories.

Because most tasks are simple, there shouldn't be the need for huge libraries for simple tasks. That's why I started writing small, UNIXy JavaScript libraries in a series called [FlexiJS](https://git.lukasbestle.com/groups/flexiJS). Flexismooth is one of them, but feel free to check out the others, too.

## Features

- Doesn't require any dependencies, less than 1 KB compressed
- Robust and well-tested code
- Promise API, uses `requestAnimationFrame`
- Supports scrolling to pixel values or elements
- Comes with simple easeIn, easeOut and easeInOut functions and supports custom easing functions
- Doesn't annoy the user by default by stopping automatically if the user scrolls manually while the animation is running

## Browser support

Flexismooth requires the following browser features:

- Promises
- `requestAnimationFrame`

Apart from that, it should support pretty much all relevant browsers.

## Installation

Flexismooth uses AMD if available, otherwise it exports itself as `window.Flexismooth`.
There are several ways to get Flexismooth:

- Download the [minified](https://git.lukasbestle.com/flexijs/flexismooth/blob/master/flexismooth.min.js) or [development](https://git.lukasbestle.com/flexijs/flexismooth/blob/master/flexismooth.js) version directly
- `npm install flexismooth`
- `bower install flexismooth`

## Usage

### `Flexismooth(target[, options])`

Takes a `target` (pixel value counted from the top of the page or element object) and scrolls to it in the time specified in `options`.
`options` can be:

- an object with any of the following options:
	- `time`: Time in ms, defaults to 0 ("scroll instantly")
	- `easingFunction`: Easing function, defaults to `Flexismooth.easing.easeInOut(2)`
	- `annoyUsers`: Don't stop if the animation is interrupted by the user (not recommended!)
- just a time value
- completely omitted to default to a time value of 0

The function returns a Promise that is resolved after the animation is done and rejected if it was interrupted.

### `Flexismooth.easing.easeIn(exponent)`

Returns an easing function with the given exponent. An exponent of `1` equals a linear easing function.
`easeIn` converts a float between 0 and 1 to a float that accelerates from zero velocity.

### `Flexismooth.easing.easeOut(exponent)`

Returns an easing function with the given exponent. An exponent of `1` equals a linear easing function.
`easeOut` converts a float between 0 and 1 to a float that decelerates to zero velocity.

### `Flexismooth.easing.easeInOut(exponent)`

Returns an easing function with the given exponent. An exponent of `1` equals a linear easing function.
`easeInOut` combines `easeIn` and `easeOut`.

## Examples

```js
// Scroll to the top of the page within 500 ms
Flexismooth(0, 500).then(function(result) {
	console.log('We are at the top: ' + result);
}).catch(function(err) {
	console.log('Something went wrong: ' + err);
});

// Scroll to a specified element
var element = document.querySelector('.main');
Flexismooth(element, 500).then(function(result) {
	console.log('We have reached the element: ' + result);
}).catch(function(err) {
	console.log('Something went wrong: ' + err);
});

// Sometimes you don't care whether the animation was successful
// or not or when it completed
// That's fine too, you don't need to do anything with the Promise
Flexismooth(0, 500);

// Use a custom easing function
var options = {
	time: 500,
	easingFunction: Flexismooth.easing.easeInOut(3)
};
Flexismooth(0, options);

// Use a completely custom easing function
var options = {
	time: 3000,
	easingFunction: function(value) {
		// This one is not recommended for production
		// You'll see when you try it out...
		return -0.5 * Math.cos(3 * Math.PI * value) + 0.5;
	}
};
Flexismooth(0, options);

// Force the animation on the user (not recommended!)
var options = {
	time: 500,
	annoyUsers: true
};
Flexismooth(0, options);
```

## License

<http://www.opensource.org/licenses/mit-license.php>

## Author

Lukas Bestle <project-flexijs@lukasbestle.com>
