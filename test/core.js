var argy = require('..');
var expect = require('chai').expect;

describe('Argy() call', function() {

	it('should create a new object on each call', function() {
		var a1 = argy();
		a1.id = 123;

		var a2 = argy();

		expect(a1).to.not.be.equal(a2);
		expect(a2).to.not.have.property('id');
	});
	
});
