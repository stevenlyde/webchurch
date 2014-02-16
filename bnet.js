
var util = require('./util.js');


function isDefine(ast) {
  return ast.children && ast.children.length == 3 && ast.children[0].text && ast.children[0].text == "define"
}

function defineVar(ast) { return ast.children[1].text }
function defineExp(ast) { return ast.children[2] }


function isIdentifier(ast) {
  return util.is_leaf(ast) && util.is_identifier(ast.text)
}

function isNumber(ast) {
  return util.is_leaf(ast) && util.is_number(ast.text)
}

function isBoolean(ast) {
  return util.is_leaf(ast) && util.boolean_aliases[ast.text] != undefined
}

function isExp(ast, exp) {
  return ast.children && ast.children.length > 0 && ast.children[0].text && ast.children[0].text == exp
} 

function getIdentifier(ast) { return ast.text }
function getNumber(ast) { return parseFloat(ast.text) }
function getBoolean(ast) { return util.boolean_aliases[ast.text] }
function getArgs(ast) { return ast.children.slice(1) }


function forEachCombination(vs, f) {
  function tryBoth(rest, vars) {
    if (rest.length == 0) {
      f(vars)
    }
    else {
      var other = JSON.parse(JSON.stringify(vars))
      vars[rest[0]] = true
      other[rest[0]] = false
      rest = rest.slice(1)
      tryBoth(rest, vars)
      tryBoth(rest, other)
    }
  }
  tryBoth(vs, {})
}


function evaluateTestExp(exp, vars) {
  if (isBoolean(exp))
    return getBoolean(exp)
  else if (isIdentifier(exp))
    return vars[getIdentifier(exp)]
  else if (isExp(exp, "or"))
    return getArgs(exp).some(function(e) { return evaluateTestExp(e, vars) })
  else if (isExp(exp, "or"))
    return getArgs(exp).every(function(e) { return evaluateTestExp(e, vars) })
  else 
    throw new Error("unmatched expression")
}


function calculateProbability(exp, vars) {
  if (isExp(exp, "and")) {
    return getArgs(exp).reduce(function(p, e) { return p * calculateProbability(e, vars) }, 1)
  }
  else if (isExp(exp, "or")) {
    return 1 - getArgs(exp).reduce(function(p, e) { return p * (1 - calculateProbability(e, vars)) }, 1)
  }
  else if (isExp(exp, "flip")) {
    var args = getArgs(exp)
    return (args.length == 0) ? 0.5 : calculateProbability(args[0], vars)
  }
  else if (isExp(exp, "if")) {
    var args = getArgs(exp)
    return evaluateTestExp(args[0], vars) ? calculateProbability(args[1], vars) : calculateProbability(args[2], vars)
  }
  else if (isNumber(exp)) {
    return getNumber(exp)
  }
  else if (isIdentifier(exp)) {
    return vars[getIdentifier(exp)] ? 1.0 : 0
  }
  else {
    throw new Error("unmatched expression")
  }
}


function varsOfExp(exp, vars) {
  vars = vars || {}
  if (isIdentifier(exp)) {
    vars[getIdentifier(exp)] = true
  }
  else if (isExp(exp, "and") || isExp(exp, "or") || isExp(exp, "flip") || isExp(exp, "if")) {
    getArgs(exp).forEach(function(e) { varsOfExp(e, vars) })
  }
  return Object.keys(vars)
}


function calculateConditionalDependence(exp) {
  var deps = varsOfExp(exp)
  var probs = []
  var node = { deps: deps, probs: probs }

  forEachCombination(deps, function(vars) {
    var prob = []
    deps.forEach(function (v) {
      prob.push(vars[v])
    })
    var p = calculateProbability(exp, vars)
    prob.push(p)
    prob.push(1 - p)
    probs.push(prob)
  })

  return node
}


