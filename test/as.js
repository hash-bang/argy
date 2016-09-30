var argy = require('..');
var expect = require('chai').expect;

describe('argy.as()', function() {

	it('should parse one arg', function() {
		var stack = argy.as('*').stack;
		
		expect(stack).to.have.length(1);
		expect(stack[0]).to.have.property('cardinality', 'required');
	});

	it('should parse an optional one arg', function() {
		var stack = argy.as('[*]').stack;
		
		expect(stack).to.have.length(1);
		expect(stack[0]).to.have.property('cardinality', 'optional');
	});

	it('should parse casting', function() {
		var stack = argy.as('scalar>string').stack;
		
		expect(stack).to.have.length(1);
		expect(stack[0]).to.have.property('cardinality', 'required');
		expect(stack[0]).to.have.property('matcherString')
		expect(stack[0].matcherString).to.deep.equal(['scalar']);
		expect(stack[0]).to.have.property('cast', 'string');
	});

	it('should parse complex strings', function() {
		var stack = argy.as('string number [function] [number|string>string] number').stack;
		
		expect(stack).to.have.length(5);

		expect(stack[0]).to.have.property('cardinality', 'required');
		expect(stack[1]).to.have.property('cardinality', 'required');
		expect(stack[2]).to.have.property('cardinality', 'optional');
		expect(stack[3]).to.have.property('cardinality', 'optional');
		expect(stack[3]).to.have.property('cast', 'string');
		expect(stack[4]).to.have.property('cardinality', 'required');
	});

});
