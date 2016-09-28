var argy = require('..');
var expect = require('chai').expect;

describe('argy.wrap()', function() {

	it('should process basic scenarios #1', function() {
		var identify = argy().as('[string] [number]').wrap(function(name, age) {
			return [name, age];
		});

		expect(identify('John')).to.deep.equal(['John', undefined]);
		expect(identify('Matt', 30)).to.deep.equal(['Matt', 30]);
		expect(identify(23)).to.deep.equal([undefined, 23]);
		expect(identify()).to.deep.equal([undefined, undefined]);
	});

	it.skip('should process basic scenarios #2', function() {
		var petLister = argy().as('[string] [string|array]').wrap(function(name, pets) {
			return [name, pets];
		});

		expect(petLister('Joe')).to.deep.equal(['Joe', []]);
		expect(petLister('Sally', 'Felix')).to.deep.equal(['Sally', ['Felix']]);
		expect(petLister('Joan', ['Glitch', 'Widget'])).to.deep.equal(['Joan', ['Glitch', 'Widget']]);
		expect(petLister(['Rover', 'Rex'])).to.equal([undefined, ['Rover', 'Rex']]);
	});

});