function generateBayesNet(ast) {
  var bnet = {}
  ast.children.forEach(function(exp) {
    if (isDefine(exp)) {
      bnet[defineVar(exp)] = calculateConditionalDependence(defineExp(exp))
    }
  })
  return bnet
}


/*
(define (bnet->dot bnet)
  
  (define (format-table-value v)
    (match v
      [#t 'T]
      [#f 'F]
      [(? symbol?) (format-var-name v)]
      [else v]))
  
  (define (format-var v)
    (string->symbol (string-replace (symbol->string v) "-" "_")))
  
  (define (format-var-name v)
    (string->symbol (string-replace (symbol->string v) "-" " ")))
  
  (define (list->record lst)
    (define (loop lst a)
      (match lst
        [(list)
         (format "~a}" a)]
        [(list-rest e es)
         (loop es (format "~a|~a" a e))]))
    (match lst
      [(list)
       "{}"]
      [(list e)
       (format "{~a}" e)]
      [(list-rest e es)
       (loop es (format "{~a" e))]))
  
  
  (define (cluster node)
    (match-define `(,var (,dependencies ...) ,probs ...) node)
    (define num-dep (length dependencies))
    (printf " subgraph cluster_~a {~n" (format-var var))
    (printf "  style=invis;~n")
    (printf "  ~a;~n" (format-var var))
    
    (define record (transpose (cons (append dependencies '(T F)) probs)))
    
    (define record-label
      (for/fold ([label (list->record (car record))]) ([prob (cdr record)])
        (format "~a|~a" label (list->record (map format-table-value prob)))))
    (printf "  table_~a [shape=record, label=\"~a\"];~n" (format-var var) record-label)
    (printf " }~n"))
  

*/


function toDot(bnet) {

  function formatNodeName(name) { return name.replace(/-/g, "_") }
  function formatNodeLabel(name) { return name.replace(/-/g, " ") }

  function formatTableValue(v) {
    if (v === true) return "T"
    else if (v === false) return "F"
    else if (typeof v == 'string') return formatNodeLabel(v)
    else return v
  }

  function transpose(m) {
    var t = []
    m[0].forEach(function() { t.push([]) })
    for (var i = 0, ilen = m.length; i < ilen; i++) {
      for (var j = 0, jlen = t.length; j < jlen; j++) {
        t[j].push(formatTableValue(m[i][j]))
      }
    }
    return t
  }

  function formatRecord(record) {
    var tmp = record.map(function(col) { return "{" + col.reduce(function(str, e) { return str + "|" + e }) + "}" })
    return tmp.reduce(function(str, col) { return str + "|" + col })
  }

  function generateTable(deps, probs) {
    var table = [deps.concat(["T", "F"])].concat(probs)
    var trans = transpose(table)
    return formatRecord(trans)
  }

  function cluster(variable, dependencies, probs) {
    var retval = "subgraph cluster_" + formatNodeName(variable) + " {"
    retval += "style=invis; "
    retval += formatNodeName(variable) + "; "
    retval += "table_" + formatNodeName(variable) + " [shape=record, label=\"" + generateTable(dependencies, probs) + "\"]; "
    retval += "}"
    return retval
  }

  function edges(variable, dependencies) {
    var retval = formatNodeName(variable) + " [label=\"" + formatNodeLabel(variable) + "\"]; "
    dependencies.forEach(function(d) {
      retval += formatNodeName(d) + " -> " + formatNodeName(variable) + "; "
    })
    return retval
  }

  var dot = "digraph bnet {"
  for (var v in bnet) {
    dot += cluster(v, bnet[v].deps, bnet[v].probs)
  }
  for (var v in bnet) {
    dot += edges(v, bnet[v].deps)
  }
  dot += "}"

  return dot
}


function generate(ast) {
  var bnet = generateBayesNet(ast);
  return toDot(bnet)

//  (define bnet (bnet-of program))
//  (bnet->dot bnet))

  return 'digraph foo { a -> b }'

}

module.exports = {
  generate: generate
}

