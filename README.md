Argy
====
Swiss army knife for variadic functions.

Argy can be used in multiple ways:

* Matching against a argument form with ifForm() / ifFormElse()
* Matching against a stated pattern with as()
* Wrapping a function with wrap()


API
===

ifForm() / ifFormElse()
-----------------------
Run a callback if the form of the arguments matches a rule.

	ifForm(String <match> | Array <matches>, callback)
	ifFormElse(callback)


```javascript
// The following function tries to identify a person and their age based on optional arguments

function identify() {
	var id;

	argy(arguments)
		.ifForm('string', name => id = name)
		.ifForm('string,number', (name, age) => id = name + ' (' + age + ')')
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
====
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


Wrap()
======
Factory function which returns a wrapped function where the function arguments will be rearranged into the correct order.

This function provides a convenient way to specify the different specifications of arguments (using the `.as()`, `.add()` / `.required()` / `.optional` methods), then rewriting the args so the arguments are dependable.

```javascript
// Apply a wrapper to a new function
var myFunc = argy.wrap('[string] number function', function(a, b, c) {
	// 'a' will be either undefined or a string
	// 'b' will always be a number
	// 'c' will always be a function
});
```
