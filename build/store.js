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
/**
 * An array-like driver for `dynamicStructure` that store data in a JavaScript Array.
 */
exports.arrayDriver = {
    /**
     * Function used to return an initial value
     *
     * @returns an empty Array
     */
    "new": function () { return []; },
    /**
     * Function used to remove an element from the Array.
     *
     * @param id an index to delete in the Array
     * @returns an Array with the element at the `id` index removed
     */
    remove: function (id) { return function (array) {
        return array.slice(0, id).concat(array.slice(id + 1));
    }; },
    /**
     * Function used to add an element to the Array.
     *
     * If `id` is not provided the element will be added at the end of the Array.
     *
     * @param id the index where the new element will be inserted
     * @param val a value to insert
     * @returns an Array with `val` inserted at the `id` index
     */
    add: function (id, val) { return function (array) {
        if (typeof id === 'undefined') {
            return array.concat(val);
        }
        return array.slice(0, id).concat(val, array.slice(id + 1));
    }; }
};
/**
 * A map-like driver for `dynamicStructure` that store data in a JavaScript Object.
 */
exports.mapDriver = {
    /**
     * Function used to return an initial value
     *
     * @returns an empty Object
     */
    "new": function () { return ({}); },
    /**
     * Function used to remove an element from the Object.
     *
     * @param id a key to delete in the Object
     * @returns an Object with the element at the `id` key removed
     */
    remove: function (id) { return function (map) {
        var copy = __assign({}, map);
        delete copy[id];
        return copy;
    }; },
    /**
     * Function used to add an element to the Object.
     *
     * @param id the key where the new element will be inserted
     * @param val a value to insert in the Object
     * @returns an Object with `val` inserted at the `id` key
     */
    add: function (id, val) { return function (map) {
        var _a;
        return (__assign({}, map, (_a = {}, _a[id] = val, _a)));
    }; }
};
/**
 * It creates a `Straw` that will maintain state, adding and removing elements, by reading data from provided `actions` `Straws`.
 *
 * It uses a provided driver to manage state.
 *
 * If you're looking for a battery-included solution check out `dynamicArray` and `dynamicMap`.
 *
 * @param driver an Object providing the `new`, `remove`, `add` functions
 * @param {DynamicActions} actions an Object providing an `add` and `remove` `Straws`
 * @returns a `Straw` that will retunr the current state
 */
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
/**
 * It creates a `Straw` that will maintain state, adding and removing elements, by reading data from provided `actions` `Straws`.
 *
 * Items will be inserted and removed into an Array.
 *
 * @param {DynamicActions} actions an Object providing an `add` and `remove` `Straws`
 * @returns a `Straw` that will retunr the current state
 */
exports.dynamicArray = function (actions) {
    return exports.dynamicStructure(exports.arrayDriver)(actions);
};
/**
 * It creates a `Straw` that will maintain state, adding and removing elements, by reading data from provided `actions` `Straws`.
 *
 * Items will be inserted and removed into an Object.
 *
 * @param {DynamicActions} actions an Object providing an `add` and `remove` `Straws`
 * @returns a `Straw` that will return the current state
 */
exports.dynamicMap = function (actions) {
    return exports.dynamicStructure(exports.mapDriver)(actions);
};
