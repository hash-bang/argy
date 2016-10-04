var argy = require('..');
var expect = require('chai').expect;

describe('argy - ifForm()', function() {

	it('should process basic scenarios #1', function() {
		var identify = function() {
			var id;

			argy(arguments)
				.ifForm('string', function(name) { id = name })
				.ifForm('string number', function(name, age) { id = name + ' (' + age + ')' })
				.ifForm('number', function(age) { id = 'Unknown (' + age + ')' })
				.ifFormElse(function() { id = 'Unknown' })

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
				.ifForm('string', function(name) { out = name + ' has no pets' })
				.ifForm('string string', function(name,pet) { out = name + ' has a pet called ' + pet })
				.ifForm('string array', function(name, pets) { out = name + ' has pets called ' + pets.join(', ') })
				.ifForm('array', function(pets) { out = 'An unknown owner has the pets ' + pets.join(', ') })

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
				.ifForm(['string', 'number'], function(text) { out = text })
				.ifForm('object', function(text) { out = '[Object]' })
				.ifFormElse(function() { out = '[Unknown]' })

			return out;
		};

		expect(logger('hello')).to.equal('hello');
		expect(logger(123)).to.equal(123);
		expect(logger({foo: 'fooVal'})).to.equal('[Object]');
		expect(logger(new Date)).to.equal('[Unknown]');
	});

	it('should process the OR syntax', function() {
		var logger = function() {
			var out;
			argy(arguments)
				.ifForm('string|number', function(text) { out = text })
				.ifForm('object', function(text) { out = '[Object]' })
				.ifFormElse(function() { out = '[Unknown]' })

			return out;
		};

		expect(logger('hello')).to.equal('hello');
		expect(logger(123)).to.equal(123);
		expect(logger({foo: 'fooVal'})).to.equal('[Object]');
		expect(logger(new Date)).to.equal('[Unknown]');
	});

	it('should support blank forms', function() {
		var runCount = 0;

		argy()
			.ifForm('', function() {
				runCount++;
			})
			.ifForm('', function() {
				runCount++;
			}, true);

		expect(runCount).to.be.equal(2);
	});

	it('should only run a rule once', function() {
		var runCount = 0;

		argy(['hello'])
			.ifForm('string', function() {
				runCount++;
			})
			.ifForm('string', function() {
				runCount++;
			})

		expect(runCount).to.be.equal(1);
	});

	it('should run a rule multiple times if allowDupes=true', function() {
		var runCount = 0;

		argy(['hello'])
			.ifForm('string', function() {
				runCount++;
			})
			.ifForm('string', function() {
				runCount++;
			}, true)
			.ifForm('string', function() {
				expect.fail('running function when it shouldnt');
				runCount++;
			})

		expect(runCount).to.be.equal(2);
	});
});

