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

  it("returns same empty object when no props", function() {
    assert.strictEqual(ImmutableObject(), ImmutableObject());
  });
});

describe("set method", function() {
  var obj;
  beforeEach(function() {
    obj = ImmutableObject({});
  });

  it("returns same object if no props are undefined", function() {
    assert.strictEqual(obj.set(), obj);
  });

  it("returns a new object", function() {
    var newObject = obj.set({a:1});
    assert.notStrictEqual(newObject, obj);
  });

  it("allows key-value arguments", function() {
    var newObject = obj.set("a", 1);
    assert.equal(newObject.a, 1);
  });

  it("deeply converts props to immutable", function() {
    var newObject = obj.set({ a: { b: { c: 1} } });
    assert(newObject.a instanceof ImmutableObject);
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

describe("unset", function() {
  var obj;
  beforeEach(function() {
    obj = ImmutableObject({ a: 1 });
  });

  it("return object without the property", function() {
    var newObj = obj.unset("a");
    assert.deepEqual(ImmutableObject.keys(newObj), []);
  });

  it("re-uses prototype if key is only in the top-level object", function() {
    var base = ImmutableObject({a:1});
    var current = base.set({b:1});
    var result = current.unset("b");
    assert.strictEqual(result, base);
  });

  it("returns same object if property doesn't exist", function() {
    assert.strictEqual(obj.unset("b"), obj);
  });

  it("returns empty when object is already empty", function() {
    assert.strictEqual(ImmutableObject().unset("a"), ImmutableObject());
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

describe("using ImmutableObject as base class", function() {

  it("constructs immutable objects", function() {
    var Type = ImmutableObject.define({
    });
    var obj = new Type();
    assert(Object.isFrozen(obj));
  });

  it("constructs immutable objects when using init method", function() {
    var Type = ImmutableObject.define({
      init: function() { return this; }
    });
    var obj = new Type();
    assert(Object.isFrozen(obj));
  });

  it("throws if init doesn't return an immutable object", function() {
    var Type = ImmutableObject.define({
      init: function() {}
    });
    assert.throw(function() { new Type(); }, Error);
  });

  it("can be created without new operator and doesn't break instanceof", function() {
    var Type = ImmutableObject.define({ x: 1 });
    var obj = Type();
    assert(obj instanceof Type);
  });

  it("calls init method if defined", function() {
    var called = false;
    var Type = ImmutableObject.define({
      init: function() { called = true; return this; }
    });
    var obj = Type();
    assert(called);
  });

  it("passes constructor arguments to init method", function() {
    var called;
    var Type = ImmutableObject.define({
      init: function(arg) { called = arg; return this; }
    });
    var obj = Type("arg");
    assert.equal(called, "arg");
  });
});
