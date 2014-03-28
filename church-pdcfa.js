
var util = require('./util.js')

var Eq = require('./equatable.js')

var Set = require('./hash-set.js')
var Map = require('./hash-map.js')

// 

function MultiMap() {
  this.map = new Map
}

MultiMap.prototype.get = function(key) {
  var values = this.map.get(key)
  return (values == undefined) ? new Set : values
}

// OPT: because the sets are immutable we could share them
MultiMap.prototype.add = function(key, value) {
  var values = this.get(key).add(value)
  this.map = this.map.set(key, values)
}

MultiMap.prototype.addAll = function(key, values) {
  var values = this.get(key).addAll(values)
  this.map = this.map.set(key, values)
}

//

function Integer(v) {
  this.v = v
}

Integer.prototype.equals = function(other) {
  if (!(other instanceof Integer))
    return false
  return this.v == other.v
}

Integer.prototype.hashCode = function() {
  return this.v
}

Integer.prototype.toString = function() {
  return this.v
}

//

function Pair(a, d) {
  this.a = a
  this.d = d
}

Pair.prototype.equals = function(other) {
  if (!(other instanceof Pair))
    return false
  return this.a.equals(other.a) && this.d.equals(other.d)
}

Pair.prototype.hashCode = function() {
  var prime = 31
  var result = 1
  result = prime * result + this.a.hashCode()
  result = prime * result + this.d.hashCode()
  return result
}

//

function StackAction() {}
StackAction.prototype.isEps = false
StackAction.prototype.isPush = false
StackAction.prototype.isPop = false

function Eps() {}
Eps.prototype = Object.create(StackAction.prototype)
Eps.prototype.isEps = true

Eps.prototype.equals = function(other) { 
  return other.isEps
}

Eps.prototype.hashCode = function() { 
  return 3 
}


function Push(frame) { this.frame = frame }
Push.prototype = Object.create(StackAction.prototype)
Push.prototype.isPush = true

Push.prototype.equals = function(other) {
  if (!(other instanceof Push))
    return false
  return this.frame.equals(other.frame)  
}

Push.prototype.hashCode = function() { 
  return 5 + this.frame.hashCode()
}

function Pop(frame) { this.frame = frame }
Pop.prototype = Object.create(StackAction.prototype)
Pop.prototype.isPop = true

Pop.prototype.equals = function(other) {
  if (!(other instanceof Pop))
    return false
  return this.frame.equals(other.frame)
}

Pop.prototype.hashCode = function() { 
  return 7 + this.frame.hashCode()
}


function Frame() {}
Frame.prototype.isTopFrame = false
Frame.prototype.isLetFrame = false
Frame.prototype.isInstallFrame = false

function LetFrame(v, exp, env) {
  this.v = v
  this.exp = exp
  this.env = env
}

LetFrame.prototype = Object.create(Frame.prototype)
LetFrame.prototype.isLetFrame = true

LetFrame.prototype.equals = function(other) {
  if (!(other instanceof LetFrame))
    return false
  return this.v.equals(other.v) &&
         this.exp.id == other.exp.id &&
         this.env.equals(other.env)
}

LetFrame.prototype.hashCode = function() {
  var prime = 11
  var result = 1
  result = prime * result + this.v.hashCode()
  result = prime * result + this.exp.id
  result = prime * result + this.env.hashCode()
  return result 
}

function InstallFrame(v, exp, env) {
  LetFrame.call(this, v, exp, env)
}

InstallFrame.prototype = Object.create(LetFrame.prototype)
InstallFrame.prototype.isInstallFrame = true

function TopFrame() {}

TopFrame.prototype = Object.create(Frame.prototype)
TopFrame.prototype.isTopFrame = true

TopFrame.prototype.equals = function(other) {
  return other instanceof TopFrame
}

TopFrame.prototype.hashCode = function() {
  return 13
}


function State(exp, env, store, taint) {
  this.exp = exp
  this.env = env
  this.store = store
  this.taint = taint
}

State.prototype.equals = function(other) {
  if (!(other instanceof State))
    return false
  return this.exp == other.exp &&
         this.env.equals(other.env) &&
         this.store.equals(other.store) &&
         this.taint.equals(other.taint)
}

State.prototype.hashCode = function() {
  var prime = 17
  var result = 1
  result = prime * result + this.exp.id 
  result = prime * result + this.env.hashCode() 
  result = prime * result + this.store.hashCode()
  result = prime * result + this.taint.hashCode()
  return result
}


