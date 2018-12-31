'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = _interopDefault(require('react'));

var STRAW_KEY = '__type';
var STRAW_VALUE = 'Straw';
var of = function (func) {
    func[STRAW_KEY] = STRAW_VALUE;
    return func;
};
var run = function (straw, inputs, times, events, emits) {
    if (times === void 0) { times = []; }
    if (events === void 0) { events = []; }
    if (emits === void 0) { emits = []; }
    return inputs.reduce(function (_a, input, index) {
        var straw = _a[0], outputs = _a[1];
        var _b = straw(input, times[index], events[index], emits[index]), newStraw = _b[0], output = _b[1];
        return [newStraw, outputs.concat([output])];
    }, [straw, []])[1];
};
var id = of(function (val) { return [id, val]; });
var constant = function (val) { return of(function (a) { return [constant(val), val]; }); };
var fn = function (func) {
    return of(function (val, time, event, emit) { return [fn(func), func(val, time, event, emit)]; });
};
var composeFrom = function (reduce) {
    var straws = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        straws[_i - 1] = arguments[_i];
    }
    return of(function (val, time, event, emit) {
        var _a = straws[reduce](function (res, f) {
            var _a = f(res[1], time, event, emit), straw = _a[0], out = _a[1];
            return [[straw].concat(res[0]), out];
        }, [[], val]), newStraws = _a[0], out = _a[1];
        return [composeFrom.apply(void 0, [reduce].concat(newStraws)), out];
    });
};
var composeRight = function () {
    var straws = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        straws[_i] = arguments[_i];
    }
    return composeFrom.apply(void 0, ['reduceRight'].concat(straws));
};
var composeLeft = function () {
    var straws = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        straws[_i] = arguments[_i];
    }
    return composeFrom.apply(void 0, ['reduce'].concat(straws));
};
var compose = function () {
    var straws = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        straws[_i] = arguments[_i];
    }
    return composeFrom.apply(void 0, ['reduceRight'].concat(straws));
};
var split = function () {
    var straws = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        straws[_i] = arguments[_i];
    }
    return of(function (vals, time, event, emit) {
        var results = vals.map(function (v, i) { return straws[i](v, time, event, emit); });
        var newStraws = results.map(function (_a) {
            var a = _a[0];
            return a;
        });
        var newVals = results.map(function (_a) {
            var _ = _a[0], a = _a[1];
            return a;
        });
        return [split.apply(void 0, newStraws), newVals];
    });
};
var fanout = function () {
    var straws = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        straws[_i] = arguments[_i];
    }
    return compose(split.apply(void 0, straws), fn(function (val) { return straws.map(function () { return val; }); }));
};
var accumState = function (func, acc) {
    return of(function (val, time, event, emit) {
        var _a = func(acc, val, time, event, emit), newAcc = _a[0], output = _a[1];
        return [accumState(func, newAcc), output];
    });
};
var accum = function (func, acc) {
    return accumState(function (acc, val, time, event, emit) {
        var newVal = func(acc, val, time, event, emit);
        return [newVal, newVal];
    }, acc);
};
var isStraw = function (val) {
    return typeof val === 'function' && val[STRAW_KEY] === STRAW_VALUE;
};
var constantify = function (val) {
    return isStraw(val) ? val : constant(val);
};
var holdWhen = function (condition, straw) {
    return accumState(function (_a, val, time, event, emit) {
        var straw = _a[0], acc = _a[1];
        var _b = straw(val, time, event, emit), newStraw = _b[0], result = _b[1];
        return condition(acc, result, time, event, emit)
            ? [[newStraw, result], result]
            : [[newStraw, acc], acc];
    }, [straw]);
};
var holdFirst = function (straw) { return holdWhen(function (acc, val) { return !acc; }, straw); };
var hold = function (straw) { return holdWhen(function (acc, val) { return val; }, straw); };
var take = function (n, straw) {
    return accumState(function (_a, val, time, event, emit) {
        var straw = _a[0], acc = _a[1];
        if (acc === 0)
            return [[straw, acc], null];
        var _b = straw(val, time, event, emit), newStraw = _b[0], newVal = _b[1];
        return [[newStraw, acc - 1], newVal];
    }, [straw, n]);
};
var once = function (straw) { return take(1, straw); };
var reduce = function (func, acc, straws) {
    return of(function (val, time, event, emit) {
        var _a = straws.reduce(function (_a, straw) {
            var straws = _a[0], acc = _a[1];
            var _b = func(acc, straw, val, time, event, emit), newStraw = _b[0], newVal = _b[1];
            return [straws.concat(newStraw), newVal];
        }, [[], acc]), newStraws = _a[0], newVal = _a[1];
        return [reduce(func, acc, newStraws), newVal];
    });
};
var and = function () {
    var straws = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        straws[_i] = arguments[_i];
    }
    return reduce(function (acc, straw, val, time, event, emit) {
        if (!acc)
            return [straw, acc];
        var _a = straw(val, time, event, emit), newStraw = _a[0], newVal = _a[1];
        return [newStraw, acc && newVal];
    }, true, straws);
};
var or = function () {
    var straws = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        straws[_i] = arguments[_i];
    }
    return reduce(function (acc, straw, val, time, event, emit) {
        if (acc)
            return [straw, acc];
        var _a = straw(val, time, event, emit), newStraw = _a[0], newVal = _a[1];
        return [newStraw, acc || newVal];
    }, false, straws);
};
var not = function (straw) {
    return of(function (val, time, event, emit) {
        var _a = straw(val, time, event, emit), newStraw = _a[0], newVal = _a[1];
        return [not(newStraw), !newVal];
    });
};
var when = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return of(function (val, time, event, emit) {
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
            return [when.apply(void 0, newArgs), resultVal];
        }
        return [when.apply(void 0, newArgs), null];
    });
};

