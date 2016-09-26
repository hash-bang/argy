var argy = require('..');
var expect = require('chai').expect;

describe('argy.parseTruth()', function() {

	it('should calculate the truth table correctly', function() {

		expect(argy().as('* * * *').parseTruth(true, false))
			.to.have.all.keys(["15"]);

		expect(argy().as('* * [*] *').parseTruth(true, false))
			.to.have.all.keys(["11", "15"]);

		expect(argy().as('* [*] [*] *').parseTruth(true, false))
			.to.have.all.keys(["9", "11", "13", "15"]);

		expect(argy().as('[*] [*] [*] *').parseTruth(true, false))
			.to.have.all.keys(["8", "9", "10", "11", "12", "13", "14", "15"]);
	});

});
