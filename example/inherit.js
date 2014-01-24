var ImmutableObject = require("../");

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