var time = fn(function (val, time) { return time; });
var atTime = function (targetTime, margin) {
    if (margin === void 0) { margin = 0; }
    return fn(function (val, time) {
        return Boolean(time - margin <= targetTime && time + margin >= targetTime);
    });
};
var periodicTime = function (period) {
    return accumState(function (acc, val, time) {
        var newAcc = acc === null ? time : acc;
        return [newAcc, Math.floor(time / period) % 2 === 0];
    }, null);
};
var beforeTime = function (targetTime) {
    return accumState(function (acc, val, time) {
        var newAcc = acc === null ? time : acc;
        return [newAcc, time - newAcc <= targetTime];
    }, null);
};
var afterTime = function (targetTime) {
    return accumState(function (acc, val, time) {
        var newAcc = acc === null ? time : acc;
        return [newAcc, time - newAcc >= targetTime];
    }, null);
};
var betweenTimes = function (startTime, endTime) {
    return and(beforeTime(endTime), afterTime(startTime));
};

var event = fn(function (val, time, event) { return event; });
var emit = function (targetEvent) {
    return fn(function (val, time, event, emit) { return emit(targetEvent)({}); });
};
var on = function (_a, transformer) {
    var type = _a.type, ref = _a.ref, id$$1 = _a.id;
    if (transformer === void 0) { transformer = function (val) { return val; }; }
    return fn(function (val, time, event) {
        return (event &&
            (!type || event.type === type) &&
            (!ref || event.ref === ref) &&
            (!id$$1 || event.id === id$$1) &&
            transformer(event)) ||
            undefined;
    });
};
var beforeEvent = function (targetEvent) {
    return accumState(function (acc, val, time, event, emit) {
        var _a = on(targetEvent, Boolean)(val, time, event, emit), happened = _a[1];
        return [!happened && acc, acc];
    }, true);
};
var afterEvent = function (targetEvent) {
    return accum(function (acc, val, time, event, emit) {
        var _a = on(targetEvent, Boolean)(val, time, event, emit), happened = _a[1];
        return happened || acc;
    }, false);
};
var betweenEvents = function (eventStart, eventEnd) {
    return and(afterEvent(eventStart), beforeEvent(eventEnd));
};

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var arrayDriver = {
    "new": function () { return []; },
    remove: function (id$$1) { return function (array) {
        return array.slice(0, id$$1).concat(array.slice(id$$1 + 1));
    }; },
    add: function (id$$1, val) { return function (array) {
        if (typeof id$$1 === 'undefined') {
            return array.concat(val);
        }
        return array.slice(0, id$$1).concat(val, array.slice(id$$1 + 1));
    }; }
};
var mapDriver = {
    "new": function () { return ({}); },
    remove: function (id$$1) { return function (map) {
        var copy = __assign({}, map);
        delete copy[id$$1];
        return copy;
    }; },
    add: function (id$$1, val) { return function (map) {
        var _a;
        return (__assign({}, map, (_a = {}, _a[id$$1] = val, _a)));
    }; }
};
var dynamicStructure = function (driver) { return function (_a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.add, add = _c === void 0 ? constant(false) : _c, _d = _b.remove, remove = _d === void 0 ? constant(false) : _d;
    return accumState(function (_a, val, time, event, emit) {
        var add = _a[0], remove = _a[1], acc = _a[2];
        var _b = add(val, time, event, emit), newAdd = _b[0], addTriggered = _b[1];
        var _c = remove(val, time, event, emit), newRemove = _c[0], removeTriggered = _c[1];
        var actions = [
            removeTriggered &&
                typeof removeTriggered.id !== 'undefined' &&
                driver.remove(removeTriggered.id),
            addTriggered && driver.add(addTriggered.id, val)
        ].filter(Boolean);
        var newAcc = actions.reduce(function (acc, fn$$1) { return fn$$1(acc); }, acc);
        return [[newAdd, newRemove, newAcc], newAcc];
    }, [add, remove, driver["new"]()]);
}; };
var dynamicArray = function (actions) {
    return dynamicStructure(arrayDriver)(actions);
};
var dynamicMap = function (actions) {
    return dynamicStructure(mapDriver)(actions);
};

