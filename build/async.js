"use strict";
exports.__esModule = true;
var core_1 = require("./core");
exports.promise = function (func) {
    var ref = core_1.fn(function (val, time, event, emit) {
        func(val, time, event, emit)
            .then(emit({ type: 'promise-resolve', ref: ref }))["catch"](emit({ type: 'promise-error', ref: ref }));
    });
    return ref;
};
