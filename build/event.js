"use strict";
exports.__esModule = true;
var core_1 = require("./core");
/**
 * It's a `Straw` that returns always the event.
 *
 * @returns a tuple containing the `event` `Straw` and the event passed.
 */
exports.event = core_1.fn(function (val, time, event) { return event; });
/**
 * It accepts an event `targetEvent` and returns a `Straw` that will emit it.
 *
 * @param targetEvent an event to emit
 * @returns a `Straw` that will emit `targetEvent`
 */
exports.emit = function (targetEvent) {
    return core_1.fn(function (val, time, event, emit) { return emit(targetEvent)({}); });
};
/**
 * It accepts an `event` and returns a `Straw` that will return that `event` when it happens.
 *
 * An optional `transformer` function can be passed to transform the `event` before consumption.
 *
 * @param {FEvent} event an event to look for
 * @param transformer function to be applied to event before return
 * @returns a `Straw` that will look for `event`
 */
exports.on = function (_a, transformer) {
    var type = _a.type, ref = _a.ref, id = _a.id;
    if (transformer === void 0) { transformer = function (val) { return val; }; }
    return core_1.fn(function (val, time, event) {
        return (event &&
            (!type || event.type === type) &&
            (!ref || event.ref === ref) &&
            (!id || event.id === id) &&
            transformer(event)) ||
            undefined;
    });
};
/**
 * It accepts an event `targetEvent` and returns a `Straw` that will return true until that event happens (inclusive of when `targetEvent` happens).
 *
 * @param targetEvent an event to wait for
 * @returns a `Straw` that will return true until that event happens
 */
exports.beforeEvent = function (targetEvent) {
    return core_1.accum(function (acc, val, time, event, emit) {
        var _a = exports.on(targetEvent, Boolean)(val, time, event, emit), happened = _a[1];
        return [!happened && acc, acc];
    }, true);
};
/**
 * It accepts an event `targetEvent` and returns a `Straw` that will return true only after that event happens (inclusive of when `targetEvent` happens).
 *
 * @param targetEvent an event to wait for
 * @returns a `Straw` that will return true only after that event happens
 */
exports.afterEvent = function (targetEvent) {
    return core_1.accum1(function (acc, val, time, event, emit) {
        var _a = exports.on(targetEvent, Boolean)(val, time, event, emit), happened = _a[1];
        return happened || acc;
    }, false);
};
/**
 * It accepts two events `eventStart` and `eventEnd` and returns a `Straw` that will return true after `eventStart` and before `eventEnd` (inclusive of when the events happen).
 *
 * @param eventStart an event to mark the beginning of the interval
 * @param eventEnd an event to mark the end of the interval
 * @returns a `Straw` that will return true after `eventStart` and before `eventEnd`
 */
exports.betweenEvents = function (eventStart, eventEnd) {
    return core_1.and(exports.afterEvent(eventStart), exports.beforeEvent(eventEnd));
};
