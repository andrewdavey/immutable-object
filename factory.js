"use strict";

var ImmutableObject = require("./ImmutableObject");

function factory(input) {
  if (input instanceof Array) {
    return input.map(factory); // TODO: Create ImmutableArray
  } else if (typeof input === "object" || typeof input === "undefined") {
    return ImmutableObject(input);
  } else {
    // Treat anything else i.e. number, boolean, null, as immutable already
    return input;
  }
}

module.exports = factory;