function Edge(source, action, target) {
if (!action) throw new Error

  this.source = source
  this.action = action
  this.target = target
}

Edge.prototype.equals = function(other) {
  if (!(other instanceof Edge))
    return false
  return this.source.equals(other.source) &&
         this.action.equals(other.action) &&
         this.target.equals(other.target)
}

Edge.prototype.hashCode = function() {
  var prime = 19
  var result = 1
  result = prime * result + this.source.hashCode()
  result = prime * result + this.action.hashCode() 
  result = prime * result + this.target.hashCode() 
  return result

}


var Env = Map
var Store = Map
var Taint = Map

// Abstract Addresses

function Address() {} 


function VariableBinding(variable, time) {
  this.variable = variable
  this.time = time
}

VariableBinding.prototype = Object.create(Address.prototype)

VariableBinding.prototype.toString = function() {
  return "VariableBinding(" + this.variable + "," + this.time + ")"
}

VariableBinding.prototype.equals = function(other) {
  if (!(other instanceof VariableBinding))
    return false
  return this.variable.equals(other.variable) && this.time == other.time
}

VariableBinding.prototype.hashCode = function() {
  var prime = 23
  var result = 1
  result = prime * result + this.variable.hashCode()
  result = prime * result + this.time
  return result
}


function FieldAddress(baseAddr, field) {
  this.baseAddr = baseAddr
  this.field = field
}

FieldAddress.prototype = Object.create(Address.prototype)

FieldAddress.prototype.toString = function() {
  return "FieldAddress(" + this.baseAddr + "," + this.field + ")"
}

FieldAddress.prototype.equals = function(other) {
  if (!(other instanceof FieldAddress))
    return false
  return this.baseAddr.equals(other.baseAddr) && this.field == other.field
}

FieldAddress.prototype.hashCode = function() {
  var prime = 47
  var result = 1
  result = prime * result + this.baseAddr.hashCode()
  result = prime * result + this.field.hashCode()
  return result
}


// Abstract Values

function AbstractValue() {}

function AbstractBoolean(value) {
  this.value = value
}

AbstractBoolean.prototype = Object.create(AbstractValue.prototype)

AbstractBoolean.prototype.toString = function() {
  return this.value ? "True" : "False"
}

AbstractBoolean.prototype.equals = function(other) {
  if (!(other instanceof AbstractBoolean))
    return false
  return this.value == other.value
}

AbstractBoolean.prototype.hashCode = function() {
  return 37 * (this.value + 1)
}

var A_TRUE = new AbstractBoolean(true)
var A_FALSE = new AbstractBoolean(false)


function AbstractNumber() {}

AbstractNumber.prototype = Object.create(AbstractValue.prototype)

AbstractNumber.prototype.toString = function() {
  return "Number"
}

AbstractNumber.prototype.equals = function(other) {
  return other instanceof AbstractNumber
}

AbstractNumber.prototype.hashCode = function() {
  return 41;
}

var A_NUMBER = new AbstractNumber


function AbstractString(value) {
  this.value = value
}

AbstractString.prototype = Object.create(AbstractValue.prototype)

AbstractString.prototype.toString = function() {
  return '"' + this.value + '"'
}

AbstractString.prototype.equals = function(other) {
  if (!(other instanceof AbstractString))
    return false
  return this.value == other.value
}

AbstractString.prototype.hashCode = function() {
  return 61 * this.value.hashCode()
}


function EmptyList() {}

EmptyList.prototype = Object.create(AbstractValue.prototype)

EmptyList.prototype.toString = function() {
  return "EmptyList"
}

EmptyList.prototype.equals = function(other) {
  return other instanceof EmptyList
}

EmptyList.prototype.hashCode = function() {
  return 59;
}

var EMPTY_LIST = new EmptyList


function PairLocation(time) {
  this.time = time
}

PairLocation.prototype = Object.create(AbstractValue.prototype)

PairLocation.prototype.toString = function() {
  return "PairLocation(" + this.time + ")"
}

PairLocation.prototype.equals = function(other) {
  if (!(other instanceof PairLocation))
    return false
  return this.value == other.value
}

PairLocation.prototype.hashCode = function() {
  return 47 * this.time
}


function Closure(params, body, env) {
  this.params = params
  this.body = body
  this.env = env
}

Closure.prototype = Object.create(AbstractValue.prototype)

Closure.prototype.toString = function() {
  return "Closure(" + ")"
}

