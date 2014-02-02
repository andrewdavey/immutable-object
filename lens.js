"use strict";

// A lens represents a property getter and setter, 
// designed to work with immutable data structures.
// It is an object with the following structure:
// {
//   get: function(target) {
//     return <value-from-target>;
//   },
//   set: function(target, newValue) {
//     return <new-target>;
//   }
// }

function compose(outerLens, innerLens) {
  return {
    get: function(outerValue) {
      var innerValue = outerLens.get(outerValue);
      return innerLens.get(innerValue);
    },
    set: function(outerValue, newInnerValue) {
      return update(
        outerValue,
        outerLens,
        function(innerTarget) {
          return innerLens.set(innerTarget, newInnerValue);
        }
      );
    }
  };
}

function update(target, lens, updateFn) {
  var currentValue = lens.get(target);
  var newValue = updateFn(currentValue);
  return lens.set(target, newValue);
}

function composeLenses(/* lens0, lens1, ... */) {
  var lenses = arguments[0] instanceof Array ? arguments[0] : arguments;
  return Array.prototype.reduceRight.call(
    lenses,
    function(inner, outer){
      return compose(outer, inner);
    }
  );
}

function prop(key) {
  return {
    get: function(immutableObject) {
      return immutableObject[key];
    },
    set: function(immutableObject, value) {
      return immutableObject.set(key, value);
    }
  };
}

function arrayItem(index) {
  return {
    get: function(array) {
      return array[index];
    },
    set: function(array, newItem) {
      return array
        .slice(0, index)
        .concat(newItem)
        .concat(array.slice(index + 1)); 
    }
  };
}

function build(type, path) {
  path = path || [];

  if (type instanceof Array) {
    return function(arrayIndex) {
      var pathToItem = path.concat(arrayItem(arrayIndex));
      var arrayItemLens = composeLenses(pathToItem);
      var itemType = type[0];
      if (itemType) {
        // Allow access to child item properties.
        // e.g. items(0).text
        extend(arrayItemLens, build(itemType, pathToItem));
      }
      return arrayItemLens;
    }

  } else if (typeof type === "object") {
    var result = {};
    Object.keys(type).forEach(function(key) {
      var propLens = prop(key);
      var pathToProp = path.concat(propLens);
      var x = build(type[key], pathToProp);
      if (typeof x === "function") {
        result[key] = x;
        var p = composeLenses(pathToProp);
        result[key].get = p.get;
        result[key].set = p.set;
      } else {
        result[key] = composeLenses(pathToProp);
        extend(result[key], x);
      }
    });
    return result;
  } else {
    return null;
  }
};

function extend(target, props) {
  if (!props) return;
  for (var key in props) {
    if (props.hasOwnProperty(key)) {
      target[key] = props[key];
    }
  }
}

exports.arrayItem = arrayItem;
exports.prop = prop;
exports.compose = composeLenses;
exports.update = update;
exports.build = build;

