Argy
====
Swiss army knife for variadic functions.

Argy can be used in multiple ways:

* Matching against a argument form with ifForm() / ifFormElse()
* Matching against a stated pattern with as()


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

'As' syntax resembles a string (either space seperated or CSV) of types with optional types in square brackets:

```javascript
argy(arguments).as('number').into(myNumber) // Require a single number
argy(arguments).as('*').into(myNumber) // Require any type
```