Closure.prototype.equals = function(other) {
  if (!(other instanceof Closure))
    return false
  return this.body == other.body &&
         this.env.equals(other.env)
}

Closure.prototype.hashCode = function(other) {
  var prime = 29
  var result = 1
  result = prime * result + this.body.id
  result = prime * result + this.env.hashCode()
  return result 
}

function PrimValue(name) {
  this.name = name
}


PrimValue.prototype = Object.create(AbstractValue.prototype)

PrimValue.prototype.toString = function() {
  return "PrimValue(" + this.name + ")"
}

PrimValue.prototype.equals = function(other) {
  if (!(other instanceof PrimValue))
    return false
  return this.name == other.name
}

PrimValue.prototype.hashCode = function() {
  return 53 * this.name.hashCode()
}


function evalNumericPrim(args, state, frame, callMap) {
  var vals = new Set
  if (args.every(function(arg) { return arg.contains(A_NUMBER) }))
    vals = new Set(A_NUMBER)
  return popFrame(vals, state, frame, callMap)
}

function evalNumericComparePrim(args, state, frame, callMap) {
  var vals = new Set
  if (args.every(function(arg) { return arg.contains(A_NUMBER) }))
    vals = new Set(A_TRUE, A_FALSE)
  return popFrame(vals, state, frame, callMap)
}

function fieldLookup(field, args, state, frame, callMap) {
  var vals = new Set
  args[0].forEach(function (loc) {
    var addr = new FieldAddress(loc, field)
    vals = vals.addAll(state.store.get(addr))
  })
  return popFrame(vals, state, frame, callMap)
}

function pairTest(test, args, state, frame, callMap) {
  var arg = args.toArray()
  var vals = new Set
  if (arg.some(test))
    vals = vals.add(A_TRUE)
  if (arg.some(function (d) { !test(d) }))
    vals = vals.add(A_FALSE)
  return popFrame(vals, state, frame, callMap)
}

var Primitives = {

  "+": evalNumericPrim,
  "-": evalNumericPrim,
  "*": evalNumericPrim,
  "/": evalNumericPrim,

  ">" : evalNumericComparePrim,
  "<" : evalNumericComparePrim,
  ">=": evalNumericComparePrim,
  "<=": evalNumericComparePrim,
  "=" : evalNumericComparePrim,

  "and": function(args, state, frame, callMap) {
    var vals = new Set
    if (args.every(function(arg) { return arg.contains(A_TRUE) }))
      vals = vals.add(A_TRUE)
    if (args.some(function(arg) { return arg.contains(A_FALSE) }))
      vals = vals.add(A_FALSE)
    return popFrame(vals, state, frame, callMap)
  },

  "or": function(args, state, frame, callMap) {
    var vals = new Set
    if (args.some(function(arg) { return arg.contains(A_TRUE) }))
      vals = vals.add(A_TRUE)
    if (args.every(function(arg) { return arg.contains(A_FALSE) }))
      vals = vals.add(A_FALSE)
    return popFrame(vals, state, frame, callMap)
  },

  "not": function(args, state, frame, callMap) {
    var vals = new Set
    if (args[0].contains(A_TRUE))
      vals = vals.add(A_FALSE)
    if (args[0].contains(A_FALSE))
      vals = vals.add(A_TRUE)
    return popFrame(vals, state, frame, callMap)
  },

  "pair": function(args, state, frame, callMap) {
    var loc = new PairLocation(state.exp.id)
    var aAddr = new FieldAddress(loc, "car")
    var dAddr = new FieldAddress(loc, "cdr")
    var newStore = updateStoreM(state.store, [aAddr, dAddr], args)
    // TODO: think about how to update the taint store in this scenario
    return popFrame(new Set(loc), state, frame, callMap, newStore)
  },

  "first": function(args, state, frame, callMap) {
    return fieldLookup("car", args, state, frame, callMap)
  },

  "rest": function(args, state, frame, callMap) {
    return fieldLookup("cdr", args, state, frame, callMap)
  },

  "null?": function(args, state, frame, callMap) {
    return pairTest(function (d) { return d instanceof EmptyList }, args, state, frame, callMap) 
  },

  "pair?": function(args, state, frame, callMap) {
    return pairTest(function (d) { return d instanceof PairLocation }, args, state, frame, callMap)
  },

  "eq?": function(args, state, frame, callMap) {
    return popFrame(new Set(A_TRUE, A_FALSE), state, frame, callMap)
  },

  "equal?": function(args, state, frame, callMap) {
    return popFrame(new Set(A_TRUE, A_FALSE), state, frame, callMap)
  },

  "round": evalNumericPrim,
  "abs":   evalNumericPrim,
  "exp":   evalNumericPrim,
  "log":   evalNumericPrim,
  "pow":   evalNumericPrim,

  "flip": function(args, state, frame, callMap) {
    return popFrame(new Set(A_TRUE, A_FALSE), state, frame, callMap)
  },

  "beta": function(args, state, frame, callMap) {
    return popFrame(new Set(A_NUMBER), state, frame, callMap)
  },

}

