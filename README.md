Argy
====
Zero-dependency Swiss Army knife for variadic functions.


What is it?
-----------
Tired of handling variadic function babysitting like this:

```javascript
/**
* Query stuff
* @param {string} [id] Optional ID to fetch
* @param {Object} [query] Additional query parameters
* @param {function} callback Required callback
*/
this.query = function(id, query, callback) {
	if (_.isString(id) && _.isObject(query) && _.isFunction) { // Called as query(id, query, callback)
		// Argument are correct
	} else if (_.isObject(id) && _.isFunction(callback)) { // Called as query(id, callback)
		[id, query, callback] = [undefined, id, query]; // Destructuring for the win!
	} else if (_.isFunction(id)) { // Called as query(callback)
		[id, query, callback] = [undefined, undefined, id];
	} else {
		// ... and yet more conditions
	}

	// Now we can get on with stuff
};
```
... of course its even worse when you don't have [destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) available.

Argy removes the need to do function argument mangling and allows you to specify what a function can accept in a simple syntax.


Some examples
-------------

```javascript
// Make a query function that can accept three parameters: a string, an object and a callback (required)
this.query = argy('[string] [object] function', function(id, query, callback) {
	// id, query, callback are now dependable functions even if the function is called without an id or query
});

// Alternate syntax of the above
this.query = argy.as('[string] [object] function').wrap(function(id, query, callback) { // ... // });

// More alternate syntax
this.query = argy.optional('string').optional('object').required('function').wrap(function(id, query, callback) { // ... // });

// Yet another alternate syntax - this time decode the parameters inside the function with destructuring
this.query = function(id, query, callback) {
	[id, query, callback] = argy(arguments).as('[string] [object] function').parse();
};

// Non-destructuring example of the above
this.query = function(id, query, callback) {
	var parsed = argy(arguments).as('[string] [object] function').parse();
	id = parsed[0];
	query = parsed[1];
	callback = parsed[2];
};

// Non-destructuring example of the above - this time using a closure
this.query = function(id, query, callback) {
	argy(arguments)
		.as('[string] [object] function')
		.wrap(function(rawId, rawQuery, rawCallback) {
			id = rawId;
			query = rawQuery;
			callback = rawCallback;
		});
};
```

```javascript
// Create a function that acts differently depending on how it was called (overloading)
this.query = function(id, query, callback) {
	argy(arguments)
		.ifForm('string', function(id) { // Only given an ID })
		.ifForm('object', function(query) { // Only given an object })
		.ifForm('function', function(callback) { // Only given a function })
		.ifForm('string function', function(id, callback) { // Given both an ID and a function })
		.ifForm(['string object function', 'number object function'], funcion(id, query, callback) { // Given either a string + object + function or number + object + function })
		.ifForm('date|boolean function', function(time, callback) { // Given a date OR boolean and a function })
		.ifFormElse(function(form) { // Pattern didn't match any of the above })
};
```



Basic usage
-----------
Argy operates by selecting two paths - how you specify the function standard and what you do with it afterwards:

1. The specification specifier - choose either the [as](#as) or [builder](#builder) specification setups. If you want different specifications to do different things use [ifForm](#ifform).
	- **as syntax** - Use a string to specify what a function can accept (e.g. `argy().as('string [number]')`)
	- **single function syntax** - An alternative way to specify `as` syntax is to pass two parameters to argy (e.g. `argy('[string] [number]', function(name, number) { ... })`)
	- **builder syntax** - Use an object based declaration to specify the function standard (e.g. `argy().required('string').optional('number')`)
	- **ifForm syntax** - Specify different callbacks to run for different forms (e.g. `argy().ifForm('string', funcFoo).ifForm('number', funcBar')`)

2. The output handler - choose either the [wrap](#wrap) or [parse](#parse) APIs
	- **wrap** - Return a function that will be called by Argy when the specification is satisfied (e.g. `argy().as('... your spec ...').wrap(function(a, b, c) { // Your function // })`)
	- **parse** - Return an array of extracted parameters (e.g. `argy().as('... your spec ...').parse()`). This method is useful if you have [destructuring](https://hacks.mozilla.org/2015/05/es6-in-depth-destructuring/) available in your parser.


Casting
-------
Argy also supports variable casting. This forces an incomming value to be of a certain type. Since some types are not translatable the functionality to convert between types is limited but this can be helpful when requiring an input to be of a certain style. Casting is specified in the as syntax using the greater-than operator after the type e.g. `scalar>string` will force any scalar input into the string type.

For more details see the [Argy.cast()](#argycast) function.

```javascript
argy('scalar>string', function(id) {
	// `id` will ALWAYS be a string type even if it was passed as a number
});

argy('scalar|array>array', function(id) {
	// `id` will ALWAYS be an array of values, even if it was passed as a single scalar
});

argy('*>boolean', function(enable) {
	// `enable` will always be evaluated as a boolean
});
```


Specification API
=================

ifForm()
--------
Run a callback if the form of the arguments matches a rule.

	ifForm(String <match> | Array <matches>, callback)
	ifFormElse(callback)

Rules can be single strings or arrays. If an array is passed any rule within that array is counted as satisfying the form (an 'OR' rule).

Strings can be composed of parameters seperated by spaces or commas with optional pipes (`|`) to specify multiple types: e.g. `string string|number date` indicates that the first argument should be a string, the second could be a string OR a number and the third should be a date.


```javascript
// The following function tries to identify a person and their age based on optional arguments

function identify() {
	var id;

	argy(arguments)
		.ifForm('string', name => id = name)
		.ifForm('string number', (name, age) => id = name + ' (' + age + ')')
		.ifForm('number', age => id = 'Unknown (' + age + ')')
		.ifFormElse(() => id = 'Unknown')

	return id;
};

identify('Matt', 30) // "Matt (30)"
identify('Joe') // "Joe"
identify(23) // "Unknown (23)"
identify() // "Unknown"
```

See the [test/ifForm.js](tests) for more complex examples.


as()
----
The `as()` method is a shorthand version of the `add()` / `required()` / `optional()` methods.

'As' syntax resembles a string (either space separated or CSV) of types with optional types in square brackets:

```javascript
// Require a single number
argy(arguments).as('number').into(myNumber)

// Require any type
argy(arguments).as('*').into(myNumber)

// Require a string followed by an optional number
argy(arguments).as('string [number]').into(myNumber)

// Require a number preceeded by an optional string (reverse of above with args expanding from right)
argy(arguments).as('[string] number').into(myNumber)
```

See the [test/as.js](tests) for more complex examples.


builder
-------
The builder format uses object chains to lay out a specification.

```javascript
// Wrap a function with an optional string, required number and optional date
argy()
	.optional('string')
	.required('number')
	.optional('date')
	.wrap(function(a, b, c) { // Your function // });


// Parse values of a function
function myFunc(a, b, c) {
	var args = argy(arguments)
		.required('scalar')
		.optional('function')
		.parse();

	// Args should now be an array of two items
}
```

See the [test/wrap.js](tests) for more complex examples.


Output API
==========

parse()
-------
Compile a specification against incoming arguments and return an array of the correct response.

Parse is especially useful if your language has destructuring support.


```javascript
// Parse values of a function
function myFunc() {
	var [name, callback] = argy(arguments).as('scalar [function]').parse();
}
```

See the [test/parse.js](tests) for more complex examples.


wrap()
------
Factory function which returns a wrapped function where the function arguments will be rearranged into the correct order.

This function provides a convenient way to specify the different specifications of arguments (using the `.as()`, `.add()` / `.required()` / `.optional` methods), then rewriting the args so the arguments are dependable.

```javascript
// Apply a wrapper to a new function
var myFunc = argy.as('[string] number function').wrap(function(a, b, c) {
	// 'a' will be either undefined or a string
	// 'b' will always be a number
	// 'c' will always be a function
});
```

It is also possible to pass two parameters to Argy to replicate the same functionality:

```javascript
// Apply a wrapper to a new function
var myFunc = argy('[string] number function', function(a, b, c) {
	// 'a' will be either undefined or a string
	// 'b' will always be a number
	// 'c' will always be a function
});
```

See the [test/wrap.js](tests) for more complex examples.


Utility APIs
============

argy().getSpecString()
----------------------
Return the compiled version of a specification as a space seperated string.
This is the opposite function to `as()`.

```javascript
// Get the specification syntax from an Argy instance compiled with 'as()'
argy()
	.as('string [date] callback')
	.getSpecString() // => 'string [date] callback'


// Get the specification syntax from an Argy instance compiled using the builder syntax
argy()
	.required('string')
	.optional('date')
	.required('callback')
	.getSpecString() // => 'string [date] callback');
```


Argy.as()
---------
Shortcut function to create a new Argy instance without specifying any parameters.
This is functionally identical to `argy().as()`


Argy.cast()
-----------
Attempt to convert an input type into an output type. Since some types are not translatable the functionality to convert between types is limited.

```javascript
argy.cast(123, 'string') => '123'
argy.cast('foo', 'number') => 0
argy.cast('456', 'number') => 456
argy.cast('foo', 'array') => ['foo']
argy.cast(123, 'array') => [123]
```

See the [test/cast.js](tests) for more complex examples.


Argy.getForm(arguments)
-----------------------
Returns a space separated string of the arguments object where each item is run via `getType`.

```javascript
function myFunc() {
	argy.getForm(arguments) // => "string number date"
};
myFunc('hello', 123, new Date);
```


Argy.getType(variable)
----------------------
Returns the lower-case type specification of a variable.

```javascript
argy.getType('hello') // => 'string'
argy.getType([1,2,3]) // => 'array'
argy.getType({foo: 'fooValue'}) // => 'object'
argy.getType(new Date) // => 'date'
argy.getType(function() {}) // => 'function'
```


Argy.isType(variable, types)
----------------------------
Compares a single variable against a type or array of types.
If `types` is an array this function will return true if *any* of the array items match.

In addition to the types returned by `getType()` this function also supports the following meta-comparators:

| Type               | Description                              |
|--------------------|------------------------------------------|
| `*` / `any`        | Always returns true                      |
| `scalar` / `basic` | Match any number, string or boolean      |
| `ok` / `truey`     | Match any non-null or non-undefined type |
| `notok` / `falsy`  | Match any null or undefined type         |
| `callback` / `cb`  | Aliases of 'function'                    |
