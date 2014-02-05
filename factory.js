"use strict";

var ImmutableObject = require("./ImmutableObject");

function factory(input) {
  if (input instanceof Array) {
    return Object.freeze(input.map(factory));
  } else if (typeof input === "object" || typeof input === "undefined") {
    return ImmutableObject(input);
  } else {
    // Treat anything else i.e. number, boolean, null, as immutable already
    return input;
  }
}

module.exports = factory;

