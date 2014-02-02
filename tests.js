var immutable = require("./index");
var lens = immutable.lens;
var assert = require("chai").assert;

describe("constructor", function() {
  var obj;
  beforeEach(function() {
    obj = immutable({ a: 1, b: 2, c: 3, d: 4 });
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
    var obj = new immutable({ a: 1 });
    assert.equal(obj.a, 1);
  });

  it("returns same empty object when no props", function() {
    assert.strictEqual(immutable(), immutable());
  });
});

describe("set method", function() {
  var obj;
  beforeEach(function() {
    obj = immutable({});
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
    assert(newObject.a instanceof immutable.Object);
    assert(newObject.a.b instanceof immutable.Object);
  });

  it("doesn't modify previous object", function() {
    var first = immutable({ a: 1 });
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
    var props = immutable({ a: 1 }).set({ b: 2 });
    var result = obj.set(props);
    assert.equal(result.a, 1);
    assert.equal(result.b, 2);
  });

});

describe("unset", function() {
  var obj;
  beforeEach(function() {
    obj = immutable({ a: 1 });
  });

  it("return object without the property", function() {
    var newObj = obj.unset("a");
    assert.deepEqual(immutable.keys(newObj), []);
  });

  it("re-uses prototype if key is only in the top-level object", function() {
    var base = immutable({a:1});
    var current = base.set({b:1});
    var result = current.unset("b");
    assert.strictEqual(result, base);
  });

  it("returns same object if property doesn't exist", function() {
    assert.strictEqual(obj.unset("b"), obj);
  });

  it("returns empty when object is already empty", function() {
    assert.strictEqual(immutable().unset("a"), immutable());
  });
});

describe("toJSON", function() {
  it("works with JSON.stringify", function() {
    var obj = immutable({ a: 1 });
    assert.equal(JSON.stringify(obj), "{\"a\":1}");
  });

  it("includes properties from prototype chain", function() {
    var obj = immutable({ a: 1 }).set({ b: 2 });
    assert.deepEqual(obj.toJSON(), { a: 1, b: 2 });
  });

  it("JSONifies nested immutables", function() {
    var obj = immutable({ a: 1, b: { c: 2 } });
    assert.deepEqual(obj.toJSON(), { a: 1, b: { c: 2 } });
  });

  it("calls toJSON of property values if exists", function() {
    var obj = immutable({ a: { toJSON: function() { return 1; } } });
    assert.deepEqual(obj.toJSON(), { a: 1 });
  });
});

describe("immutable.keys", function() {
  it("includes props from initialization", function() {
    var obj = immutable({a:1, b:2});
    assert.deepEqual(immutable.keys(obj), ["a", "b"]);
  });
  it("includes props from prototype", function() {
    var obj = immutable({a:1, b:2}).set({c:3});
    assert.deepEqual(immutable.keys(obj).sort(), ["a", "b", "c"]);
  });
  it("doesn't duplicate properties from prototype", function() {
    var obj = immutable({a:1, b:2}).set({b:3});
    assert.deepEqual(immutable.keys(obj).sort(), ["a", "b" ]);
  });
});

describe("using immutable as base class", function() {

  it("constructs immutable objects", function() {
    var Type = immutable.createClass({
    });
    var obj = new Type();
    assert(Object.isFrozen(obj));
  });

  it("constructs immutable objects when using init method", function() {
    var Type = immutable.createClass({
      init: function() { return this; }
    });
    var obj = new Type();
    assert(Object.isFrozen(obj));
  });

  it("throws if init doesn't return an immutable object", function() {
    var Type = immutable.createClass({
      init: function() {}
    });
    assert.throw(function() { new Type(); }, Error);
  });

  it("can be created without new operator and doesn't break instanceof", function() {
    var Type = immutable.createClass({ x: 1 });
    var obj = Type();
    assert(obj instanceof Type);
  });

  it("calls init method if defined", function() {
    var called = false;
    var Type = immutable.createClass({
      init: function() { called = true; return this; }
    });
    var obj = Type();
    assert(called);
  });

  it("passes constructor arguments to init method", function() {
    var called;
    var Type = immutable.createClass({
      init: function(arg) { called = arg; return this; }
    });
    var obj = Type("arg");
    assert.equal(called, "arg");
  });
});

