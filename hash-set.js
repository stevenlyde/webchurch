/*
  Set
    add
    addAll
    contains
    subsetOf
    size
    isEmpty
    forEach
    equals
    hashCode


  Not Implemented
    clear
    remove
*/


var EMPTY


function HashSet() {
  return EMPTY.addAll(Array.prototype.slice.call(arguments))
}

HashSet.prototype.addAll = function(s) {
  var newSet = this
  s.forEach(function(e) {
    newSet = newSet.add(e)
  })
  return newSet
}

HashSet.prototype.isEmpty = function() {
  return false
}

HashSet.prototype.toArray = function() {
  var array = []
  this.forEach(function(e) {
    array.push(e)
  })
  return array
}

HashSet.prototype.equals = function(other) {
  return this == other ||
    other instanceof HashSet &&
    this.size() == other.size() &&
    this.subsetOf(other)
}

HashSet.prototype.hashCode = function() {
  var hash = 0
  this.forEach(function(e) {
    hash += e.hashCode()
  })
  return hash
}



function EmptySet() {
}

EmptySet.prototype = Object.create(HashSet.prototype)

EmptySet.prototype.add = function(value) {
  return new HashSet1(value)
}

EmptySet.prototype.contains = function(value) {
  return false
}

EmptySet.prototype.subsetOf = function(s) {
  return true
}

EmptySet.prototype.size = function() {
  return 0
}

EmptySet.prototype.isEmpty = function() {
  return true
}

EmptySet.prototype.forEach = function(f) {
}

EMPTY = new EmptySet



function HashSet1(value1) {
  this.value1 = value1;
}

HashSet1.prototype = Object.create(HashSet.prototype)

HashSet1.prototype.add = function(value) {
  if (value.equals(this.value1)) return this
  else return new HashSet2(this.value1, value)
}

HashSet1.prototype.contains = function(value) {
  return value.equals(this.value1);
}

HashSet1.prototype.subsetOf = function(s) {
  return s.contains(this.value1)
}

HashSet1.prototype.size = function() {
  return 1;
}

HashSet1.prototype.forEach = function(f) {
  f(this.value1);
}



function HashSet2(value1, value2) {
  this.value1 = value1;
  this.value2 = value2;
}

HashSet2.prototype = Object.create(HashSet.prototype)

HashSet2.prototype.add = function(value) {
  if (value.equals(this.value1) || value.equals(this.value2)) return this
  else return new HashSet3(this.value1, this.value2, value)
}

HashSet2.prototype.contains = function(value) {
  return value.equals(this.value1) || value.equals(this.value2);
}

HashSet2.prototype.subsetOf = function(s) {
  return s.contains(this.value1) && s.contains(this.value2)
}

HashSet2.prototype.size = function() {
  return 2;
}

HashSet2.prototype.forEach = function(f) {
  f(this.value1);
  f(this.value2);
}



function HashSet3(value1, value2, value3) {
  this.value1 = value1;
  this.value2 = value2;
  this.value3 = value3;
}

HashSet3.prototype = Object.create(HashSet.prototype)

HashSet3.prototype.add = function(value) {
  if (value.equals(this.value1) || value.equals(this.value2) || value.equals(this.value3)) return this
  else return new HashSet4(this.value1, this.value2, this.value3, value)
}

HashSet3.prototype.contains = function(value) {
  return value.equals(this.value1) || value.equals(this.value2) || value.equals(this.value3); 
}

HashSet3.prototype.subsetOf = function(s) {
  return s.contains(this.value1) && s.contains(this.value2) && s.contains(this.value3)
}

HashSet3.prototype.size = function() {
  return 3;
}

HashSet3.prototype.forEach = function(f) {
  f(this.value1);
  f(this.value2);
  f(this.value3);
}



function HashSet4(value1, value2, value3, value4) {
  this.value1 = value1;
  this.value2 = value2;
  this.value3 = value3;
  this.value4 = value4;
}

HashSet4.prototype = Object.create(HashSet.prototype)

HashSet4.prototype.add = function(value, level) {
  if (level == 32) throw new Error("not implemented exception")
  if (value.equals(this.value1) || value.equals(this.value2) || value.equals(this.value3) || value.equals(this.value4)) return this
  else return new HashTrieSet().add(this.value1, level).add(this.value2, level).add(this.value3, level).add(this.value4, level).add(value, level)
}

HashSet4.prototype.contains = function(value) {
  return value.equals(this.value1) || value.equals(this.value2) || value.equals(this.value3) || value.equals(this.value4); 
}

HashSet4.prototype.subsetOf = function(s) {
  return s.contains(this.value1) && s.contains(this.value2) && s.contains(this.value3) && s.contains(this.value4)
}

HashSet4.prototype.size = function() {
  return 4;
}

HashSet4.prototype.forEach = function(f) {
  f(this.value1);
  f(this.value2);
  f(this.value3);
  f(this.value4);
}



function HashTrieSet(set1, set2, set3, set4) {
  this.set1 = (set1 == undefined) ? EMPTY : set1
  this.set2 = (set2 == undefined) ? EMPTY : set2
  this.set3 = (set3 == undefined) ? EMPTY : set3
  this.set4 = (set4 == undefined) ? EMPTY : set4
}

HashTrieSet.prototype = Object.create(HashSet.prototype)

HashTrieSet.prototype.add = function(value, level) {
  level = (level == undefined) ? 0 : level;
  var hash = value.hashCode();
  var index = (hash >>> level) & 0x3;

  if (index == 0)
    return new HashTrieSet(this.set1.add(value, level + 2), this.set2, this.set3, this.set4)
  else if (index == 1)
    return new HashTrieSet(this.set1, this.set2.add(value, level + 2), this.set3, this.set4)
  else if (index == 2)
    return new HashTrieSet(this.set1, this.set2, this.set3.add(value, level + 2), this.set4)
  else
    return new HashTrieSet(this.set1, this.set2, this.set3, this.set4.add(value, level + 2))
}

HashTrieSet.prototype.contains = function(value, level) {
  level = (level == undefined) ? 0 : level;
  var hash = value.hashCode();
  var index = (hash >>> level) & 0x3;

  if (index == 0) return this.set1.contains(value, level + 2)
  else if (index == 1) return this.set2.contains(value, level + 2)
  else if (index == 2) return this.set3.contains(value, level + 2)
  else return this.set4.contains(value, level + 2)
}

HashTrieSet.prototype.subsetOf = function(s) {
  return this.set1.subsetOf(s) && this.set2.subsetOf(s) && this.set3.subsetOf(s) && this.set4.subsetOf(s)
}

HashTrieSet.prototype.size = function() {
  return this.set1.size() + this.set2.size() + this.set3.size() + this.set4.size()
}

HashTrieSet.prototype.forEach = function(f) {
  this.set1.forEach(f);
  this.set2.forEach(f);
  this.set3.forEach(f);
  this.set4.forEach(f);
}



module.exports = HashSet

