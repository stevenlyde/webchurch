/*
  Map
    set
    get 
    size
    forAll
    forEach

  Not Implemented
    putAll
*/


var EMPTY



function HashMap() {
  return EMPTY
}

HashMap.prototype.equals = function(other) {
  return this == other ||
    other instanceof HashMap &&
    this.size() == other.size() &&
    this.forAll(function(k, v) {
                  var ov = other.get(k)
                  return ov != undefined && ov.equals(v) })
}

HashMap.prototype.hashCode = function() {
  var hash = 0
  this.forEach(function(k, v) {
    hash += k.hashCode() ^ v.hashCode();
  })
  return hash
}


function EmptyMap() {
}

EmptyMap.prototype = Object.create(HashMap.prototype)

EmptyMap.prototype.set = function(key, value) {
  return new HashMap1(key, value)
}

EmptyMap.prototype.get = function(key) {
  return undefined
}

EmptyMap.prototype.size = function() {
  return 0
}

EmptyMap.prototype.forAll = function(p) {
  return true
}

EmptyMap.prototype.forEach = function(f) {
}

EMPTY = new EmptyMap



function HashMap1(key1, value1) {
  this.key1 = key1;
  this.value1 = value1;
}

HashMap1.prototype = Object.create(HashMap.prototype)

HashMap1.prototype.set = function(key, value) {
  if (key.equals(this.key1)) return new HashMap1(key, value)
  else return new HashMap2(this.key1, this.value1, key, value)
}

HashMap1.prototype.get = function(key) {
  if (key.equals(this.key1)) return this.value1
  else return undefined
}

HashMap1.prototype.size = function() {
  return 1
}

HashMap1.prototype.forAll = function(p) {
  return p(this.key1, this.value1)
}

HashMap1.prototype.forEach = function(f) {
  f(this.key1, this.value1)
}



function HashMap2(key1, value1, key2, value2) {
  this.key1 = key1;
  this.value1 = value1;
  this.key2 = key2;
  this.value2 = value2;
}

HashMap2.prototype = Object.create(HashMap.prototype)

HashMap2.prototype.set = function(key, value) {
  if (key.equals(this.key1)) return new HashMap2(key, value, this.key2, this.value2)
  else if (key.equals(this.key2)) return new HashMap2(this.key1, this.value1, key, value)
  else return new HashMap3(this.key1, this.value1, this.key2, this.value2, key, value)
}

HashMap2.prototype.get = function(key) {
  if (key.equals(this.key1)) return this.value1
  else if (key.equals(this.key2)) return this.value2
  else return undefined
}

HashMap2.prototype.size = function() {
  return 2
}

HashMap2.prototype.forAll = function(p) {
  return p(this.key1, this.value1) && p(this.key2, this.value2)
}

HashMap2.prototype.forEach = function(f) {
  f(this.key1, this.value1);
  f(this.key2, this.value2);
}



function HashMap3(key1, value1, key2, value2, key3, value3) {
  this.key1 = key1;
  this.value1 = value1;
  this.key2 = key2;
  this.value2 = value2;
  this.key3 = key3;
  this.value3 = value3;
}

HashMap3.prototype = Object.create(HashMap.prototype)

HashMap3.prototype.set = function(key, value) {
  if (key.equals(this.key1)) return new HashMap3(key, value, this.key2, this.value2, this.key3, this.value3)
  else if (key.equals(this.key2)) return new HashMap3(this.key1, this.value1, key, value, this.key3, this.value3)
  else if (key.equals(this.key3)) return new HashMap3(this.key1, this.value1, this.key2, this.value2, key, value)
  else return new HashMap4(this.key1, this.value1, this.key2, this.value2, this.key3, this.value3, key, value)
}

HashMap3.prototype.get = function(key) {
  if (key.equals(this.key1)) return this.value1
  else if (key.equals(this.key2)) return this.value2
  else if (key.equals(this.key3)) return this.value3
  else return undefined
}

HashMap3.prototype.size = function() {
  return 3
}

HashMap3.prototype.forAll = function(p) {
  return p(this.key1, this.value1) && 
    p(this.key2, this.value2) &&
    p(this.key3, this.value3)
}