function isPrim(exp) {
  return !exp.children && exp.text && Primitives[exp.text]
}


function isApplication(exp) {
  return exp.children && exp.children.length > 0 &&
         !isLetExp(exp) && !isLetVoidExp(exp) && !isInstallValueExp(exp) &&
         !isIfExp(exp) && !isLambda(exp) && !isQuote(exp) 
}
function appFunction(exp) { return exp.children[0] }
function appArgs(exp) { return exp.children.slice(1) }

function isLetExp(exp) {
  return exp.children && exp.children.length > 0 && exp.children[0].text == "let"
}
function letVariable(exp) { return exp.children[1].children[0].text }
function letValue(exp) { return exp.children[1].children[1] }
function letBody(exp) { return exp.children[2]}


function isLetVoidExp(exp) {
  return exp.children && exp.children.length > 0 && exp.children[0].text == "let-void"
}

function letVoidVars(exp) {
  return exp.children[1].children.map(function(c) { return c.text } )
}

function isInstallValueExp(exp) {
  return exp.children && exp.children.length > 0 && exp.children[0].text == "install-value"
}


function isIfExp(exp) {
  return exp.children && exp.children.length == 4 && exp.children[0].text == "if"
}

function ifTestExp(exp) { return exp.children[1] }
function ifThenExp(exp) { return exp.children[2] }
function ifElseExp(exp) { return exp.children[3] }


function isLambda(exp) {
  return exp.children && exp.children.length > 0 && exp.children[0].text == "lambda"
}
function lambdaParams(exp) {
  var params = []
  exp.children[1].children.forEach(function(node) {
    params.push(node.text)
  })
  return params
}
function lambdaBody(exp) { return exp.children[2] }


function isQuote(exp) {
 return exp.children && exp.children.length > 0 && exp.children[0].text == "quote"
}


function isLeaf(exp) {  return !exp.children }

function isBoolean(exp) { return util.boolean_aliases[exp.text] != undefined}
function booleanValue(exp) { return util.boolean_aliases[exp.text] }
function isNumber(exp) { return util.is_number(exp.text) }
function numberValue(exp) { return parseFloat(exp.text) } 
function isString(exp) { return exp.text && util.is_string(exp.text) }
function stringValue(exp) { return exp.text.slice(1, -1) }
function isRef(exp) { return isLeaf(exp) && !isBoolean(exp) && !isNumber(exp) && !isString(exp) }
function refName(exp) { return exp.text}


function alloc(variable, state) {
  return new VariableBinding(variable, state.exp.id)
}


function isEmptyList(datum) { return datum.children && datum.children.length == 0 }
function isSymbol(datum) { return datum.text && util.is_identifier(datum.text) }
function symbolValue(datum) { return datum.text }
function isAtom(datum) { return util.is_leaf(datum) }

function evalQuote(exp) {
  var datum = exp.children[1]
  if (isEmptyList(datum)) {
    return new Set(EMPTY_LIST)
  }
  else if (isSymbol(datum)) {
    return new Set(new AbstractString(symbolValue(datum)))
  }
  else if (isAtom(datum)) {
    return atomicEval(datum) 
  }
  else {
    throw new Error("unsupported quote datum")
  }
}


function isAtomic(exp) {
  return isLambda(exp) || isQuote(exp) || isLeaf(exp)
}

function atomicEval(exp, env, store) {
  if (isLambda(exp)) {
    return new Set(new Closure(lambdaParams(exp), lambdaBody(exp), env))
  }
  else if (isQuote(exp)) {
    return evalQuote(exp)
  }
  else if (isBoolean(exp)) {
    return new Set(booleanValue(exp) ? A_TRUE : A_FALSE)
  }
  else if (isNumber(exp)) {
    return new Set(A_NUMBER)
  }
  else if (isString(exp)) {
    return new Set(new AbstractString(stringValue(exp)))
  }
  else if (isPrim(exp)) {
    return new Set(new PrimValue(refName(exp)))
  }
  else if (isRef(exp)) {
    var addr = env.get(refName(exp))
    return store.get(addr)
  }
  else {
    throw new Error("non-atomic expression")
  }
}

