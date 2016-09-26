var _ = require('lodash');

function Argy(args) {
	var self = this;

	self.args = args;

	self.stack = [];

	self.optional = function(ref, types) {
		return self.add('optional', ref, types);
	};

	self.required = function(ref, types) {
		return self.add('required', ref, types);
	};

	self.require = self.required; // Alias

	self._getMatcherFunction = function(item) {
		// Coherce into an array if its not already
		if (!_.isArray(item)) item = [item];

		return _.map(item, function(i) {
			if (_.isUndefined(i)) {
				return function() { return true };
			} else if (_.isString(i)) {
				switch (i) {
					case '*': return function() { return true };
					case 'string': return _.isString;
					case 'number': return _.isNumber;
					case 'boolean': return _.isBoolean;
					case 'object': return _.isObject;
					case 'function': return _.isFunction;
				}
			} else {
				throw new Error('Unable to determine what to do with Argy matcher of type "' + i + '"');
			}
		});
	};

	self.add = function(cardinality, ref, matcher) {
		switch (cardinality) {
			case 'required':
				self.stack.push({
					cardinality: 'required',
					ref: ref,
					matcher: self._getMatcherFunction(matcher),
				});
				break;
			case 'optional':
				self.stack.push({
					cardinality: 'required',
					ref: ref,
					matcher: self._getMatcherFunction(matcher),
				});
				break;
			default: 
				throw new Error('Unknown cardinality "' + cardinality + '" when adding argument type to Argy object');
		}
		return self;
	};

	self.signature = function() {
		var walkSig = function(args, heap) {
			var thisArg = args.shift();

			if (thisSig.cardinality == 'required') {
				heap.push({
					matcher: thisArg.matcher,
				});
			}
		};

		var sig = [];

		walkSig(_.clone(self.stack), sig);

		return sig;
	};

	self.computedForm = undefined;

	/**
	* Examines an argument stack and returns all passed arguments as a CSV
	* e.g.
	*	function test () { getOverload(arguments) };
	*	test('hello', 'world') // 'string,string'
	*	test(function() {}, 1) // 'function,number'
	*	test('hello', 123, {foo: 'bar'}, ['baz'], [{quz: 'quzValue'}, {quuz: 'quuzValue'}]) // 'string,number,object,array,collection'
	*
	* @param object args The special JavaScript 'arguments' object
	* @return string CSV of all passed arguments
	*/
	self.getForm = function(args) {
		var i = 0;
		var out = [];
		while(1) {
			var argType = typeof args[i];
			if (argType == 'undefined') {
				break;
			} else if (argType == 'object' && Object.prototype.toString.call(args[i]) == '[object Array]') { // Special case for arrays being classed as objects
				argType = 'array';
			} else if (argType == 'object' && Object.prototype.toString.call(args[i]) == '[object Date]') {
				argType = 'date';
			} else if (args[i] === null) {
				argType = 'null';
			}
			out.push(argType);
			i++;
		}
		return out.toString();
	};

	// isForm() / isFormElse() {{{
	/**
	* Whether any ifForm() rule has matched in this object so far
	* @var {boolean}
	*/
	self.matchedForm = false;


	/**
	* Bind a form (the result of getForm) to a callback
	* If the argument form resembles the one given the callback is called
	* @param {string} form The form to match
	* @param {function} callback The callback to call if the form matches
	* @return {Object} this chainable object
	* @see GetForm()
	* @see ifFormElse()
	*/
	self.ifForm = function(form, callback) {
		if (!self.computedForm) self.computedForm = self.getForm(self.args);

		if (
			(typeof form == 'string' && form == self.computedForm) // Simple single rule match
			||
			(self.getForm([form]) == 'array' && form.some(match => self.computedForm == match)) // Any item in array rule match
		) {
			self.matchedForm = true;
			callback.apply(this, self.args);
		}

		return self;
	};


	/**
	* Bind a non-matching ifForm condition that is fired if none of the preceeding conditions were satisfied
	* @param {function} callback The callback to call if the form matches
	* @return {Object} this chainable object
	* @see GetForm()
	* @see ifForm()
	*/
	self.ifFormElse = function(callback) {
		if (!self.matchedForm && _.isFunction(callback)) callback.apply(this, self.args);
		return self;
	};
	// }}}

	return self;
}

module.exports = Argy;
