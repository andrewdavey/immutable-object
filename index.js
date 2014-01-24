"use strict";

function ImmutableObject(props) {
  return empty.set(props);
}

var empty = Object.create(ImmutableObject.prototype);

ImmutableObject.prototype.set = function(props) {
  if (!props) {
    return this;
  }

  // allow this.set("property", value)
  // call this.set({property: value})
  if (typeof props === "string") {
    var propsObj = {}
    propsObj[props] = arguments[1];
    return this.set(propsObj);
  }

  function sameKeys(x, y) {
    return Object.keys(x).every(function(key) {
      return y.hasOwnProperty(key);
    });
  }

  var allSameKeys = sameKeys(this, props) && sameKeys(props, this);
  if (allSameKeys) {
    var p = Object.getPrototypeOf(this);
    return p.set(props);
  }

  var keys = allKeys(props);
  if (keys.length === 0) return this;

  var propertyDefs = {};
  keys.forEach(function(key) {
    var value = props[key];
    if (typeof value === "object" && !value.__isImmutableObject__) {
      value = ImmutableObject(value);
    }
    propertyDefs[key] = { value: value, enumerable: true };
  });
  var newObj = Object.create(this, propertyDefs);
  Object.freeze(newObj);
  return newObj;
};

ImmutableObject.prototype.unset = function(keyToExclude) {
  var props = {};

  function includeKey(key) {
    props[key] = this[key];
  }

  function notExcluded(key) {
    return key !== keyToExclude;
  }

  if (this.hasOwnProperty(keyToExclude) && 
      allKeys(Object.getPrototypeOf(this)).indexOf(keyToExclude) < 0) {
    Object.keys(this).filter(notExcluded).forEach(includeKey, this);
    return Object.getPrototypeOf(this).set(props);
  } else {
    var keys = allKeys(this);
    var filtered = keys.filter(notExcluded);
    var noChange = filtered.length === keys.length
    if (noChange) {
      return this;
    } else {
      filtered.forEach(includeKey);
      return ImmutableObject(props);
    }
  }
};

ImmutableObject.prototype.__isImmutableObject__ = true;

Object.freeze(ImmutableObject.prototype);

function allKeys(obj) {
  if (obj && obj.__isImmutableObject__) {
    return ImmutableObject.keys(obj);
  } else {
    return Object.keys(obj);
  }
}

ImmutableObject.keys = function(obj) {
  var keys = [];
  var seen = {};
  function notSeen(key) {
    if (!seen.hasOwnProperty(key)) {
      seen[key] = true;
      return true;
    } else {
      return false;
    }
  }
  while (obj && obj !== ImmutableObject.prototype) {
    keys = keys.concat( Object.keys(obj).filter(notSeen) );
    obj = Object.getPrototypeOf(obj);
  }
  return keys;
};

ImmutableObject.define = function(members) {
  members = members || {};
  var ctor;

  if (typeof members.init === "function") {
    ctor = function() {
      var instance = Object.freeze(
        (this instanceof ctor) ? this : Object.create(ctor.prototype)
      );
      instance = members.init.apply(instance, arguments);
      if (!instance || !instance.__isImmutableObject__) {
        throw new Error("init method must return an immutable object.");
      }
      return instance;
    };
  } else {
    ctor = function() {
      return Object.freeze(
        (this instanceof ctor) ? this : Object.create(ctor.prototype)
      );
    };
  }

  ctor.prototype = ImmutableObject(members);
  return ctor;
};

module.exports = ImmutableObject;