function taintEval(exp, env, taint) {
  if (isLambda(exp) || isQuote(exp) || isBoolean(exp) || isNumber(exp) || isString(exp) || isPrim(exp)) {
    return new Set
  }
  else if (isRef(exp)) {
    var addr = env.get(refName(exp))
    return taint.get(addr)
  }
  else {
    throw new Error("non-atomic expression")
  }
}


function updateEnv(env, variable, address) {
  return env.set(variable, address)
}

function updateEnvM(env, vars, addrs) {
  return vars.reduce(function(env, variable, index) {
    return updateEnv(env, variable, addrs[index]);
  }, env);
}


function updateStore(store, addr, val) {
  var old = store.get(addr);
  var merged = old ? old.addAll(val) : val;
  return store.set(addr, merged);
}

function updateStoreM(store, addrs, vals) {
  return addrs.reduce(function(store, addr, index) {
    return updateStore(store, addr, vals[index]);
  }, store);
}


function getCallExpressions(v, callMap) {
  var e = callMap[v]
  return e ? new Set(new Integer(e)) : new Set
}


function popFrame(vals, state, frame, callMap, store) {
  store = store === undefined ? state.store : store
  if (frame.isTopFrame) {
    return undefined
  }
  else if (frame.isLetFrame) {
    var allocate = !frame.isInstallFrame
    var addr = allocate ? alloc(frame.v, state) : frame.env.get(frame.v)
    var newEnv = allocate ? updateEnv(frame.env, frame.v, addr) : frame.env

    var newStore = updateStore(store, addr, vals)
    var newTaint = updateStore(state.taint, addr, getCallExpressions(frame.v, callMap))
    return [new State(frame.exp, newEnv, newStore, newTaint), new Pop(frame)]
  }
  else {
    throw new Error("unknown frame type")
  }
}

// Abstract Garbage Collection

function adjacent(store, addrs) {
  var reachable = new Set 

  addrs.forEach(function(addr) {
    var vals = store.get(addr)
    if (vals) {
      vals.forEach(function(val) {
        if (val.env) {
          val.env.forEach(function(v, addr) {
            reachable = reachable.add(addr)
          })
        }
        else if (val instanceof PairLocation) {
          reachable = reachable.add(new FieldAddress(val, "car"))
          reachable = reachable.add(new FieldAddress(val, "cdr"))
        }
      })
    }
  })

  var newAddrs = addrs.addAll(reachable)
  if (newAddrs.subsetOf(addrs))
    return addrs
  else
    return adjacent(store, newAddrs)
}


function gc(store, env, frames) {
  var live = new Set

  // OPT: this seems like a calculation that can be done once
  env.forEach(function(variable, address) {
    live = live.add(address)
  })

  // OPT: this seems like a calulation that does not need to be done every time
  frames.forEach(function(frame) {
    frame.env.forEach(function(variable, address) {
      live = live.add(address)
    })
  })

  // OPT: need to think about these next steps and how their work can be consolidated
  var newStore = new Map

  live = adjacent(store, live)
  live.forEach(function(addr) {
    var vals = store.get(addr)
    if (vals) newStore = newStore.set(addr, vals)
  })

  return newStore
}

// Step function

function nextgc(state, frame, possibleFrames, callMap) {
  // TODO: the taint store should probably be garbage collected as well
  var pairs = next(state, frame, callMap)
  pairs.forEach(function(pair) {
    var state = pair[0]
    state.store = gc(state.store, state.env, possibleFrames)
  })
  return pairs
}

