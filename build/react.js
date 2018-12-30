"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var react_1 = __importDefault(require("react"));
var core_1 = require("./core");
/**
 * It's a React component that will execute a `Straw` and render it.
 *
 * It will re-render every time there is a new event being triggered or whenever an update strategy fires.
 *
 */
var ReactRunner = /** @class */ (function (_super) {
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
}(react_1["default"].Component));
exports.ReactRunner = ReactRunner;
exports.timeStrategy = function (time) { return ({
    mount: function (update) { return setInterval(update, time || 1000 / 60); },
    unmount: function (id) { return clearInterval(id); }
}); };
exports.animationFrameStrategy = function () { return ({
    mount: function (update) { return requestAnimationFrame(update); },
    unmount: function (id) { return cancelAnimationFrame(id); }
}); };
/**
 * It accepts an `event` (or array of `events`) and a `Straw` returning a React element and return a `Straw` which returns the React element extended with the needed event listeners, setup using the `type` property of the `event`.
 *
 * The events will be plugged via `ReactRunner` into the application and will be available to all the `Straws`.
 *
 * @param event an event (or array of `event`) to listen for
 * @param straw a Straw returning a React element to extend with the listeners from `event`
 * @returns a `Straw` returning the React element from `straw` with the event listeners from event
 */
exports.listenOn = function (event, straw) {
    var events = [].concat(event);
    var ref = core_1.of(function (val, time, event, emit) {
        var newEvents = events.map(function (event) { return (__assign({}, event, { ref: event.ref || ref })); });
        var eventHandlers = events.reduce(function (acc, event) {
            var _a;
            var handlerName = 'on' + event.type[0].toUpperCase() + event.type.slice(1);
            return __assign({}, acc, (_a = {}, _a[handlerName] = emit(__assign({}, event, { ref: event.ref || ref })), _a));
        }, {});
        var _a = straw(val, time, event, emit), newStraw = _a[0], element = _a[1];
        return [
            exports.listenOn(newEvents, newStraw),
            __assign({}, element, { props: __assign({}, element.props, eventHandlers) })
        ];
    });
    return ref;
};
