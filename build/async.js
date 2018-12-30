"use strict";
exports.__esModule = true;
var core_1 = require("./core");
/**
 * It accepts a promise returning function `func` and return a `Straw` that will execute `func` and fire a `promise-resolve` event on success or a `promise-error` event on failure.
 * The emitted event will use the returned `Straw` as a ref.
 * @param func promise returning function
 * @returns Straw that will call `func` when run
 */
exports.promise = function (func) {
    var ref = core_1.fn(function (val, time, event, emit) {
        func(val, time, event, emit)
            .then(emit({ type: 'promise-resolve', ref: ref }))["catch"](emit({ type: 'promise-error', ref: ref }));
    });
    return ref;
};
