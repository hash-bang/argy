var argy = require('..');
var expect = require('chai').expect;

describe('argy.wrap() test #1', function() {

	it('should process a scenario using "as" syntax', function() {
		var identify = argy().as('[string] [number]').wrap(function(name, age) {
			return [name, age];
		});

		expect(identify('John')).to.deep.equal(['John', undefined]);
		expect(identify('Matt', 30)).to.deep.equal(['Matt', 30]);
		expect(identify(23)).to.deep.equal([undefined, 23]);
		expect(identify()).to.deep.equal([undefined, undefined]);
	});

	it('should process a scenario using builder syntax', function() {
		var identify = argy()
			.optional('string')
			.optional('number')
			.wrap(function(name, age) {
				return [name, age];
			});

		expect(identify('John')).to.deep.equal(['John', undefined]);
		expect(identify('Matt', 30)).to.deep.equal(['Matt', 30]);
		expect(identify(23)).to.deep.equal([undefined, 23]);
		expect(identify()).to.deep.equal([undefined, undefined]);
	});

	it('should process a scenario using the single function syntax', function() {
		var identify = argy('[string] [number]', function(name, age) {
			return [name, age];
		});
		expect(identify('John')).to.deep.equal(['John', undefined]);
		expect(identify('Matt', 30)).to.deep.equal(['Matt', 30]);
		expect(identify(23)).to.deep.equal([undefined, 23]);
		expect(identify()).to.deep.equal([undefined, undefined]);
	});

});

describe('argy.wrap() test #2', function() {

	it('should process scenario using "as" syntax', function() {
		var petLister = argy().as('[string] [string|array]').wrap(function(name, pets) {
			return [name, pets];
		});

		expect(petLister('Joe')).to.deep.equal(['Joe', undefined]);
		expect(petLister('Sally', 'Felix')).to.deep.equal(['Sally', 'Felix']);
		expect(petLister('Joan', ['Glitch', 'Widget'])).to.deep.equal(['Joan', ['Glitch', 'Widget']]);
		expect(petLister(['Rover', 'Rex'])).to.deep.equal([undefined, ['Rover', 'Rex']]);
	});

	it('should process a scenario using builder syntax', function() {
		var petLister = argy()
			.optional('string')
			.optional(['string', 'array'])
			.wrap(function(name, pets) {
				return [name, pets];
			});

		expect(petLister('Joe')).to.deep.equal(['Joe', undefined]);
		expect(petLister('Sally', 'Felix')).to.deep.equal(['Sally', 'Felix']);
		expect(petLister('Joan', ['Glitch', 'Widget'])).to.deep.equal(['Joan', ['Glitch', 'Widget']]);
		expect(petLister(['Rover', 'Rex'])).to.deep.equal([undefined, ['Rover', 'Rex']]);
	});

	it('should process a scenario using the single function syntax', function() {
		var petLister = argy('[string] [string|array]', function(name, pets) {
			return [name, pets];
		});

		expect(petLister('Joe')).to.deep.equal(['Joe', undefined]);
		expect(petLister('Sally', 'Felix')).to.deep.equal(['Sally', 'Felix']);
		expect(petLister('Joan', ['Glitch', 'Widget'])).to.deep.equal(['Joan', ['Glitch', 'Widget']]);
		expect(petLister(['Rover', 'Rex'])).to.deep.equal([undefined, ['Rover', 'Rex']]);
	});

});

describe('argy.wrap() - errors', function() {

	it('should raise an error when called wrong', function() {
		expect(function() {
			var myFunc = argy('string [number]', function(name, age) {});
			myFunc(56);
		}).to.throw('Invalid function invocation. Function expects form "string [number]" but was called as "number"');

		expect(function() {
			var myFunc = argy('string [number|date] callback', function(name, age) {});
			myFunc('hello', new Date(), 123);
		}).to.throw('Invalid function invocation. Function expects form "string [number|date] callback" but was called as "string date number"');
	});

});
