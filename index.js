// Main object {{{
function Argy(args) {
	var self = this;

	self.args = args || [];

	self.stack = [];

	self.optional = function(types) {
		return self.add('optional', types);
	};

	self.required = function(types) {
		return self.add('required', types);
	};

	self.require = self.required; // Alias

	self.add = function(cardinality, matcher, cast) {
		if (cardinality != 'required' && cardinality != 'optional') throw new Error('Unknown cardinality "' + cardinality + '" when adding argument type to Argy object');

		if (!matcher) {
			matcher = '*';
		} else if (Argy.isType(matcher, 'string')) {
			matcher = matcher.split(/[\s\|,]+/);
		} else if (Argy.isType(matcher, 'array')) {
			// Already an array - do nothing
		} else {
			throw new Error('Unknown matcher specification - ' + matcher);
		}

		self.stack.push({
			cardinality: cardinality,
			matcher: function(a) { return Argy.isType(a, matcher) },
			matcherString: matcher,
			cast: cast,
		});

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
				var parsed = /^(\[)?(.+?)(>.+?)?(\])?$/.exec(arg);
				if (!parsed) throw new Error('Invalid "as" syntax for specifier "' + arg + '"');
				self.add(
					parsed[1] && parsed[4] ? 'optional' : 'required',
					parsed[2],
					(parsed[3] ? parsed[3].substr(1) : false)
				);
			});

		return this;
	};


	/**
	* Return the specfication form as a string
	* This is the opposite function to as()
	* @return {string} The specification as a string
	*/
	self.getSpecString = function() {
		return self.stack
			.map(function(item) {
				return (
					(item.cardinality == 'optional' ? '[' : '') +
					(
						Argy.isType(item.matcherString, 'array') && item.matcherString.length > 1 ? item.matcherString.join('|')
							: Argy.isType(item.matcherString.length, 'array') ? item.matcherString[0]
							: item.matcherString
					) +
					(item.cardinality == 'optional' ? ']' : '')
				);
			})
			.join(' ');
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
		var mask = self.stack.reduce(function(total, arg, offset) {
			return (arg.cardinality == 'required' ? total + Math.pow(2, offset) : total);
		}, 0);

		for (var i = 0; i < maxVal; i++) {
			if (filterRequired && (i & mask) != mask) continue; // Doesn't satisfy require bitmask

			var args = self.stack.map(function(arg, offset) {
				return ((Math.pow(2, offset) & i) > 0 ? self.stack[offset] : null);
			})

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
	self.parse = function() {
		var truth = self.parseTruth();

		var truthKeys = Object.keys(truth);
		if (truthKeys.length == 0) throw new Error('Invalid function invocation. Function expects form "' + self.getSpecString() + '" but was called as "' + self.getForm() + '"');

		return truth[truthKeys[0]].values.map(function(val, i) {
			return self.stack[i] && self.stack[i].cast ? Argy.cast(val, self.stack[i].cast) : val;
		});
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
	* @param {boolean} [allowDupes=false] Allow this rule to also run (a duplicate) even if a previous rule matched
	* @return {Object} this chainable object
	* @see GetForm()
	* @see ifFormElse()
	*/
	self.ifForm = function(forms, callback, allowDupes) {
		if (
			(!self.matchedForm || allowDupes) &&
			(Argy.isType(forms, 'array') ? forms : [forms])
				.some(function(form) {
					var formSplit = form.split(/[\s,]+/);
					if (formSplit.length == 1 && formSplit[0] == '') formSplit = []; // Special case for empty forms

					return (
						self.args.length == formSplit.length &&
						formSplit.every(function(type, i) {
							// Compare the expression against the argument (if its got a "|" character split it into an array beforehand)
							return self.args.hasOwnProperty(i) && Argy.isType(self.args[i], /\|/.test(type) ? type.split('|') : type);
						})
					);
				})
		) {
			self.matchedForm = true;
			callback.apply(this, self.args);
		}

		return self;
	};


	/**
	* Bind a non-matching ifForm condition that is fired if none of the preceding conditions were satisfied
	* @param {function} callback The callback to call if no other form matches - the first argument will be the form pattern followed by all other arguments
	* @return {Object} this chainable object
	* @see GetForm()
	* @see ifForm()
	*/
	self.ifFormElse = function(callback) {
		if (!self.matchedForm && Argy.isType(callback, 'function')) callback.apply(this, [self.getForm()].concat(self.args));
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

	// Utility functions {{{
	/**
	* Cached string of the arguments object
	* This is to prevent multiple scans of the arg object when being used by a function that hits it a lot such as getForm()
	* @var {string}
	* @see ifForm()
	*/
	self.computedForm = undefined;

	/**
	* Return the parsed version of the form for this object instance
	* @see getForm()
	*/
	self.getForm = function() {
		if (!self.computedForm) self.computedForm = Argy.getForm(self.args);
		return self.computedForm;
	};
	// }}}

	return self;
}
// }}}

module.exports = function(args) {
	if (Argy.getForm(arguments) == 'string function') { // Called as argy(As-Syntax, Callback)
		return (new Argy())
			.as(arguments[0])
			.wrap(arguments[1]);
	} else { // Called as argy(arguments)
		return new Argy(args);
	}
};

// Utility functions {{{
/**
* Provide a shorthand version of `as` that instanciates the object
* @see as()
*/
module.exports.as = function(spec) {
	return (new Argy())
		.as(spec);
};

/**
* Examines an argument stack and returns all passed arguments as a space delimited string
* e.g.
*	function test () { argy.getForm(arguments) };
*	test('hello', 'world') // 'string string'
*	test(function() {}, 1) // 'function number'
*	test('hello', 123, {foo: 'bar'}, ['baz'], [{quz: 'quzValue'}, {quuz: 'quuzValue'}]) // 'string number object array collection'
*
* @param {object} args The special JavaScript 'arguments' object
* @return {string} CSV of all passed arguments
*/
module.exports.getForm = Argy.getForm = function(args) {
	var i = 0;
	var out = [];
	while(1) {
		var argType = Argy.getType(args[i]);
		if (argType == 'undefined') break;
		out.push(argType);
		i++;
	}
	return out.join(' ');
};

/**
* Return the type of a single variable as a lower case string
* This is really just an augmented version of the built in `typeof` with extra functionality to recognise arrays
* @param {mixed} arg The variable to analyse
* @return {string} The type of the variable as a lower case string
*/
module.exports.getType = Argy.getType = function(arg) {
	var argType = typeof arg;
	if (argType == 'undefined') {
		return 'undefined';
	} else if (argType == 'object' && Object.prototype.toString.call(arg) == '[object Array]') { // Special case for arrays being classed as objects
		return 'array';
	} else if (argType == 'object' && Object.prototype.toString.call(arg) == '[object Date]') {
		return 'date';
	} else if (argType == 'object' && Object.prototype.toString.call(arg) == '[object RegExp]') {
		return 'regexp';
	} else if (arg === null) {
		return 'null';
	} else {
		return argType;
	}
};

/**
* Convenience function to compare an incoming variable with a return of getType()
*
* Additional types compared:
* 	- '*' / 'any' = Anything (will always return true)
* 	- 'scalar' / 'basic' = Any number / string / boolean type
*	- 'ok' / 'truey' = Any value that equates to a truey approximation
*	- 'notok' / 'falsy' = Any value that equates to a falsy approximation
* 	- 'callback' / 'cb' = Aliases of 'function'
*
* @param {mixed} arg The variable being analysed
* @param {string|array} typeCompare The return of getType to compare to. If an array is passed this function will return true if the type is any of its contents. All values are automatically lower cased
* @return {boolean} Boolean if arg is of the typeCompare type
*/
module.exports.isType = Argy.isType = function(arg, typeCompare) {
	if (Argy.getType(typeCompare) != 'array') typeCompare = [typeCompare]; // Force comparitor to be an array

	var gotType = Argy.getType(arg);

	return typeCompare.some(function(comparitor) {
		comparitor = comparitor.toLowerCase();
		switch (comparitor) {
			case '*':
			case 'any':
				return true;
			case 'scalar':
			case 'basic':
				return (gotType == 'number' || gotType == 'string' || gotType == 'boolean');
			case 'ok':
			case 'truey':
				return (gotType != 'null' && gotType != 'undefined');
			case 'notok':
			case 'falsy':
				return (gotType == 'null' || gotType == 'undefined');
			case 'callback':
			case 'cb':
				return (gotType == 'function');
			default:
				return gotType == comparitor;
		}
		return t == isType
	});
};

/**
* Convert from an input type to an output type
* Since some types are not translatable the functionality to convert between types is limited
*/
module.exports.cast = Argy.cast = function(input, outType) {
	var inType = Argy.getType(input);
	var isScalar = Argy.isType(input, 'scalar');

	if (inType == outType) { // Nothing to do
		return input;
	} else if (outType == 'number' && inType == 'string') {
		return parseFloat(input);
	} else if (outType == 'string' && inType == 'number') {
		return input.toString();
	} else if (outType == 'boolean' && isScalar) {
		return !! input;
	} else if (outType == 'array' && (isScalar || inType == 'regexp')) {
		return [input];
	} else if (outType == 'regexp' && isScalar) {
		return new RegExp(input);
	} else {
		throw new Error('Cannot cast type "' + inType + '" to "' + outType + '" for value "' + input + '" as the types are incompatible');
	}
};
// }}}
