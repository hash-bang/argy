var expect = require('chai').expect;

describe('argy - compatibility tests', function() {

	/**
	* Verifies that a sub function can be passed the arguments object which can in turn override the values from within the function
	* This is similar to setting object keys of a passed object
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
