"use strict";
exports.__esModule = true;
var core_1 = require("./core");
exports.event = core_1.fn(function (val, time, event) { return event; });
exports.emit = function (targetEvent) {
    return core_1.fn(function (val, time, event, emit) { return emit(targetEvent)({}); });
};
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
exports.beforeEvent = function (targetEvent) {
    return core_1.accumState(function (acc, val, time, event, emit) {
        var _a = exports.on(targetEvent, Boolean)(val, time, event, emit), happened = _a[1];
        return [!happened && acc, acc];
    }, true);
};
exports.afterEvent = function (targetEvent) {
    return core_1.accum(function (acc, val, time, event, emit) {
        var _a = exports.on(targetEvent, Boolean)(val, time, event, emit), happened = _a[1];
        return happened || acc;
    }, false);
};
exports.betweenEvents = function (eventStart, eventEnd) {
    return core_1.and(exports.afterEvent(eventStart), exports.beforeEvent(eventEnd));
};
