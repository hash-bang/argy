var argy = require('..');
var expect = require('chai').expect;

describe('argy().getType()', function() {

	it('should recognise types', function() {
		expect(argy.getType(function() { })).to.equal('function');
		expect(argy.getType(123)).to.equal('number');
		expect(argy.getType('abc')).to.equal('string');
		expect(argy.getType(new Date)).to.equal('date');
		expect(argy.getType({foo: 'foo'})).to.equal('object');
		expect(argy.getType([1,2,3])).to.equal('array');
		expect(argy.getType(null)).to.equal('null');
		expect(argy.getType(undefined)).to.equal('undefined');
		expect(argy.getType(/hello/)).to.equal('regexp');
	});

});


describe('argy().isType()', function() {

	it('should identify single types', function() {
		expect(argy.isType(function() { }, 'function')).to.be.true;
		expect(argy.isType(123, 'number')).to.be.true;
		expect(argy.isType('abc', 'string')).to.be.true;
		expect(argy.isType(new Date, 'date')).to.be.true;
		expect(argy.isType({foo: 'foo'}, 'object')).to.be.true;
		expect(argy.isType([1,2,3], 'array')).to.be.true;
		expect(argy.isType(null, 'null')).to.be.true;
		expect(argy.isType(undefined, 'undefined')).to.be.true;
		expect(argy.isType(/foo/, 'regexp')).to.be.true;
	});

	it('should identify arrays of types', function() {
		expect(argy.isType(function() { }, ['string', 'function'])).to.be.true;
		expect(argy.isType(123, ['number', 'string'])).to.be.true;
		expect(argy.isType('abc', ['string'])).to.be.true;
		expect(argy.isType(new Date, ['date', 'function'])).to.be.true;
		expect(argy.isType({foo: 'foo'}, ['object', 'undefined'])).to.be.true;
		expect(argy.isType([1,2,3], ['array', 'object'])).to.be.true;
		expect(argy.isType(null, ['null', 'boolean', 'undefined'])).to.be.true;
		expect(argy.isType(undefined, ['null', 'undefined'])).to.be.true;
		expect(argy.isType(/foo/, ['object', 'regexp'])).to.be.true;
	});

});


describe('argy().isType() - meta types', function() {

	it('should identify \'any\' values', function() {
		expect(argy.isType(function() { }, 'any')).to.be.true;
		expect(argy.isType(123, '*')).to.be.true;
		expect(argy.isType('abc', 'any')).to.be.true;
		expect(argy.isType(new Date, 'any')).to.be.true;
		expect(argy.isType({foo: 'foo'}, '*')).to.be.true;
		expect(argy.isType([1,2,3], '*')).to.be.true;
		expect(argy.isType(null, '*')).to.be.true;
		expect(argy.isType(undefined, 'any')).to.be.true;
		expect(argy.isType(/foo/, 'any')).to.be.true;
	});

	it('should identify truey values', function() {
		expect(argy.isType(function() { }, 'truey')).to.be.true;
		expect(argy.isType(123, 'ok')).to.be.true;
		expect(argy.isType('abc', 'truey')).to.be.true;
		expect(argy.isType(new Date, 'truey')).to.be.true;
		expect(argy.isType({foo: 'foo'}, 'ok')).to.be.true;
		expect(argy.isType([1,2,3], 'ok')).to.be.true;
		expect(argy.isType(null, 'ok')).to.be.false;
		expect(argy.isType(undefined, 'truey')).to.be.false;
		expect(argy.isType(/foo/, 'truey')).to.be.true;
	});

	it('should identify falsy values', function() {
		expect(argy.isType(function() { }, 'notok')).to.be.false;
		expect(argy.isType(123, 'falsy')).to.be.false;
		expect(argy.isType('abc', 'notok')).to.be.false;
		expect(argy.isType(new Date, 'notok')).to.be.false;
		expect(argy.isType({foo: 'foo'}, 'falsy')).to.be.false;
		expect(argy.isType([1,2,3], 'falsy')).to.be.false;
		expect(argy.isType(null, 'falsy')).to.be.true;
		expect(argy.isType(undefined, 'notok')).to.be.true;
		expect(argy.isType(/foo/, 'notok')).to.be.false;
	});

	it('should identify scalar values', function() {
		expect(argy.isType(function() { }, 'scalar')).to.be.false;
		expect(argy.isType(123, 'scalar')).to.be.true;
		expect(argy.isType('abc', 'scalar')).to.be.true;
		expect(argy.isType(new Date, 'scalar')).to.be.false;
		expect(argy.isType({foo: 'foo'}, 'scalar')).to.be.false;
		expect(argy.isType([1,2,3], 'scalar')).to.be.false;
		expect(argy.isType(null, 'scalar')).to.be.false;
		expect(argy.isType(undefined, 'scalar')).to.be.false;
		expect(argy.isType(/foo/, 'scalar')).to.be.false;
	});

	it('should identify callback values', function() {
		expect(argy.isType(function() { }, 'function')).to.be.true;
		expect(argy.isType(function() { }, 'callback')).to.be.true;
		expect(argy.isType(function() { }, 'cb')).to.be.true;
	});

});


describe('argy().getForm()', function() {

	it('should recognise compound types', function() {
		expect(argy.getForm([undefined,undefined])).to.equal('');
		expect(argy.getForm([123, '123', function() { return 123 }, null, /123/])).to.equal('number string function null regexp');
	});

});