describe("lens.prop", function() {
  var target = immutable({ foo: 1 });
  var foo = lens.prop("foo");

  it("can get property value", function() {
    assert.equal(foo.get(target), 1);
  });

  it("can set property value", function() {
    var newObj = foo.set(target, 2);
    assert.equal(newObj.foo, 2);
  });
});

describe("lens.arrayItem", function() {
  var original = ["a", "b", "c"];
  var item1 = lens.arrayItem(1);
  
  it("can get item", function() {
    assert.equal(item1.get(original), "b");
  });

  it("can set item", function() {
    var newArray = item1.set(original, "z");
    assert.deepEqual(newArray, ["a", "z", "c"]);
  });
});

describe("composed lenses with lens.compose", function() {
  var foo = lens.prop("foo");
  var bar = lens.prop("bar");
  var target = immutable({ foo: { bar: 1 } });
  var l = lens.compose(foo, bar);

  it("gets inner property", function() {
    assert.equal(l.get(target), 1);
  });
  it("sets inner property", function() {
    var result = l.set(target, 2);
    assert.equal(result.foo.bar, 2);
  });
});

describe("lens.build", function() {
  var l = lens.build({
    foo: true
  }); 
  
  var target = immutable({
    foo: "a"
  });

  it("creates lens property per object property", function() {
    assert("get" in l.foo);
    assert("set" in l.foo);
    assert.equal(l.foo.get(target), "a");
  });

  describe("given nested objects", function() {
    var nested = lens.build({
      foo: { bar: true }
    });
    var target = immutable({ foo: { bar: "a" } });
    it("creates lens for top-level property", function() {
      assert("foo" in nested);
      assert.equal(nested.foo.get(target), target.foo);
    });
    it("creates nested lens property", function() {
      assert("bar" in nested.foo);
      assert.equal(nested.foo.bar.get(target), "a");
    });
  });

  describe("given array", function() {
    var arrayItem = lens.build([]);
    var target = ["a","b"];
    it("creates array item lens factory", function() {
      assert.equal(arrayItem(0).get(target), "a");
      assert.equal(arrayItem(1).get(target), "b");
    });
  });

  describe("given array with child object", function() {
    var arrayItem = lens.build([ { foo: true } ]);
    var target = [
      { foo: "a" },
      { foo: "b" }
    ];
    it("creates item object property lenses", function() {
      assert.equal(arrayItem(0).foo.get(target), "a");
      assert.equal(arrayItem(1).foo.get(target), "b");
    });
  });

  describe("given array with child array", function() {
    var arrayItem = lens.build([ { foo: [] } ]);
    var target = [
      { foo: ["a"] }
    ];
    it("creates nested array lenses", function() {
      assert.equal(arrayItem(0).foo(0).get(target), "a");
    });
  });

  describe("given object with array property", function() {
    var l = lens.build({
      items: [ { foo: true } ]
    });
    var target = immutable({ items: [ { foo: "a" } ] });
    it("can access array item property", function() {
      var itemProp = l.items(0).foo;
      assert.equal(itemProp.get(target), "a");
    });
    it("can update array item property", function() {
      var itemProp = l.items(0).foo;
      var newObj = itemProp.set(target, "b");
      assert.equal(newObj.items[0].foo, "b");
    });
  });

  describe("object -> array -> object -> array", function() {
    var l = lens.build({
      a: [
        { b: [] } 
      ]
    });
    var target = immutable({
      a: [
        { b: [1,2,3] }
      ]
    });
    it("can get nested array", function() {
      var prop = l.a(0).b;
      assert.equal(prop.get(target), target.a[0].b);
    });
    it("can set nested array", function() {
      var prop = l.a(0).b;
      var newObject = prop.set(target, [4,5,6]);
      assert.deepEqual(newObject.a[0].b, [4,5,6]);
    });
  });

  it("supports complex structures", function() {
    var l = lens.build({
      customers: [
        {
          name: true,
          invoices: [
            { items: [ { name: true, qty: true, price: true } ] }
          ]
        }
      ]
    });

    var data = immutable({
      customers: [
        {
          name: "Foo Corp",
          invoices: [
            {
              items: [
                { name: "Nuts", qty: 100, price: 2 },
                { name: "Bolts", qty: 100, price: 3 }
              ] 
            }
          ]
        }
      ]
    });

    var priceLens = l.customers(0).invoices(0).items(1).price;
    var newInvoice = priceLens.set(data, 4);
    assert.equal(newInvoice.customers[0].invoices[0].items[1].price, 4);
  });

});

