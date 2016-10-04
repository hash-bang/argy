var argy = require('..');
var expect = require('chai').expect;

describe('argy.cast()', function() {
	it('should cast types', function() {
		expect(argy.cast('123', 'string')).to.equal('123');
		expect(argy.cast('123', 'number')).to.equal(123);
		expect(argy.cast(123, 'string')).to.equal('123');
		expect(argy.cast('foo', 'number')).to.be.nan;
		expect(argy.cast('foo', 'array')).to.deep.equal(['foo']);
		expect(argy.cast('123', 'array')).to.deep.equal(['123']);
		expect(argy.cast(123, 'boolean')).to.equal(true);
		expect(argy.cast(0, 'boolean')).to.equal(false);
		expect(argy.cast('123', 'boolean')).to.equal(true);
		expect(argy.cast('', 'boolean')).to.equal(false);
		expect(argy.cast('foo', 'boolean')).to.equal(true);
		expect(argy.cast('foo', 'regexp')).to.be.a.regexp;
	});
});

describe('argy - casting', function() {

	it('should cast to a number', function() {
		var myFunc = argy('*>number', function(a) { return [a] });
		expect(myFunc('123')).to.deep.equal([123]);
		expect(myFunc(123)).to.deep.equal([123]);
	});

	it('should cast to a string', function() {
		var myFunc = argy('*>string', function(a) { return [a] });
		expect(myFunc('foo')).to.deep.equal(['foo']);
		expect(myFunc('123')).to.deep.equal(['123']);
		expect(myFunc(123)).to.deep.equal(['123']);
	});

	it('should cast to a boolean', function() {
		var myFunc = argy('*>boolean', function(a) { return [a] });
		expect(myFunc('foo')).to.deep.equal([true]);
		expect(myFunc('123')).to.deep.equal([true]);
		expect(myFunc(123)).to.deep.equal([true]);
		expect(myFunc('')).to.deep.equal([false]);
		expect(myFunc(0)).to.deep.equal([false]);
	});

	it('should cast to an array', function() {
		var myFunc = argy('*>array', function(a) { return [a] });
		expect(myFunc('foo')).to.deep.equal([['foo']]);
		expect(myFunc('123')).to.deep.equal([['123']]);
		expect(myFunc(123)).to.deep.equal([[123]]);
		expect(myFunc(/foo/)).to.deep.equal([[/foo/]]);
	});

	it('should cast to a regexp', function() {
		var myFunc = argy('*>regexp', function(a) { return [a] });
		expect(myFunc('foo')).to.deep.equal([/foo/]);
		expect(myFunc('123')).to.deep.equal([/123/]);
		expect(myFunc(123)).to.deep.equal([/123/]);
	});

});
