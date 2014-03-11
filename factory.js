"use strict";

var ImmutableObject = require("./ImmutableObject");

function factory(input) {
  if (arguments.length === 0) {
    return ImmutableObject();
  } else if (Array.isArray(input)) {
    return Object.freeze(input.map(factory));
  } else if (typeof input === "object" && input != null) {
    return ImmutableObject(input);
  } else {
    // Treat anything else i.e. number, boolean, null, as immutable already
    return input;
  }
}

module.exports = factory;

