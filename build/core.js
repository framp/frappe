"use strict";
exports.__esModule = true;
var STRAW_KEY = '__type';
var STRAW_VALUE = 'Straw';
exports.of = function (func) {
    func[STRAW_KEY] = STRAW_VALUE;
    return func;
};
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
exports.id = exports.of(function (val) { return [exports.id, val]; });
exports.constant = function (val) { return exports.of(function (a) { return [exports.constant(val), val]; }); };
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
exports.composeRight = function () {
    var straws = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        straws[_i] = arguments[_i];
    }
    return composeFrom.apply(void 0, ['reduceRight'].concat(straws));
};
exports.composeLeft = function () {
    var straws = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        straws[_i] = arguments[_i];
    }
    return composeFrom.apply(void 0, ['reduce'].concat(straws));
};
exports.compose = function () {
    var straws = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        straws[_i] = arguments[_i];
    }
    return composeFrom.apply(void 0, ['reduceRight'].concat(straws));
};
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
exports.fanout = function () {
    var straws = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        straws[_i] = arguments[_i];
    }
    return exports.compose(exports.split.apply(void 0, straws), exports.fn(function (val) { return straws.map(function () { return val; }); }));
};
exports.accumState = function (func, acc) {
    return exports.of(function (val, time, event, emit) {
        var _a = func(acc, val, time, event, emit), newAcc = _a[0], output = _a[1];
        return [exports.accumState(func, newAcc), output];
    });
};
exports.accum = function (func, acc) {
    return exports.accumState(function (acc, val, time, event, emit) {
        var newVal = func(acc, val, time, event, emit);
        return [newVal, newVal];
    }, acc);
};
exports.isStraw = function (val) {
    return typeof val === 'function' && val[STRAW_KEY] === STRAW_VALUE;
};
exports.constantify = function (val) {
    return exports.isStraw(val) ? val : exports.constant(val);
};
exports.holdWhen = function (condition, straw) {
    return exports.accumState(function (_a, val, time, event, emit) {
        var straw = _a[0], acc = _a[1];
        var _b = straw(val, time, event, emit), newStraw = _b[0], result = _b[1];
        return condition(acc, result, time, event, emit)
            ? [[newStraw, result], result]
            : [[newStraw, acc], acc];
    }, [straw]);
};
exports.holdFirst = function (straw) { return exports.holdWhen(function (acc, val) { return !acc; }, straw); };
exports.hold = function (straw) { return exports.holdWhen(function (acc, val) { return val; }, straw); };
exports.take = function (n, straw) {
    return exports.accumState(function (_a, val, time, event, emit) {
        var straw = _a[0], acc = _a[1];
        if (acc === 0)
            return [[straw, acc], null];
        var _b = straw(val, time, event, emit), newStraw = _b[0], newVal = _b[1];
        return [[newStraw, acc - 1], newVal];
    }, [straw, n]);
};
exports.once = function (straw) { return exports.take(1, straw); };
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
exports.not = function (straw) {
    return exports.of(function (val, time, event, emit) {
        var _a = straw(val, time, event, emit), newStraw = _a[0], newVal = _a[1];
        return [exports.not(newStraw), !newVal];
    });
};
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
