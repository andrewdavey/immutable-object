var ImmutableObject = require("./index");
var assert = require("chai").assert;

describe("constructor", function() {
  var obj;
  beforeEach(function() {
    obj = ImmutableObject({ a: 1, b: 2, c: 3, d: 4 });
  });

  it("allows read access to properties", function() {
    assert.equal(obj.a, 1);
    assert.equal(obj.b, 2);
  });

  it("freezes object", function() {
    assert(Object.isFrozen(obj));
  });

  it("throws if trying to write property, in strict mode", function() {
    "use strict";
    assert.throw(function() { obj.a = 2; }, TypeError);
  });

  it("can be called with new operator", function() {
    var obj = new ImmutableObject({ a: 1 });
    assert.equal(obj.a, 1);
  });
});

describe("set method", function() {
  var obj;
  beforeEach(function() {
    obj = ImmutableObject({});
  });

  it("returns a new object", function() {
    var newObject = obj.set({a:1});
    assert(newObject !== obj);
  });

  it("doesn't modify previous object", function() {
    var first = ImmutableObject({ a: 1 });
    var second = first.set({ a: 2, b: 3 });
    assert(!first.hasOwnProperty("b"));
    assert.equal(first.a, 1);
    assert.equal(second.a, 2);
  });

  it("inherits from original object", function() {
    var newObject = obj.set({a:1});
    assert(Object.getPrototypeOf(newObject) === obj);
  });

  it("avoids un-necessary prototype chaining", function() {
    var o1 = obj.set({a:1});
    var o2 = o1.set({a:1});
    assert(Object.getPrototypeOf(o2) === obj);
  });

  it("gets ALL properties from another immutable object", function() {
    var props = ImmutableObject({ a: 1 }).set({ b: 2 });
    var result = obj.set(props);
    assert.equal(result.a, 1);
    assert.equal(result.b, 2);
  });

});

describe("ImmutableObject.keys", function() {
  it("includes props from initialization", function() {
    var obj = ImmutableObject({a:1, b:2});
    assert.deepEqual(ImmutableObject.keys(obj), ["a", "b"]);
  });
  it("includes props from prototype", function() {
    var obj = ImmutableObject({a:1, b:2}).set({c:3});
    assert.deepEqual(ImmutableObject.keys(obj).sort(), ["a", "b", "c"]);
  });
  it("doesn't duplicate properties from prototype", function() {
    var obj = ImmutableObject({a:1, b:2}).set({b:3});
    assert.deepEqual(ImmutableObject.keys(obj).sort(), ["a", "b" ]);
  });
});
