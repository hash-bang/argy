var argy = require('..');
var expect = require('chai').expect;

describe('argy - ifForm()', function() {

	it('should process basic scenarios #1', function() {
		var identify = function() {
			var id;

			argy(arguments)
				.ifForm('string', name => id = name)
				.ifForm('string,number', (name, age) => id = name + ' (' + age + ')')
				.ifForm('number', age => id = 'Unknown (' + age + ')')
				.ifFormElse(() => id = 'Unknown')

			return id;
		};

		expect(identify('John')).to.equal('John');
		expect(identify('Matt', 30)).to.equal('Matt (30)');
		expect(identify(23)).to.equal('Unknown (23)');
		expect(identify()).to.equal('Unknown');
	});

	it('should process basic scenarios #2', function() {
		var petLister = function() {
			var out;
			argy(arguments)
				.ifForm('string', name => out = name + ' has no pets')
				.ifForm('string,string', (name,pet) => out = name + ' has a pet called ' + pet)
				.ifForm('string,array', (name, pets) => out = name + ' has pets called ' + pets.join(', '))
				.ifForm('array', pets => out = 'An unknown owner has the pets ' + pets.join(', '))

			return out;
		};

		expect(petLister('Joe')).to.equal('Joe has no pets');
		expect(petLister('Sally', 'Felix')).to.equal('Sally has a pet called Felix');
		expect(petLister('Joan', ['Glitch', 'Widget'])).to.equal('Joan has pets called Glitch, Widget');
		expect(petLister(['Rover', 'Rex'])).to.equal('An unknown owner has the pets Rover, Rex');
	});

	it('should process arrays of matches', function() {
		var logger = function() {
			var out;
			argy(arguments)
				.ifForm(['string', 'number'], text => out = text)
				.ifForm('object', text => out = '[Object]')
				.ifFormElse(() => out = '[Unknown]')

			return out;
		};

		expect(logger('hello')).to.equal('hello');
		expect(logger(123)).to.equal(123);
		expect(logger({foo: 'fooVal'})).to.equal('[Object]');
		expect(logger(new Date)).to.equal('[Unknown]');
	});
});

