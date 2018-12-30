"use strict";
exports.__esModule = true;
var STRAW_KEY = '__type';
var STRAW_VALUE = 'Straw';
/**
 * It accepts a function `func` and return a `Straw`.
 *
 * `func` will accept 4 parameters `val`, `time`, `event`, `emit` and returns a tuple `[nextFunc, result]`.
 *
 * `nextFunc` can be used to change the behaviour of `func` at the next execution of the `Straw`, `result` will be the output of the `Straw` at the current run.
 *
 * Given a function behaves naturally like a Straw, the only thing `of` is doing is adding a `__type: 'Straw'` to the function for identification purposes (eg: `isStraw`).
 *
 * @param func a function to make into a `Straw`
 * @returns a `Straw` made from `func`
 */
exports.of = function (func) {
    func[STRAW_KEY] = STRAW_VALUE;
    return func;
};
/**
 * It runs a `Straw`, simulating a set of inputs, times, events, emit functions and collect the results in an array.
 *
 * Great for testing straws.
 *
 * `inputs` will be used as a source of truth to count how many times the `Straw` will be run.
 *
 * @param straw a `Straw` to run
 * @param inputs the inputs to run the straw on
 * @param times the times to use for every input being sent
 * @param events the events to use for every input being sent
 * @param emits the emit functions to use for every input being sent
 * @returns an array of values resulting from all the executions of `straw`
 */
exports.run = function (straw, inputs, times, events, emits) {
    if (times === void 0) { times = []; }
    if (events === void 0) { events = []; }
    if (emits === void 0) { emits = []; }
    return inputs.reduce(function (_a, input, index) {
        var straw = _a[0], outputs = _a[1];
        var _b = straw(input, times[index], events[index], emits[index]), newStraw = _b[0], output = _b[1];
        return [newStraw, outputs.concat([output])];
    }, [straw, []])[1];
};
/**
 * It's a `Straw` that returns always the value.
 *
 * @returns a tuple containing the `id` `Straw` and the value passed.
 */
exports.id = exports.of(function (val) { return [exports.id, val]; });
/**
 * It accepts a value `val` and return a `Straw` that will always return that `val`.
 *
 * @param val a value to use
 * @returns a `Straw` that will always return `val`
 */
exports.constant = function (val) { return exports.of(function (a) { return [exports.constant(val), val]; }); };
/**
 * It accepts a function `func` and return a `Straw` that will execute `func` .
 *
 * `func` will accept 4 parameters `val`, `time`, `event`, `emit` and returns just the result (unlike `of`).
 *
 * If you want to change how the `Straw` behaves in the next executions you should use `of`.
 *
 * @param func a function to make into a `Straw`
 * @returns a `Straw` that will call `func` at every run
 */
exports.fn = function (func) {
    return exports.of(function (val, time, event, emit) { return [exports.fn(func), func(val, time, event, emit)]; });
};
var composeFrom = function (reduce) {
    var straws = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        straws[_i - 1] = arguments[_i];
    }
    return exports.of(function (val, time, event, emit) {
        var _a = straws[reduce](function (res, f) {
            var _a = f(res[1], time, event, emit), straw = _a[0], out = _a[1];
            return [[straw].concat(res[0]), out];
        }, [[], val]), newStraws = _a[0], out = _a[1];
        return [composeFrom.apply(void 0, [reduce].concat(newStraws)), out];
    });
};
/**
 * It composes a number of `Straws` together right to left.
 *
 * The first `val` is fed into the rightward `Straw`, the result of which get fed into the next `Straw`.
 *
 * The same action is repeated until all the `Straws` are processed.
 *
 * The same `time`, `event`, `emit` are passed to all the `Straws`.
 *
 * @param straws the `Straws` that will be composed together
 * @returns a `Straw` that will execute all the `straws`
 */
