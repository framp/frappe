"use strict";
exports.__esModule = true;
var core_1 = require("./core");
exports.time = core_1.fn(function (val, time) { return time; });
exports.atTime = function (targetTime, margin) {
    if (margin === void 0) { margin = 0; }
    return core_1.fn(function (val, time) {
        return Boolean(time - margin <= targetTime && time + margin >= targetTime);
    });
};
exports.periodicTime = function (period) {
    return core_1.accum(function (acc, val, time) {
        var newAcc = acc === null ? time : acc;
        return [newAcc, Math.floor(time / period) % 2 === 0];
    }, null);
};
exports.beforeTime = function (targetTime) {
    return core_1.accum(function (acc, val, time) {
        var newAcc = acc === null ? time : acc;
        return [newAcc, time - newAcc <= targetTime];
    }, null);
};
exports.afterTime = function (targetTime) {
    return core_1.accum(function (acc, val, time) {
        var newAcc = acc === null ? time : acc;
        return [newAcc, time - newAcc >= targetTime];
    }, null);
};
exports.betweenTimes = function (startTime, endTime) {
    return core_1.and(exports.beforeTime(endTime), exports.afterTime(startTime));
};