var promise = function (func) {
    var ref = fn(function (val, time, event, emit) {
        func(val, time, event, emit)
            .then(emit({ type: 'promise-resolve', ref: ref }))["catch"](emit({ type: 'promise-error', ref: ref }));
    });
    return ref;
};

var ReactRunner = (function (_super) {
    __extends(ReactRunner, _super);
    function ReactRunner(props) {
        var _this = _super.call(this, props) || this;
        _this.strawUpdate = _this.strawUpdate.bind(_this);
        _this.strawExec = _this.strawExec.bind(_this);
        _this.emitEvent = _this.emitEvent.bind(_this);
        _this.state = {
            straw: _this.strawExec(_this.props.straw, 0, null),
            strategies: []
        };
        return _this;
    }
    ReactRunner.prototype.componentDidMount = function () {
        var _this = this;
        var strategies = this.props.options.updateStrategies.reduce(function (acc, strategy) { return acc.concat(strategy.mount(_this.strawUpdate)); }, []);
        var start = Date.now();
        this.setState(function (state) { return (__assign({}, state, { strategies: strategies, start: start })); });
    };
    ReactRunner.prototype.strawUpdate = function (event) {
        var _this = this;
        this.setState(function (state) { return (__assign({}, state, { straw: _this.strawExec(state.straw[0], Date.now() - state.start, event) })); });
    };
    ReactRunner.prototype.emitEvent = function (event) {
        var _this = this;
        return function (data) {
            if (data.persist)
                data.persist();
            _this.strawUpdate(__assign({}, event, { data: data }));
        };
    };
    ReactRunner.prototype.strawExec = function (straw, time, event) {
        if (this.props.options.verbose) {
            console.log(time, event);
        }
        return straw(null, time, event, this.emitEvent);
    };
    ReactRunner.prototype.render = function () {
        return this.state.straw[1];
    };
    ReactRunner.prototype.componentWillUnmount = function () {
        var _this = this;
        this.props.options.updateStrategies.forEach(function (strategy, index) {
            strategy.unmount(_this.state.strategies[index]);
        });
    };
    return ReactRunner;
}(React.Component));
var timeStrategy = function (time) { return ({
    mount: function (update) { return setInterval(update, time || 1000 / 60); },
    unmount: function (id$$1) { return clearInterval(id$$1); }
}); };
var animationFrameStrategy = function () { return ({
    mount: function (update) { return requestAnimationFrame(update); },
    unmount: function (id$$1) { return cancelAnimationFrame(id$$1); }
}); };
var listenOn = function (event, straw) {
    var events = [].concat(event);
    var ref = of(function (val, time, event, emit) {
        var newEvents = events.map(function (event) { return (__assign({}, event, { ref: event.ref || ref })); });
        var eventHandlers = events.reduce(function (acc, event) {
            var _a;
            var handlerName = 'on' + event.type[0].toUpperCase() + event.type.slice(1);
            return __assign({}, acc, (_a = {}, _a[handlerName] = emit(__assign({}, event, { ref: event.ref || ref })), _a));
        }, {});
        var _a = straw(val, time, event, emit), newStraw = _a[0], element = _a[1];
        return [
            listenOn(newEvents, newStraw),
            __assign({}, element, { props: __assign({}, element.props, eventHandlers) })
        ];
    });
    return ref;
};

exports.run = run;
exports.of = of;
exports.id = id;
exports.constant = constant;
exports.fn = fn;
exports.composeRight = composeRight;
exports.composeLeft = composeLeft;
exports.compose = compose;
exports.split = split;
exports.fanout = fanout;
exports.accumState = accumState;
exports.accum = accum;
exports.isStraw = isStraw;
exports.constantify = constantify;
exports.holdWhen = holdWhen;
exports.holdFirst = holdFirst;
exports.hold = hold;
exports.take = take;
exports.once = once;
exports.reduce = reduce;
exports.and = and;
exports.or = or;
exports.not = not;
exports.when = when;
exports.time = time;
exports.atTime = atTime;
exports.periodicTime = periodicTime;
exports.beforeTime = beforeTime;
exports.afterTime = afterTime;
exports.betweenTimes = betweenTimes;
exports.event = event;
exports.emit = emit;
exports.on = on;
exports.beforeEvent = beforeEvent;
exports.afterEvent = afterEvent;
exports.betweenEvents = betweenEvents;
exports.dynamicStructure = dynamicStructure;
exports.dynamicArray = dynamicArray;
exports.dynamicMap = dynamicMap;
exports.promise = promise;
exports.ReactRunner = ReactRunner;
exports.timeStrategy = timeStrategy;
exports.animationFrameStrategy = animationFrameStrategy;
exports.listenOn = listenOn;
