"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var core_1 = require("./core");
exports.arrayDriver = {
    "new": function () { return []; },
    remove: function (id) { return function (array) {
        return array.slice(0, id).concat(array.slice(id + 1));
    }; },
    add: function (id, val) { return function (array) {
        if (typeof id === 'undefined') {
            return array.concat(val);
        }
        return array.slice(0, id).concat(val, array.slice(id + 1));
    }; }
};
exports.mapDriver = {
    "new": function () { return ({}); },
    remove: function (id) { return function (map) {
        var copy = __assign({}, map);
        delete copy[id];
        return copy;
    }; },
    add: function (id, val) { return function (map) {
        var _a;
        return (__assign({}, map, (_a = {}, _a[id] = val, _a)));
    }; }
};
exports.dynamicStructure = function (driver) { return function (_a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.add, add = _c === void 0 ? core_1.constant(false) : _c, _d = _b.remove, remove = _d === void 0 ? core_1.constant(false) : _d;
    return core_1.accum(function (_a, val, time, event, emit) {
        var add = _a[0], remove = _a[1], acc = _a[2];
        var _b = add(val, time, event, emit), newAdd = _b[0], addTriggered = _b[1];
        var _c = remove(val, time, event, emit), newRemove = _c[0], removeTriggered = _c[1];
        var actions = [
            removeTriggered &&
                typeof removeTriggered.id !== 'undefined' &&
                driver.remove(removeTriggered.id),
            addTriggered && driver.add(addTriggered.id, val)
        ].filter(Boolean);
        var newAcc = actions.reduce(function (acc, fn) { return fn(acc); }, acc);
        return [[newAdd, newRemove, newAcc], newAcc];
    }, [add, remove, driver["new"]()]);
}; };
exports.dynamicArray = function (actions) {
    return exports.dynamicStructure(exports.arrayDriver)(actions);
};
exports.dynamicMap = function (actions) {
    return exports.dynamicStructure(exports.mapDriver)(actions);
};
