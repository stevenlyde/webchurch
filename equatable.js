
String.prototype.equals = function(other) {
  return this == other
}

String.prototype.hashCode = function(){
    var hash = 0;
    if (this.length == 0) return hash;
    for (var i = 0; i < this.length; i++) {
        var character = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+character;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

exports.arrayEquals = function(a, b) {
  var size = a.length;
  result = size == b.length;
  if (result) {
    while (size--) {
      if (!(result = a[size].equals(b[size]))) break;
    }
  }
  return result;
}

/*
Array.prototype.equals = function(other) {
  var idx = this.length;
  var result = idx == other.length;
  if (idx) {
    while (idx--) {
      if (!(result = this[idx].equals(other[idx]))) break
    }
  }
  return result;
}

Array.prototype.hashCode = function() {
  var result = 1;
  var idx = this.length;
  while (idx--) {
    result = 31 * result + this[idx].hashCode();
  }
  return result;
}
*/



exports.equals = function(value1, value2) {
  return Object.is(value1, value2) || value1.equals(value2) 
}

