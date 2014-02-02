"use strict";

var ImmutableObject = require("./ImmutableObject");

module.exports = function(members) {
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