function next(state, frame, callMap) {
  var exp = state.exp
  var env = state.env
  var store = state.store
  var taint = state.taint

  if (isAtomic(exp)) {
    var succ = popFrame(atomicEval(exp, env, store, taint), state, frame, callMap)
    return succ ? [succ] : [] 
  }
  else if (isLetExp(exp)) {
    var v = letVariable(exp)
    var call = letValue(exp)
    var body = letBody(exp)
    return [[new State(call, env, store, taint), new Push(new LetFrame(v, body, env))]]
  }
  else if (isLetVoidExp(exp)) {
    var vs = letVoidVars(exp)
    var addrs = vs.map(function(v) { return alloc(v, state) })
    var newEnv = updateEnvM(env, vs, addrs) 
    var body = letBody(exp)
    return [[new State(body, newEnv, store, taint), new Eps]]
  }
  else if (isInstallValueExp(exp)) {
    var v = letVariable(exp)
    var value = letValue(exp)
    var body = letBody(exp)
/*
    var newStore = updateStore(store, env.get(v), atomicEval(value, env, store))
    var newTaint = updateStore(taint, env.get(v), taintEval(value, env, taint)) 
    return [[new State(body, env, newStore, newTaint), new Eps]]
*/
    return [[new State(value, env, store, taint), new Push(new InstallFrame(v, body, env))]]
  }
  else if (isIfExp(exp)) {
    var test = atomicEval(ifTestExp(exp), env, store)
    var succs = []
    if (test.contains(A_TRUE)) {
      succs.push([new State(ifThenExp(exp), env, store, taint), new Eps])
    }
    if (test.contains(A_FALSE)) {
      succs.push([new State(ifElseExp(exp), env, store, taint), new Eps])
    }
    return succs
  }
  else if (isApplication(exp)) {
    var f = appFunction(exp)
    var args = appArgs(exp)

    var procs = atomicEval(f, env, store).toArray()
    var argvals = args.map(function(arg) { return atomicEval(arg, env, store) })
    var argtaints = args.map(function(arg) { return taintEval(arg, env, taint) })
    var addrs = args.map(function(a) { return alloc(a, state) }) 

    var succs = procs.map(function(proc) {
      if (proc instanceof PrimValue) {
        var evaluator = Primitives[proc.name]
        return evaluator(argvals, state, frame, callMap)
      }
      else if (proc instanceof Closure) {
        if (proc.params.length != argvals.length) return undefined
        var addrs = proc.params.map(function(param) { return alloc(param, state) })
        var newEnv = updateEnvM(proc.env, proc.params, addrs)
        var newStore = updateStoreM(store, addrs, argvals)
        var newTaint = updateStoreM(taint, addrs, argtaints) 
        return [new State(proc.body, newEnv, newStore, newTaint), new Eps]
      }
      else {
        throw new Error("application not a procedure")
      }
    })
    succs = succs.filter(function(x) { return x })
    return succs
  }
  else {
    throw new Error("unexpected expression")
  }
}


