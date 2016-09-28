var argy = require('..');
var expect = require('chai').expect;

describe('argy.parse()', function() {

	it('should pass though correctly', function() {
		expect(argy(['hello']).as('string').parse()).to.be.deep.equal(['hello']);
		expect(argy([123]).as('number').parse()).to.be.deep.equal([123]);
		expect(argy([123, 'hello']).as('number string').parse()).to.be.deep.equal([123, 'hello']);
		expect(argy(['hello', 123]).as('string number').parse()).to.be.deep.equal(['hello', 123]);
	});

	it('should parse basic tests correctly', function() {
		expect(argy(['hello']).as('string [number] [date] [function]').parse()).to.be.deep.equal(['hello']);
		expect(argy([123]).as('[string] number').parse()).to.deep.equal([undefined, 123]);
	});

	it('should accept optional arguments correctly', function() {
		expect(argy(['foo', undefined]).as('string [string]').parse()).to.be.deep.equal(['foo', undefined, undefined]);
		expect(argy(['foo', undefined, 123]).as('string [string] [number]').parse()).to.be.deep.equal(['foo', undefined, 123]);
	});

	it('should process basic scenarios #1', function() {
		expect(argy(['John']).as('[string] [number]').parse()).to.deep.equal(['John']);
		expect(argy(['Matt', 30]).as('[string] [number]').parse()).to.deep.equal(['Matt', 30]);
		expect(argy([23]).as('[string] [number]').parse()).to.deep.equal([undefined, 23]);
		expect(argy([undefined, 23]).as('[string] [number]').parse()).to.deep.equal([undefined, 23]);
		expect(argy([]).as('[string] [number]').parse()).to.deep.equal([]);
	});

	it('should process basic scenarios #2', function() {
		expect(argy(['Joe']).as('[string] [array|string]').parse()).to.deep.equal(['Joe']);
		expect(argy(['Sally', 'Felix']).as('[string] [array|string]').parse()).to.deep.equal(['Sally', 'Felix']);
		expect(argy(['Joan', ['Glitch', 'Widget']]).as('[string] [array|string]').parse()).to.deep.equal(['Joan', ['Glitch', 'Widget']]);
		expect(argy([['Rover', 'Rex']]).as('[string] [array|string]').parse()).to.deep.equal([undefined, ['Rover', 'Rex']]);
	});

});

describe('argy.parse() - errors', function() {

	it('should throw when there is no valid rule', function() {
		expect(function() {
			argy([123]).as('string').parse();
		}).to.throw;

		expect(function() {
			argy(['hello']).as('number').parse();
		}).to.throw;

		expect(function() {
			argy(['hello', 123]).as('number date').parse();
		}).to.throw;
	});

});
