export interface FEvent {
    type?: any;
    ref?: any;
    id?: any;
    data?: any;
}
export interface EmitEvent {
    (FEvent: any): (event: any) => void;
}
export interface Straw {
    (val?: any, time?: number, event?: FEvent, emit?: EmitEvent): [Straw, any];
    __type: 'Straw';
}
/**
 * It accepts a function `func` and return a `Straw`.
 *
 * `func` will accept 4 parameters `val`, `time`, `event`, `emit` and returns a tuple `[nextFunc, result]`.
 *
 * `nextFunc` can be used to change the behaviour of `func` at the next execution of the `Straw`, `result` will be the output of the `Straw` at the current run.
 *
 * Given a function behaves naturally like a Straw, the only thing `of` is doing is adding a `__type: 'Straw'` to the function for identification purposes (eg: `isStraw`).
 *
 * @param func a function to make into a `Straw`
 * @returns a `Straw` made from `func`
 */
export declare const of: (func: (val?: any, time?: number, event?: FEvent, emit?: EmitEvent) => [Straw, any]) => Straw;
/**
 * It runs a `Straw`, simulating a set of inputs, times, events, emit functions and collect the results in an array.
 *
 * Great for testing straws.
 *
 * `inputs` will be used as a source of truth to count how many times the `Straw` will be run.
 *
 * @param straw a `Straw` to run
 * @param inputs the inputs to run the straw on
 * @param times the times to use for every input being sent
 * @param events the events to use for every input being sent
 * @param emits the emit functions to use for every input being sent
 * @returns an array of values resulting from all the executions of `straw`
 */
export declare const run: (straw: Straw, inputs: any[], times?: number[], events?: FEvent[], emits?: EmitEvent[]) => any[];
/**
 * It's a `Straw` that returns always the value.
 *
 * @returns a tuple containing the `id` `Straw` and the value passed.
 */
export declare const id: Straw;
/**
 * It accepts a value `val` and return a `Straw` that will always return that `val`.
 *
 * @param val a value to use
 * @returns a `Straw` that will always return `val`
 */
export declare const constant: (val: any) => Straw;
/**
 * It accepts a function `func` and return a `Straw` that will execute `func` .
 *
 * `func` will accept 4 parameters `val`, `time`, `event`, `emit` and returns just the result (unlike `of`).
 *
 * If you want to change how the `Straw` behaves in the next executions you should use `of`.
 *
 * @param func a function to make into a `Straw`
 * @returns a `Straw` that will call `func` at every run
 */
export declare const fn: (func: (val?: any, time?: number, event?: FEvent, emit?: EmitEvent) => any) => Straw;
/**
 * It composes a number of `Straws` together right to left.
 *
 * The first `val` is fed into the rightward `Straw`, the result of which get fed into the next `Straw`.
 *
 * The same action is repeated until all the `Straws` are processed.
 *
 * The same `time`, `event`, `emit` are passed to all the `Straws`.
 *
 * @param straws the `Straws` that will be composed together
 * @returns a `Straw` that will execute all the `straws`
 */
export declare const composeRight: (...straws: any[]) => any;
/**
 * It composes a number of `Straws` together left to right.
 *
 * The first `val` is fed into the leftward `Straw`, the result of which get fed into the next `Straw`.
 *
 * The same action is repeated until all the `Straws` are processed.
 *
 * The same `time`, `event`, `emit` are passed to all the `Straws`.
 *
 * @param straws the `Straws` that will be composed together
 * @returns a `Straw` that will execute all the `straws`
 */
export declare const composeLeft: (...straws: any[]) => any;
/**
 * It composes a number of `Straws` together right to left.
 *
 * The first `val` is fed into the rightward `Straw`, the result of which get fed into the next `Straw`.
 *
 * The same action is repeated until all the `Straws` are processed.
 *
 * The same `time`, `event`, `emit` are passed to all the `Straws`.
 *
 * @param straws the `Straws` that will be composed together
 * @returns a `Straw` that will execute all the `straws`
 */
export declare const compose: (...straws: any[]) => any;
/**
 * It accepts N `straws` and returns a `Straw` that accepts an array `vals` of N values.
 *
 * The resulting `Straw` will run each of the `Straws` using a single value from `vals`, taken by index.
 *
 * The same `time`, `event`, `emit` are passed to all the `Straws`.
 *
 * @param straws the `Straws` that will be used
 * @returns a `Straw` that accepts `vals` and that will execute all the `straws`
 */
export declare const split: (...straws: Straw[]) => any;
/**
 * It accepts N `straws` and returns a `Straw` that will accept a single value `val`.
 *
 * The resulting `Straw` will run each of the `Straws` using `val`.
 *
 * The same `time`, `event`, `emit` are passed to all the `Straws`.
 *
 * @param straws the `Straws` that will be used
 * @returns a `Straw` that accepts `val` and that will execute all the `straws`
 */
export declare const fanout: (...straws: Straw[]) => any;
export interface AccumFn {
    (acc: any, val: any, time: number, event: FEvent, emit: EmitEvent): [any, any];
}
/**
 * It creates a `Straw` that will keep state, given a function `func` and an initial state `acc`.
 *
 * Similarly to a reducer, `func` accepts `acc`, `val`, `time`, `event`, `emit` and returns a tuple `[newAcc, output]`.
 *
 * `newAcc` will be used as the `acc` in the next execution of the `Straw`, while `output` will be returned in the current execution.
 *
 * @param func the reducer function `func`
 * @param acc the initial state
 * @returns a `Straw` that uses `func` to store state
 */
