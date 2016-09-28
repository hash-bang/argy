var _ = require('lodash');

function Argy(args) {
	var self = this;

	self.args = args || [];

	self.stack = [];

	self.optional = function(ref, types) {
		return self.add('optional', ref, types);
	};

	self.required = function(ref, types) {
		return self.add('required', ref, types);
	};

	self.require = self.required; // Alias

	self._getMatcherFunction = function(item) {
		switch (item) {
			case '*': return function() { return true };
			case 'string': return function(a) { return self.isType(a, 'string') };
			case 'number': return function(a) { return self.isType(a, 'number') };
			case 'boolean': return function(a) { return self.isType(a, 'boolean') };
			case 'object': return function(a) { return self.isType(a, 'object') };
			case 'function': return function(a) { return self.isType(a, 'function') };
			case 'date': return function(a) { return self.isType(a, 'date') };
			default:
				throw new Error('Unable to determine what to do with Argy matcher of type "' + item + '"');
		}
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
					cardinality: 'optional',
					ref: ref,
					matcher: self._getMatcherFunction(matcher),
				});
				break;
			default: 
				throw new Error('Unknown cardinality "' + cardinality + '" when adding argument type to Argy object');
		}
		return self;
	};

	/**
	* Shorthand function to create a stack
	* This is an alternative way to call add() / required() / optional()
	* e.g. argy(arguments).as('number [string] [function]') is the same as argy(arguments).required('number').optional('string').optional('function')
	* @param {string} pattern Pattern to process. Optional parameters are specified in square brackets
	* @return {Object} this chainable object
	*/
	self.as = function(pattern) {
		pattern
			.split(/[\s+,]+/)
			.forEach(function(arg) {
				if (/^\[.*\]$/.test(arg)) {
					self.add('optional', null, arg.substr(1, arg.length - 2));
				} else {
					self.add('required', null, arg);
				}
			});

		return this;
	};

	/**
	* Compile a truth table from the current stack contents
	* @param {boolean} [applyRequired=true] Whether to reduce the truth table by removing any element not satisfying the required fields
	* @param {boolean} [applyMatchers=true] Whether to further reduce the truth table by filtering out non-matching elements (type matching)
	* @return {Object} A truth table with each key as a possible value
	*/
	self.parseTruth = function(applyRequired, applyMatchers) {
		var maxVal = Math.pow(2, self.stack.length);
		var out = {};

		var filterRequired = applyRequired === undefined ? true : !!applyRequired;
		var filterMatchers = applyMatchers === undefined ? true : !!applyMatchers;

		// Calculate the bit mask (+2^offset for every required element)
		var mask = self.stack.reduce((total, arg, offset) => arg.cardinality == 'required' ? total + Math.pow(2, offset) : total, 0);

		for (var i = 0; i < maxVal; i++) {
			if (filterRequired && (i & mask) != mask) continue; // Doesn't satisfy require bitmask

			var args = self.stack.map((arg, offset) => (Math.pow(2, offset) & i) > 0 ? self.stack[offset] : null)

			// Calculate the argValues array (the args to actually pass to the function) {{{
			var argValues = [];
			var stackPointer = 0;
			var argPointer = 0;
			var argsValid = true;
			while (argPointer < self.args.length) {
				// Is undefined? {{{
				if (self.args[argPointer] === undefined) {
					if (self.stack[stackPointer] && self.stack[stackPointer].cardinality == 'required') {
						argsValid = false;
						break;
					} else {
						argValues.push(self.args[argPointer++]);
						stackPointer++;
					}
				}
				// }}}

				// Satisfies matcher? {{{
				if (!self.stack[stackPointer] || self.stack[stackPointer].matcher.call(self, self.args[argPointer])) {
					argValues.push(self.args[argPointer++]);
					stackPointer++;
				} else if (self.stack[stackPointer].cardinality == 'required') {
					argsValid = false;
					break;
				} else {
					argValues.push(undefined);
					stackPointer++;
				}
				// }}}
			}
			// }}}

			if (filterMatchers && !argsValid) continue;

			out[i] = {
				values: argValues,
				satisfies: {
					required: (i & mask) == mask,
					matchers: argsValid,
				},
			};
		}

		return out;
	};


	/**
	* Calculate the parse truth table to use and optionally assign a list of variable to their incomming arg values in order
	* This is an alternate way of reading back values contrasting with the first parameter of add() / optional() / required()
	* @param {mixed,...} arg The arguments to read back - this should approximately match the number of args in the stack any overflow values will be assigned as undefined
	* @return {array} Array of arguments determined from the stack and the incomming argument object
	*/
	self.parse = function(xargs) {
		var truth = self.parseTruth();

		var truthKeys = Object.keys(truth);
		if (truthKeys.length == 0) throw new Error('Invalid function invocation');

		return truth[truthKeys[0]].values;
	};


	/**
	* Cached string of the arguments object run via getForm()
	* This is to prevent multiple scans of the arg object when being used by a function that hits it a lot such as ifForm()
	* @var {string}
	* @see ifForm()
	*/
	self.computedForm = undefined;

	/**
	* Examines an argument stack and returns all passed arguments as a CSV
	* e.g.
	*	function test () { getOverload(arguments) };
	*	test('hello', 'world') // 'string,string'
	*	test(function() {}, 1) // 'function,number'
	*	test('hello', 123, {foo: 'bar'}, ['baz'], [{quz: 'quzValue'}, {quuz: 'quuzValue'}]) // 'string,number,object,array,collection'
	*
	* @param {object} args The special JavaScript 'arguments' object
	* @return {string} CSV of all passed arguments
	*/
	self.getForm = function(args) {
		var i = 0;
		var out = [];
		while(1) {
			var argType = self.getType(args[i]);
			if (argType == 'undefined') break;
			out.push(argType);
			i++;
		}
		return out.toString();
	};

	/**
	* Return the type of a single variable as a lower case string
	* This is really just an augmented version of the built in `typeof` with extra functionality to recognise arrays
	* @param {mixed} arg The variable to analyse
	* @return {string} The type of the variable as a lower case string
	*/
	self.getType = function(arg) {
		var argType = typeof arg;
		if (argType == 'undefined') {
			return 'undefined';
		} else if (argType == 'object' && Object.prototype.toString.call(arg) == '[object Array]') { // Special case for arrays being classed as objects
			return 'array';
		} else if (argType == 'object' && Object.prototype.toString.call(arg) == '[object Date]') {
			return 'date';
		} else if (arg === null) {
			return 'null';
		} else {
			return argType;
		}
	};

	/**
	* Convenience function to compare an incoming variable with a return of getType()
	* @param {mixed} arg The variable being analysed
	* @param {string|array} typeCompare The return of getType to compare to. If an array is passed this function will return true if the type is any of its contents
	* @return {boolean} Boolean if arg is of the typeCompare type
	*/
	self.isType = function(arg, typeCompare) {
		if (self.getType(typeCompare) == 'array') {
			var isType = self.getType(arg);
			return typeCompare.some(function(t) { return t == isType });
		} else {
			return self.getType(arg) == typeCompare;
		}
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
			(self.getType(form) == 'array' && form.some(match => self.computedForm == match)) // Any item in array rule match
		) {
			self.matchedForm = true;
			callback.apply(this, self.args);
		}

		return self;
	};


	/**
	* Bind a non-matching ifForm condition that is fired if none of the preceding conditions were satisfied
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

	/**
	* Return a wrapped closure function which will take arguments and rewrite them to match the spec
	* @param {function} callback The callback to invoke if the spec is matched
	* @return {function} The wrapped function closure
	*/
	self.wrap = function(callback) {
		return function() {
			self.args = arguments;
			var funcArgs = self.parse();

			return callback.apply(this, funcArgs);
		};
	};

	return self;
}

module.exports = Argy;
