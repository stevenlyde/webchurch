
var util = require('./util.js');

var i = 0;

function gensym() {
  return {text: "g" + i++};
}

function copy(exp) {
  return JSON.parse(JSON.stringify(exp))
}

function isQuote(ast) {
  return ast.children && ast.children.length > 0 && ast.children[0].text && ast.children[0].text == "quote"
}

function isLambda(ast) {
  return ast.children && ast.children.length > 0 && ast.children[0].text && ast.children[0].text == "lambda"
}

function isDefine(ast) {
  return ast.children && ast.children.length > 0 && ast.children[0].text && ast.children[0].text == "define"
}

function isIf(ast) {
  return ast.children && ast.children.length > 0 && ast.children[0].text && ast.children[0].text == "if"
}

function isAtomic(exp) {
  return util.is_leaf(exp) || isQuote(exp) || isLambda(exp);
}

function normalizeTop(body) {
  var defs = findDefines(body)
  if (defs.length > 0)
    return {children: [{text: "let-void"}, {children: defs}, normalizeBody(body)]}
  else
    return normalizeBody(body)
}

function findDefines(body) {
  var defs = []
  body.forEach(function(exp) {
    if (isDefine(exp)) defs.push(exp.children[1])
  })
  return defs;
}

function normalizeBody(body) {
  if (body.length == 1) {
    return normalize(body[0]);
  }
  else {
    return normalizeDec(body[0], body.slice(1));
  }
}

function normalizeDec(dec, rest) {
  if (isDefine(dec)) {
    var v = copy(dec.children[1])
    var exp = dec.children[2]
    return normalize(exp, function(exp) {
      return {children: [{text: "install-value"}, {children: [v, exp]}, normalizeBody(rest)]}
    })
  }
  else {
    return normalize(dec, function(exp) {
      return {children: [{text: "let"}, {children: [gensym(), exp]}, normalizeBody(rest)]}
    })
  }
}

function normalize(exp, k) {
  k = k ? k : function(x) { return x };

  if (isLambda(exp)) {
    var params = copy(exp.children[1]);
    var body = exp.children.slice(2);
    return k({children: [{text: "lambda"}, params, normalizeTop(body)]});
  }
  else if (isAtomic(exp)) {
    return k(copy(exp));
  }
  else if (isIf(exp)) {
    return normalizeName(exp.children[1], function(t) {
      return k({children: [{text: "if"}, t, normalize(exp.children[2]), normalize(exp.children[3])]});
    })
  }
  else if (exp.children && exp.children.length > 0) {
    return normalizeNames(exp.children, k);
  }
  else {
    throw new Error("normalize: unmatched expression")
  }
}

function normalizeName(exp, k) {
  return normalize(exp, function(aexp) {
    if (isAtomic(aexp)) {
      return k(aexp);
    }
    else {
      var t = gensym();
      return {children: [{text: "let"}, {children: [t, aexp]}, k(t)]};
    }
  })
}

function normalizeNames(exps, k) {
  if (exps.length == 0) {
    return k({children: []})
  }
  else {
    return normalizeName(exps[0], function(t) {
      return normalizeNames(exps.slice(1), function (ts) {
        ts.children.unshift(t)
        return k(ts);
      })
    })
  }
}


var id = 0;

function assignLabels(ast) {
  ast.id = id++;
  if (ast.children) {
    for (var i = 0, length = ast.children.length; i < length; i++) {
      assignLabels(ast.children[i]);
    }
  }
}


function transform(ast) {
  var exp = normalizeTop(ast.children)
  assignLabels(exp)
  return exp
}

exports.normalize = transform