export declare const accum: (func: AccumFn, acc: any) => any;
export interface Accum1Fn {
    (acc: any, val: any, time: number, event: FEvent, emit: EmitEvent): any;
}
/**
 * It creates a `Straw` that will keep state, given a function `func` and an initial state `acc`.
 *
 * Similarly to a reducer, `func` accepts `acc`, `val`, `time`, `event`, `emit` and returns a single value that will be returned in the current execution and used as `acc` in the next execution of the `Straw`.
 *
 * If you want your internal state to be different from what it's being returned, see `accum`.
 *
 * @param func the reducer function
 * @param acc the initial state
 * @returns a `Straw` that uses `func` to store state
 */
export declare const accum1: (func: Accum1Fn, acc: any) => any;
/**
 * It accepts a value `val` and return a boolean indicating whether `val` is a `Straw` or not.
 *
 * @param val a value to check
 * @returns a boolean to indicate if `val` is a `Straw`
 */
export declare const isStraw: (val: any) => boolean;
/**
 * It accepts a value `val` and return `val`, if it's a `Straw`, or the `Straw` `constant(val)`.
 *
 * @param val a value to use
 * @returns a `Straw`, either `val` or `constant(val)`
 */
export declare const constantify: (val: any) => Straw;
export interface HoldConditionFn {
    (acc: any, val: any, time: number, event: FEvent, emit: EmitEvent): boolean;
}
/**
 * It creates a `Straw` that holds a value across executions of a `Straw` when a `condition` predicate matches.
 *
 * `condition` accepts the current value `acc` being hold (if present), `val`, `time`, `event`, `emit`.
 *
 * Based on the output of `condition` the current value `acc` will be kept or it will be swapped with `val`.
 *
 * @param condition a function to check if the current execution
 * @param straw the straw to run through
 * @returns a holding values `Straw`
 */
export declare const holdWhen: (condition: HoldConditionFn, straw: Straw) => any;
/**
 * It creates a `Straw` that holds the first value returned by `straw` for all the executions.
 *
 * @param straw the straw to run through
 * @returns a holding values `Straw`
 */
export declare const holdFirst: (straw: Straw) => any;
/**
 * It creates a `Straw` that holds all the truthy values returned by `straw` for all the executions.
 *
 * @param straw the straw to run through
 * @returns a holding values `Straw`
 */
export declare const hold: (straw: Straw) => any;
/**
 * It creates a `Straw` that invokes the given `straw` at most `n` times.
 *
 * @param n the number of executions that will invoke `straw`
 * @param straw the straw to run through
 * @returns a `Straw` that will return values for at most `n` executions
 */
export declare const take: (n: number, straw: Straw) => any;
/**
 * It creates a `Straw` that invokes the given `straw` only once.
 *
 * @param straw the straw to run through
 * @returns a `Straw` that will return only the first value
 */
export declare const once: (straw: Straw) => any;
export interface ReduceFn {
    (acc: any, straw: Straw, val: any, time: number, event: FEvent, emit: EmitEvent): [Straw, any];
}
/**
 * It creates a `Straw` that returns a reduce of all the given `straws` starting from an initial value `acc`.
 *
 * The reducer `func` accepts `acc`, the current `straw`, `val`, `time`, `event`, `emit` and it's responsible for running each `straw` and return a new (or the same) `straw` for the next execution.
 *
 * The `and` and `or` functions are implemented with `reduce`.
 *
 * @param func the reducer function
 * @param acc the initial state
 * @returns a `Straw` that will reduce all the `straws`
 */
export declare const reduce: (func: ReduceFn, acc: any, straws: Straw[]) => any;
/**
 * It creates a `Straw` from a number of `Straws` which return a boolean to indicate if all the `Straws` outputs are truthy.
 *
 * The equivalent of the `&&` operator for `Straws`.
 *
 * @param straws the `Straws` to evaluate
 * @returns a `Straw` that will return the desired boolean
 */
export declare const and: (...straws: Straw[]) => any;
/**
 * It creates a `Straw` from a number of `Straws` which return a boolean to indicate if at least one of the `Straws` outputs is truthy.
 *
 * The equivalent of the `||` operator for `Straws`.
 *
 * @param straws the `Straws` to evaluate
 * @returns a `Straw` that will return the desired boolean
 */
export declare const or: (...straws: Straw[]) => any;
/**
 * It creates a `Straw` from a single `Straws` which return a boolean to indicate if the `Straw` output is falsy.
 *
 * The equivalent of the `!` operator for `Straws`.
 *
 * @param straw the `Straw` to evaluate
 * @returns a `Straw` that will return the desired boolean
 */
export declare const not: (straw: Straw) => any;
/**
 * It creates a `Straw` from a number of `Straws`, paired up in `conditions`, `effects`.
 *
 * All the `Straws` with a even index will be assumed to be conditions, all the `Straws` with an odd index will be assumed to be the `Straws` to be executed.
 *
 * `when` will go through each `condition` in order; as soon as a condition with a truthy value is found the respective `effect` will be executed and returned.
 *
 * Unevaluated `conditions` and unevaluated `effects` won't be executed.
 *
 * @param straws the `Straws` paired up in `conditions` and `effects`
 * @returns a `Straw` that will return the first `effect` found with a `truthy` condition
 */
export declare const when: (...args: Straw[]) => any;
