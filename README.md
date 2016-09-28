Argy
====
Zero-dependency Swiss Army knife for variadic functions.



Basic usage
-----------
Argy operates by selecting two parts - how you specify the function standard and what you do with it afterwards:

1. The specification specifier - choose either the [as](#as) or [builder](#builder) specification setups. If you want different specifications to do different things use [ifForm](#ifform).
	- **as syntax** - Use a string to specify what a function can accept (e.g. `argy().as('string [number]')`)
	- **builder syntax** - Use an object based declaration to specify the function standard (e.g. `argy().required('string').optional('number')`)
	* **ifForm syntax** - Specify different callbacks to run for different forms (e.g. `argy().ifForm('string', funcFoo).ifForm('number', funcBar')`)

2. The output specified - choose either the [wrap](#wrap) or [parse](#parse) APIs
	- **wrap** - Return a function that will be called by Argy when the specification is satisfied (e.g. `argy().as('... your spec ...').wrap(function(a, b, c) { // Your function // })`)
	- **parse** - Return an array of extracted parameters (e.g. `argy().as('... your spec ...').parse()`). This method is useful if you have [destructuring](https://hacks.mozilla.org/2015/05/es6-in-depth-destructuring/) available in your parser.



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

See the [test/wrap.js](tests) for more complex examples.
