var test = require('tape-catch');
var Flexismooth = require('../flexismooth');

test('easeIn', function(t) {
	var easeIn1 = Flexismooth.easing.easeIn(1);
	t.equals(easeIn1(0), 0, '1: value for 0% should be correct');
	t.equals(easeIn1(0.5), 0.5, '1: value for 50% should be correct');
	t.equals(easeIn1(1), 1, '1: value for 100% should be correct');
	
	var easeIn3 = Flexismooth.easing.easeIn(3);
	t.equals(easeIn3(0), 0, '3: value for 0% should be correct');
	t.equals(easeIn3(0.5), 0.125, '3: value for 50% should be correct');
	t.equals(easeIn3(1), 1, '3: value for 100% should be correct');
	
	t.end();
});

test('easeOut', function(t) {
	var easeOut1 = Flexismooth.easing.easeOut(1);
	t.equals(easeOut1(0), 0, '1: value for 0% should be correct');
	t.equals(easeOut1(0.5), 0.5, '1: value for 50% should be correct');
	t.equals(easeOut1(1), 1, '1: value for 100% should be correct');
	
	var easeOut3 = Flexismooth.easing.easeOut(3);
	t.equals(easeOut3(0), 0, '3: value for 0% should be correct');
	t.equals(easeOut3(0.5), 0.875, '3: value for 50% should be correct');
	t.equals(easeOut3(1), 1, '3: value for 100% should be correct');
	
	t.end();
});

test('easeInOut', function(t) {
	var easeInOut1 = Flexismooth.easing.easeInOut(1);
	t.equals(easeInOut1(0), 0, '1: value for 0% should be correct');
	t.equals(easeInOut1(0.5), 0.5, '1: value for 50% should be correct');
	t.equals(easeInOut1(1), 1, '1: value for 100% should be correct');
	
	var easeInOut3 = Flexismooth.easing.easeInOut(3);
	t.equals(easeInOut3(0), 0, '3: value for 0% should be correct');
	t.equals(easeInOut3(0.5), 0.5, '3: value for 50% should be correct');
	t.equals(easeInOut3(1), 1, '3: value for 100% should be correct');
	
	t.end();
});
