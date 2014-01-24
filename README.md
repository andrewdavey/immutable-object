# Immutable Object

Use in Node.js:

```
npm install immutable-object
```

Or, in a web app. You'll need [ES5-shim](https://github.com/es-shims/es5-shim) for this to work in older web browsers.

## Examples

```js
var ImmutableObject = require("immutable-object");

var first = ImmutableObject({ foo: 1, bar: 2 });
var second = first.set({ foo: 2, buz: 3 });
```

You can use `ImmutableObject` as a base class.

```js
// Define a type that inherits from ImmutableObject
var Task = ImmutableObject.define({
  // ImmutableObject will call the `init` method when constructing an instance.
  init: function(text) {
    return this.set({ text: text, isDone: false });
  },
  // Mutation methods return a new object, the original is unchanged.
  setText: function(text) {
    // Use the `set` method to create the new object.
    return this.set({ text: text });
  },
  done: function() {
    return this.set({ isDone: true });
  },

  // Properties of the object are accessible as normal.
  toString: function() {
    return this.text + (this.isDone ? " - done" : "");
  }
});

var task = new Task("Buy ice cream");
console.log(task.toString());

// Any change results in a new object.
// So be sure to assign the result to use it.
task = task.setText("Eat ice cream");
console.log(task.toString());

task = task.done();
console.log(task.toString());
```

