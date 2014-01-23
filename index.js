function ImmutableObject(props) {
  return empty.set(props);
}

var empty = Object.create(ImmutableObject.prototype);

ImmutableObject.prototype.set = function(props) {
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

  var x = {};
  allKeys(props).forEach(function(key) {
    x[key] = { value: props[key], enumerable: true };
  });
  var newObj = Object.create(this, x);
  Object.freeze(newObj);
  return newObj;
};

ImmutableObject.prototype.__isImmutableObject__ = true;

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

module.exports = ImmutableObject;

