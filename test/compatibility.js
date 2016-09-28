var expect = require('chai').expect;

describe('argy - compatibility tests (arguments object)', function() {

	/**
	* Verifies that a sub function can be passed the arguments object which can in turn override the values from within the function
	* This is similar to setting object keys of a passed object
	* NOTE: This only works when 'use strict' is NOT present
	*/
	it('should be able to override args if the function specifies them', function() {
		var result = function myFunc(a, b, c) {

			var dummyFunc = function(args) {
				args[0] = 'foo';
				args[1] = 'bar';
				args[2] = 'baz';
			}(arguments);

			expect(a).to.equal('foo');
			expect(b).to.equal('bar');
			expect(c).to.equal('baz');

		}('one', 'two', 'three');
	});


	/**
	* Even though the `arguments` object is still present and a,b,c is specified as parameters, setting values outside the maximum argument index doesnt work
	* NOTE: This only works when 'use strict' is NOT present
	*/
	it('should NOT be able to override args if the function specifies them', function() {
		var result = function myFunc(a, b, c) {

			var dummyFunc = function(args) {
				args[0] = 'foo';
				args[1] = 'bar';
				args[2] = 'baz';
			}(arguments);

			expect(a).to.equal('foo');
			expect(b).to.be.undefined;
			expect(c).to.be.undefined;

		}('one');
	});

	/**
	* Same as above but accessing the arguments object via the callee object
	* NOTE: This only works when 'use strict' is NOT present
	*/
	it('should NOT be able to override args if the function specifies them (via arguments.callee.arguments)', function() {
		var result = function myFunc(a, b, c) {

			var dummyFunc = function(args) {
				args.callee.arguments[0] = 'foo';
				args.callee.arguments[1] = 'bar';
				args.callee.arguments[2] = 'baz';
			}(arguments);

			expect(a).to.equal('foo');
			expect(b).to.be.undefined;
			expect(c).to.be.undefined;

		}('one');
	});

});


describe('argy - compatibility tests (passing by reference)', function() {

	it('should NOT be able to override args if the function specifies them', function() {
		var result = function myFunc(a, b, c) {

			var dummyFunc = function(alpha, beta, gamma) {
				alpha = 'foo';
				beta = 'bar';
				gamma = 'baz';
			}(a, b, c);

			expect(a).to.equal('one');
			expect(b).to.equal('two');
			expect(c).to.equal('three');

		}('one', 'two', 'three');
	});

});