exports.composeRight = function () {
    var straws = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        straws[_i] = arguments[_i];
    }
    return composeFrom.apply(void 0, ['reduceRight'].concat(straws));
};
/**
 * It composes a number of `Straws` together left to right.
 *
 * The first `val` is fed into the leftward `Straw`, the result of which get fed into the next `Straw`.
 *
 * The same action is repeated until all the `Straws` are processed.
 *
 * The same `time`, `event`, `emit` are passed to all the `Straws`.
 *
 * @param straws the `Straws` that will be composed together
 * @returns a `Straw` that will execute all the `straws`
 */
exports.composeLeft = function () {
    var straws = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        straws[_i] = arguments[_i];
    }
    return composeFrom.apply(void 0, ['reduce'].concat(straws));
};
/**
 * It composes a number of `Straws` together right to left.
 *
 * The first `val` is fed into the rightward `Straw`, the result of which get fed into the next `Straw`.
 *
 * The same action is repeated until all the `Straws` are processed.
 *
 * The same `time`, `event`, `emit` are passed to all the `Straws`.
 *
 * @param straws the `Straws` that will be composed together
 * @returns a `Straw` that will execute all the `straws`
 */
exports.compose = function () {
    var straws = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        straws[_i] = arguments[_i];
    }
    return composeFrom.apply(void 0, ['reduceRight'].concat(straws));
};
/**
 * It accepts N `straws` and returns a `Straw` that accepts an array `vals` of N values.
 *
 * The resulting `Straw` will run each of the `Straws` using a single value from `vals`, taken by index.
 *
 * The same `time`, `event`, `emit` are passed to all the `Straws`.
 *
 * @param straws the `Straws` that will be used
 * @returns a `Straw` that accepts `vals` and that will execute all the `straws`
 */
exports.split = function () {
    var straws = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        straws[_i] = arguments[_i];
    }
    return exports.of(function (vals, time, event, emit) {
        var results = vals.map(function (v, i) { return straws[i](v, time, event, emit); });
        var newStraws = results.map(function (_a) {
            var a = _a[0];
            return a;
        });
        var newVals = results.map(function (_a) {
            var _ = _a[0], a = _a[1];
            return a;
        });
        return [exports.split.apply(void 0, newStraws), newVals];
    });
};
/**
 * It accepts N `straws` and returns a `Straw` that will accept a single value `val`.
 *
 * The resulting `Straw` will run each of the `Straws` using `val`.
 *
 * The same `time`, `event`, `emit` are passed to all the `Straws`.
 *
 * @param straws the `Straws` that will be used
 * @returns a `Straw` that accepts `val` and that will execute all the `straws`
 */
exports.fanout = function () {
    var straws = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        straws[_i] = arguments[_i];
    }
    return exports.compose(exports.split.apply(void 0, straws), exports.fn(function (val) { return straws.map(function () { return val; }); }));
};
/**
 * It creates a `Straw` that will keep state, given a function `func` and an initial state `acc`.
 *
 * Similarly to a reducer, `func` accepts `acc`, `val`, `time`, `event`, `emit` and returns a tuple `[newAcc, output]`.
 *
 * `newAcc` will be used as the `acc` in the next execution of the `Straw`, while `output` will be returned in the current execution.
 *
 * @param func the reducer function `func`
 * @param acc the initial state
 * @returns a `Straw` that uses `func` to store state
 */
exports.accum = function (func, acc) {
    return exports.of(function (val, time, event, emit) {
        var _a = func(acc, val, time, event, emit), newAcc = _a[0], output = _a[1];
        return [exports.accum(func, newAcc), output];
    });
};
/**
 * It creates a `Straw` that will keep state, given a function `func` and an initial state `acc`.
 *
 * Similarly to a reducer, `func` accepts `acc`, `val`, `time`, `event`, `emit` and returns a single value that will be returned in the current execution and used as `acc` in the next execution of the `Straw`.
 *
 * If you want your internal state to be different from what it's being returned, see `accum`.
 *
 * @param func the reducer function
 * @param acc the initial state
 * @returns a `Straw` that uses `func` to store state
 */