function DSG(s) {

  var id = 0
  var ids = new Map
  var states = new Map

  var edges = new Set

  var epsPreds = new MultiMap
  var epsSuccs = new MultiMap

  var topFrames = new MultiMap
  var pushPreds = new MultiMap
  var possibleFrames = new MultiMap

  var startState = s
  addState(s)
  topFrames.add(s, new TopFrame)

  this.topFrames = function(s) {
    return topFrames.get(s)
  }

  this.possibleFrames = function(s) {
    return possibleFrames.get(s)
  }

  function addState(s) {
    var stateID = ids.get(s)
    if (!stateID) {
      stateID = id++
      ids = ids.set(s, stateID)
      states = states.set(new Integer(stateID), s)
    }
  }

  function processEps(source, target) {
    var topFramesToAdd = topFrames.get(source)
    var possibleFramesToAdd = possibleFrames.get(source)

    epsSuccs.add(source, target)
    epsSuccs.addAll(source, epsSuccs.get(target))     

    epsPreds.add(target, source)
    epsPreds.addAll(target, epsPreds.get(source))

    topFrames.addAll(target, topFramesToAdd)
    topFramesToAdd.forEach(function(frame) {
      pushPreds.addAll(new Pair(target, frame), pushPreds.get(new Pair(source, frame)))
    })
    possibleFrames.addAll(target, possibleFramesToAdd)    

    epsPreds.get(source).forEach(function(pred) {
      epsSuccs.add(pred, target)
      epsSuccs.addAll(pred, epsSuccs.get(target))
    })

    epsSuccs.get(target).forEach(function(succ) {
      epsSuccs.add(succ, target)
      epsSuccs.addAll(succ, epsSuccs.get(target))

      topFrames.addAll(succ, topFramesToAdd)
      topFramesToAdd.forEach(function(frame) {
        pushPreds.addAll(new Pair(succ, frame), pushPreds.get(new Pair(source, frame)))
      })
      possibleFrames.addAll(succ, possibleFramesToAdd)
    })
  }

  function processPush(source, frame, target) {
    topFrames.add(target, frame)
    pushPreds.add(new Pair(target, frame), source)

    var possibleFramesToAdd = possibleFrames.get(source).add(frame)
    possibleFrames.addAll(target, possibleFramesToAdd)

    epsSuccs.get(target).forEach(function(succ) {
      topFrames.add(succ, frame)
      pushPreds.add(new Pair(succ, frame), source)
      possibleFrames.addAll(succ, possibleFramesToAdd)
    })
  }

  function processPop(source, frame, target) {
    pushPreds.get(new Pair(source, frame)).forEach(function(pred) {
      processEps(pred, target)
    })
  }

  this.newEdges = function(es) {
    var targets = []

    es.forEach(function(edge, i) {
      if (!edges.contains(edge)) {
        var action = edge.action

        if (action.isEps) processEps(edge.source, edge.target)
        else if (action.isPush) processPush(edge.source, action.frame, edge.target)
        else if (action.isPop) processPop(edge.source, action.frame, edge.target)
        else throw new Error("unsupoorted stack action")

        edges = edges.add(edge)
        addState(edge.source)
        addState(edge.target)
        targets.push(edge.target)
      }
    })

    var newStates = new Set 

    targets.forEach(function(s) {
      newStates = newStates.add(s)
      newStates = newStates.addAll(epsSuccs.get(s))
    })

    return newStates
  }

  this.edgeCount = function() {
    return edges.size()
  }

  this.toDot = function() {
    var dot = "digraph {\n"
    ids.forEach(function(s, id) {
      dot += "  " + id + " [URL=\"javascript:__showState(" + id + ")\"]\n"
    })
    edges.forEach(function(e) {
      dot += "  " + ids.get(e.source) + " -> " + ids.get(e.target) + "\n" 
    })
    dot += "}\n"
    return dot
  }

  function expToString(exp) {
    if (exp.children) {
      var value = "("
      exp.children.forEach(function(e) {
        value += expToString(e)
        value += " "
      })
      value += ")"
      value += "<sup>" + exp.id + "</sup>"
      return value
    }
    else {
      return exp.text + "<sup>" + exp.id + "</sup>"
    }
  }

  this.stateToHTML = function(id) {
    var s = states.get(new Integer(id))

    var html = ""
    html += "<h3>Expression: </h3>" + expToString(s.exp) 

    html += "<h3>Environment: </h3>"

    html += "<table>"
    s.env.forEach(function(variable, addr) {
      html += "<tr>" 
      html += "<td>" + variable + "</td>"
      html += "<td>" + addr + "</td>"
      html += "</tr>"    
    })
    html += "</table>"

    html += "<h3>Store: </h3>"

    html += "<table>"
    s.store.forEach(function(addr, vals) {
      html += "<tr>"
      html += "<td>" + addr + "</td>"
      html += "<td>{" + vals.toArray().reduce(function(vals, val) { return vals + ", " + val }) + "}</td>"
      html += "</tr>"
    })
    html += "</table>"

    html += "<h3>Taint Store: </h3>"

    html += "<table>"
    s.taint.forEach(function(addr, vals) {
      html += "<tr>"
      html += "<td>" + addr + "</td>"
      html += "<td>{" + vals.toArray().reduce(function(vals, val) { return vals + ", " + val }) + "}</td>"
      html += "</tr>"
    })
    html += "</table>"
    
    return html
  }

  this.forEachState = function(f) {
    ids.forEach(function(k, v) { f(k) })
  }

}


function inject(exp) {
  return new State(exp, new Env, new Store, new Taint)
}


function generateDSG(exp) {

  var s = inject(exp)

  var toVisit = new Set(s)
  var dsg = new DSG(s)

  var callMap = getCallMap(exp)

  while (!toVisit.isEmpty()) {
    var edges = []
 
    toVisit.forEach(function(s) {
      var possibleFrames = dsg.possibleFrames(s)
      dsg.topFrames(s).forEach(function(f) {
        nextgc(s, f, possibleFrames, callMap).forEach(function (n) {
          edges.push(new Edge(s, n[1], n[0]))
        })
      })
    })

    toVisit = dsg.newEdges(edges)
  }

  conjugateCollapse(exp, dsg)
  return dsg
}


// Taint Analysis

