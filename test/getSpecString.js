var argy = require('..');
var expect = require('chai').expect;

describe('argy.getSpecString()', function() {

	it('should return the parsed spec string correctly (as syntax)', function() {
		expect(argy().as('string').getSpecString()).to.equal('string');
		expect(argy().as('string number').getSpecString()).to.equal('string number');
		expect(argy().as('string array|object').getSpecString()).to.equal('string array|object');
		expect(argy().as('string [date] callback').getSpecString()).to.equal('string [date] callback');
	});

	it('should return the parsed spec string correctly (builder syntax)', function() {
		expect(argy().required('string').getSpecString()).to.equal('string');
		expect(argy().required('string').required('number').getSpecString()).to.equal('string number');
		expect(argy().required('string').required('array|object').getSpecString()).to.equal('string array|object');
		expect(argy().required('string').optional('date').required('callback').getSpecString()).to.equal('string [date] callback');
	});
	
});