HashMap3.prototype.forEach = function(f) {
  f(this.key1, this.value1);
  f(this.key2, this.value2);
  f(this.key3, this.value3);
}



function HashMap4(key1, value1, key2, value2, key3, value3, key4, value4) {
  this.key1 = key1;
  this.value1 = value1;
  this.key2 = key2;
  this.value2 = value2;
  this.key3 = key3;
  this.value3 = value3;
  this.key4 = key4;
  this.value4 = value4;
}

HashMap4.prototype = Object.create(HashMap.prototype)

HashMap4.prototype.set = function(key, value, level) {
  if (level == 32) throw new Error("not implemented exception")

  if (key.equals(this.key1)) return new HashMap4(key, value, this.key2, this.value2, this.key3, this.value3, this.key4, this.value4)
  else if (key.equals(this.key2)) return new HashMap4(this.key1, this.value1, key, value, this.key3, this.value3, this.key4, this.value4)
  else if (key.equals(this.key3)) return new HashMap4(this.key1, this.value1, this.key2, this.value2, key, value, this.key4, this.value4)
  else if (key.equals(this.key4)) return new HashMap4(this.key1, this.value1, this.key2, this.value2, this.key3, this.value3, key, value)
  else {
    return new HashTrieMap().set(this.key1, this.value1, level).set(this.key2, this.value2, level).set(this.key3, this.value3, level).set(this.key4, this.value4, level).set(key, value, level)
  }
}

HashMap4.prototype.get = function(key) {
  if (key.equals(this.key1)) return this.value1
  else if (key.equals(this.key2)) return this.value2
  else if (key.equals(this.key3)) return this.value3
  else if (key.equals(this.key4)) return this.value4
  return undefined
}

HashMap4.prototype.size = function() {
  return 4;
}

HashMap4.prototype.forAll = function(p) {
  return p(this.key1, this.value1) && 
    p(this.key2, this.value2) &&
    p(this.key3, this.value3) &&
    p(this.key4, this.value4)
}

HashMap4.prototype.forEach = function(f) {
  f(this.key1, this.value1);
  f(this.key2, this.value2);
  f(this.key3, this.value3);
  f(this.key4, this.value4);
}



function HashTrieMap(map1, map2, map3, map4) {
  this.map1 = (map1 == undefined) ? EMPTY : map1
  this.map2 = (map2 == undefined) ? EMPTY : map2
  this.map3 = (map3 == undefined) ? EMPTY : map3
  this.map4 = (map4 == undefined) ? EMPTY : map4
}

HashTrieMap.prototype = Object.create(HashMap.prototype)

HashTrieMap.prototype.set = function(key, value, level) {
  level = (level == undefined) ? 0 : level;
  var hash = key.hashCode();
  var index = (hash >>> level) & 0x3;

  if (index == 0)
    return new HashTrieMap(this.map1.set(key, value, level + 2), this.map2, this.map3, this.map4)
  else if (index == 1)
    return new HashTrieMap(this.map1, this.map2.set(key, value, level + 2), this.map3, this.map4)
  else if (index == 2)
    return new HashTrieMap(this.map1, this.map2, this.map3.set(key, value, level + 2), this.map4)
  else
    return new HashTrieMap(this.map1, this.map2, this.map3, this.map4.set(key, value, level + 2))
}

HashTrieMap.prototype.get = function(key, level) {
  level = (level == undefined) ? 0 : level;
  var hash = key.hashCode();
  var index = (hash >>> level) & 0x3;

  if (index == 0) return this.map1.get(key, level + 2)
  else if (index == 1) return this.map2.get(key, level + 2)
  else if (index == 2) return this.map3.get(key, level + 2)
  else return this.map4.get(key, level + 2)
}

HashTrieMap.prototype.size = function() {
  return this.map1.size() + this.map2.size() + this.map3.size() + this.map4.size()
}

HashTrieMap.prototype.forAll = function(p) {
  return this.map1.forAll(p) &&
    this.map2.forAll(p) &&
    this.map3.forAll(p) &&
    this.map4.forAll(p)
}

HashTrieMap.prototype.forEach = function(f) {
  this.map1.forEach(f);
  this.map2.forEach(f);
  this.map3.forEach(f);
  this.map4.forEach(f);
}



module.exports = HashMap