exports.accum1 = function (func, acc) {
    return exports.accum(function (acc, val, time, event, emit) {
        var newVal = func(acc, val, time, event, emit);
        return [newVal, newVal];
    }, acc);
};
/**
 * It accepts a value `val` and return a boolean indicating whether `val` is a `Straw` or not.
 *
 * @param val a value to check
 * @returns a boolean to indicate if `val` is a `Straw`
 */
exports.isStraw = function (val) {
    return typeof val === 'function' && val[STRAW_KEY] === STRAW_VALUE;
};
/**
 * It accepts a value `val` and return `val`, if it's a `Straw`, or the `Straw` `constant(val)`.
 *
 * @param val a value to use
 * @returns a `Straw`, either `val` or `constant(val)`
 */
exports.constantify = function (val) {
    return exports.isStraw(val) ? val : exports.constant(val);
};
/**
 * It creates a `Straw` that holds a value across executions of a `Straw` when a `condition` predicate matches.
 *
 * `condition` accepts the current value `acc` being hold (if present), `val`, `time`, `event`, `emit`.
 *
 * Based on the output of `condition` the current value `acc` will be kept or it will be swapped with `val`.
 *
 * @param condition a function to check if the current execution
 * @param straw the straw to run through
 * @returns a holding values `Straw`
 */
exports.holdWhen = function (condition, straw) {
    return exports.accum(function (_a, val, time, event, emit) {
        var straw = _a[0], acc = _a[1];
        var _b = straw(val, time, event, emit), newStraw = _b[0], result = _b[1];
        return condition(acc, result, time, event, emit)
            ? [[newStraw, result], result]
            : [[newStraw, acc], acc];
    }, [straw]);
};
/**
 * It creates a `Straw` that holds the first value returned by `straw` for all the executions.
 *
 * @param straw the straw to run through
 * @returns a holding values `Straw`
 */
exports.holdFirst = function (straw) { return exports.holdWhen(function (acc, val) { return !acc; }, straw); };
/**
 * It creates a `Straw` that holds all the truthy values returned by `straw` for all the executions.
 *
 * @param straw the straw to run through
 * @returns a holding values `Straw`
 */
exports.hold = function (straw) { return exports.holdWhen(function (acc, val) { return val; }, straw); };
/**
 * It creates a `Straw` that invokes the given `straw` at most `n` times.
 *
 * @param n the number of executions that will invoke `straw`
 * @param straw the straw to run through
 * @returns a `Straw` that will return values for at most `n` executions
 */
exports.take = function (n, straw) {
    return exports.accum(function (_a, val, time, event, emit) {
        var straw = _a[0], acc = _a[1];
        if (acc === 0)
            return [[straw, acc], null];
        var _b = straw(val, time, event, emit), newStraw = _b[0], newVal = _b[1];
        return [[newStraw, acc - 1], newVal];
    }, [straw, n]);
};
/**
 * It creates a `Straw` that invokes the given `straw` only once.
 *
 * @param straw the straw to run through
 * @returns a `Straw` that will return only the first value
 */
exports.once = function (straw) { return exports.take(1, straw); };
/**
 * It creates a `Straw` that returns a reduce of all the given `straws` starting from an initial value `acc`.
 *
 * The reducer `func` accepts `acc`, the current `straw`, `val`, `time`, `event`, `emit` and it's responsible for running each `straw` and return a new (or the same) `straw` for the next execution.
 *
 * The `and` and `or` functions are implemented with `reduce`.
 *
 * @param func the reducer function
 * @param acc the initial state
 * @returns a `Straw` that will reduce all the `straws`
 */
