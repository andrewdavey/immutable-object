"use strict";

var factory = require("./factory");
var ImmutableObject = require("./ImmutableObject");
var lens = require("./lens");
var createClass = require("./createClass");

var api = factory;
api.Object = ImmutableObject;
api.keys = ImmutableObject.keys;
api.createClass = createClass;
api.lens = lens;

module.exports = api;

