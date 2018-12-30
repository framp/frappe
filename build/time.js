"use strict";
exports.__esModule = true;
var core_1 = require("./core");
/**
 * It's a `Straw` that returns always the time.
 *
 * @returns a tuple containing the `time` `Straw` and the `time` passed.
 */
exports.time = core_1.fn(function (val, time) { return time; });
/**
 * It accepts a `targetTime` time and returns a `Straw` that will return true when time is `targetTime`.
 *
 * A optional `margin` parameter can be used to relax the comparison:
 * the resulting `Straw` will return true as long as time is within `margin` to `targetTime`.
 *
 * @param targetTime a targetTime time
 * @param margin a margin to use to compare for equality
 * @returns a `Straw` that will return true when time is `targetTime`
 */
exports.atTime = function (targetTime, margin) {
    if (margin === void 0) { margin = 0; }
    return core_1.fn(function (val, time) {
        return Boolean(time - margin <= targetTime && time + margin >= targetTime);
    });
};
/**
 * It accepts a `period` and returns a `Straw` that will alternate returning true or false for `period`.
 *
 * @param period the length in time to use for the interval
 * @returns a `Straw` that will return true or false for `period`
 */
exports.periodicTime = function (period) {
    return core_1.accum(function (acc, val, time) {
        var newAcc = acc === null ? time : acc;
        return [newAcc, Math.floor(time / period) % 2 === 0];
    }, null);
};
/**
 * It accepts a `targetTime` time and returns a `Straw` that will return true until `targetTime` time (inclusive of `targetTime`) startTimeing from when the Straw has been executed first.
 *
 * @param targetTime a time to wait for
 * @returns a `Straw` that will return true until `targetTime`
 */
exports.beforeTime = function (targetTime) {
    return core_1.accum(function (acc, val, time) {
        var newAcc = acc === null ? time : acc;
        return [newAcc, time - newAcc <= targetTime];
    }, null);
};
/**
 * It accepts a `targetTime` time and returns a `Straw` that will return true only after `targetTime` time (inclusive of `targetTime`) startTimeing from when the Straw has been executed first.
 *
 * @param targetTime a time to wait for
 * @returns a `Straw` that will return true until `targetTime`
 */
exports.afterTime = function (targetTime) {
    return core_1.accum(function (acc, val, time) {
        var newAcc = acc === null ? time : acc;
        return [newAcc, time - newAcc >= targetTime];
    }, null);
};
/**
 * It accepts two times `startTime` and `endTime` and returns a `Straw` that will return true after `startTime` and before `endTime` (inclusive of when the events happen).
 *
 * @param startTime a time to mark the beginning of the interval
 * @param endTime a time to mark the endTime of the interval
 * @returns a `Straw` that will return true after `startTime` and before `endTime`
 */
exports.betweenTimes = function (startTime, endTime) {
    return core_1.and(exports.beforeTime(endTime), exports.afterTime(startTime));
};