exports.reduce = function (func, acc, straws) {
    return exports.of(function (val, time, event, emit) {
        var _a = straws.reduce(function (_a, straw) {
            var straws = _a[0], acc = _a[1];
            var _b = func(acc, straw, val, time, event, emit), newStraw = _b[0], newVal = _b[1];
            return [straws.concat(newStraw), newVal];
        }, [[], acc]), newStraws = _a[0], newVal = _a[1];
        return [exports.reduce(func, acc, newStraws), newVal];
    });
};
/**
 * It creates a `Straw` from a number of `Straws` which return a boolean to indicate if all the `Straws` outputs are truthy.
 *
 * The equivalent of the `&&` operator for `Straws`.
 *
 * @param straws the `Straws` to evaluate
 * @returns a `Straw` that will return the desired boolean
 */
exports.and = function () {
    var straws = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        straws[_i] = arguments[_i];
    }
    return exports.reduce(function (acc, straw, val, time, event, emit) {
        if (!acc)
            return [straw, acc];
        var _a = straw(val, time, event, emit), newStraw = _a[0], newVal = _a[1];
        return [newStraw, acc && newVal];
    }, true, straws);
};
/**
 * It creates a `Straw` from a number of `Straws` which return a boolean to indicate if at least one of the `Straws` outputs is truthy.
 *
 * The equivalent of the `||` operator for `Straws`.
 *
 * @param straws the `Straws` to evaluate
 * @returns a `Straw` that will return the desired boolean
 */
exports.or = function () {
    var straws = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        straws[_i] = arguments[_i];
    }
    return exports.reduce(function (acc, straw, val, time, event, emit) {
        if (acc)
            return [straw, acc];
        var _a = straw(val, time, event, emit), newStraw = _a[0], newVal = _a[1];
        return [newStraw, acc || newVal];
    }, false, straws);
};
/**
 * It creates a `Straw` from a single `Straws` which return a boolean to indicate if the `Straw` output is falsy.
 *
 * The equivalent of the `!` operator for `Straws`.
 *
 * @param straw the `Straw` to evaluate
 * @returns a `Straw` that will return the desired boolean
 */
exports.not = function (straw) {
    return exports.of(function (val, time, event, emit) {
        var _a = straw(val, time, event, emit), newStraw = _a[0], newVal = _a[1];
        return [exports.not(newStraw), !newVal];
    });
};
/**
 * It creates a `Straw` from a number of `Straws`, paired up in `conditions`, `effects`.
 *
 * All the `Straws` with a even index will be assumed to be conditions, all the `Straws` with an odd index will be assumed to be the `Straws` to be executed.
 *
 * `when` will go through each `condition` in order; as soon as a condition with a truthy value is found the respective `effect` will be executed and returned.
 *
 * Unevaluated `conditions` and unevaluated `effects` won't be executed.
 *
 * @param straws the `Straws` paired up in `conditions` and `effects`
 * @returns a `Straw` that will return the first `effect` found with a `truthy` condition
 */
exports.when = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return exports.of(function (val, time, event, emit) {
        var indexedArgs = args.map(function (val, i) { return [val, i]; });
        var conditions = indexedArgs.filter(function (_a) {
            var val = _a[0], i = _a[1];
            return i % 2 === 0;
        });
        var newArgs = args.slice();
        for (var i = 0; i < conditions.length; i++) {
            var _a = conditions[i], condition = _a[0], conditionArgIndex = _a[1];
            var _b = condition(val, time, event, emit), conditionStraw = _b[0], conditionVal = _b[1];
            if (!conditionVal) {
                newArgs = newArgs
                    .slice(0, conditionArgIndex)
                    .concat(conditionStraw)
                    .concat(newArgs.slice(conditionArgIndex + 1));
                continue;
            }
            var result = args[conditionArgIndex + 1];
            var _c = result(val, time, event, emit), resultStraw = _c[0], resultVal = _c[1];
            newArgs = newArgs
                .slice(0, conditionArgIndex)
                .concat([conditionStraw, resultStraw])
                .concat(newArgs.slice(conditionArgIndex + 2));
            return [exports.when.apply(void 0, newArgs), resultVal];
        }
        return [exports.when.apply(void 0, newArgs), null];
    });
};