function expFold(exp, value, callback) {
  if (isLambda(exp)) {
    var body = lambdaBody(exp)
    if (callback.visitLambdaExp)
      value = callback.visitLambdaExp(value, exp, lambdaParams(exp), body)
    return expFold(body, value, callback)
  }
  else if (isAtomic(exp)) {
    if (callback.visitAtomicExp)
      value = callback.visitAtomicExp(value, exp)
    return value
  }
  else if (isLetExp(exp)) {
    var call = letValue(exp)
    var body = letBody(exp)
    if (callback.visitLetExp)
      value = callback.visitLetExp(value, exp, letVariable(exp), call, body)
    value = expFold(call, value, callback)
    return expFold(body, value, callback)
  }
  else if (isLetVoidExp(exp)) {
    var body = letBody(exp)
    if (callback.visitLetVoidExp)
      value = callback.visitLetVoidExp(value, exp, letVoidVars(exp), body)
    return expFold(body, value, callback)
  }
  else if (isInstallValueExp(exp)) {
    var call = letValue(exp)
    var body = letBody(exp)
    if (callback.visitInstallValueExp)
      value = callback.visitInstallValueExp(value, exp, letVariable(exp), call, body)
    value = expFold(call, value, callback)
    return expFold(body, value, callback)    
  }
  else if (isIfExp(exp)) {
    var testExp = ifTestExp(exp)
    var thenExp = ifThenExp(exp)
    var elseExp = ifElseExp(exp)
    if (callback.visitIfExp)
      value = callback.visitIfExp(value, exp, testExp, thenExp, elseExp)
    value = expFold(testExp, value, callback)
    value = expFold(thenExp, value, callback)
    return expFold(elseExp, value, callback)
  }
  else if (isApplication(exp)) {
    var fun = appFunction(exp)
    var args = appArgs(exp)
    if (callback.visitAppExp)
      value = callback.visitAppExp(value, exp, fun, args)
    value = expFold(fun, value, callback)
    args.forEach(function (arg) { value = expFold(arg, value, callback) })
    return value
  }
  else {
    throw new Error("unexpected expression")
  }
}


function getCallMap(exp) {
  function mapCall(value, exp, id, call, body) {
    value[id] = call.id
    return value
  }
  return expFold(exp, {}, { visitLetExp: mapCall, visitInstallValueExp: mapCall })
}



function conjugateCollapse(exp, dsg) {

  var betas = expFold(exp, new Set, {
    visitAppExp: function(value, exp, fun, args) {
      if (fun.text === "beta")
        value = value.add(new Integer(exp.id))
      return value
    }
  })

  var candidates = new Set
  var disqualified = new Set

  var flipSingleton = new Set(new PrimValue("flip"))

  function isFlipSingleton(s) {
    var fun = appFunction(s.exp)
    var args = appArgs(s.exp)
    return args.length == 1 && flipSingleton.equals(atomicEval(fun, s.env, s.store))
  }

  function singletonBetaArg(s) {
    var arg = appArgs(s.exp)[0]
    if (isRef(arg)) {
      var taints = s.taint.get(s.env.get(refName(arg)))
      if (taints.size() == 1 && taints.subsetOf(betas))
        return taints
    }
    return new Set
  }

  function primitiveInFunctionPosition(s, f) {
    var primitive = false
    atomicEval(appFunction(s.exp), s.env, s.store).forEach(function(v) {
      if (v instanceof PrimValue) primitive = true
    })
    return primitive
  }

  function betasInArgumentPosition(s, args) {
    return args.reduce(function(acc, arg) {
      return isRef(arg) ? acc.addAll(s.taint.get(s.env.get(refName(arg)))) : acc
    }, new Set)
  }

  dsg.forEachState(function(s) {
    if (isApplication(s.exp)) {
      var candidate
      if (isFlipSingleton(s) && !(candidate = singletonBetaArg(s)).isEmpty()) {
        candidate.forEach(function(c) {
          candidates = candidates.add(new Pair(new Integer(s.exp.id), c))
        })
      }
      else if (primitiveInFunctionPosition(s, appFunction(s.exp))) {
        disqualified = disqualified.addAll(betasInArgumentPosition(s, appArgs(s.exp)))
      }
    }
  })

  candidates.forEach(function(candidate) {
    if (!disqualified.contains(candidate.d))
      console.log(candidate.a + " and " + candidate.d + " are conjugate collapsable")
  })

}


exports.generateDSG = generateDSG

// Implementation Items
//   Do I need to add the top frames of epsilon predecessors or shouldn't they already be added
//   What if we have an atomic expression with an empty environment?
//   Do I really just want to pass the top frame or the actual continuation?


