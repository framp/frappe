import { FEvent } from './core';
/**
 * It's a `Straw` that returns always the event.
 *
 * @returns a tuple containing the `event` `Straw` and the event passed.
 */
export declare const event: import("./core").Straw;
/**
 * It accepts an event `targetEvent` and returns a `Straw` that will emit it.
 *
 * @param targetEvent an event to emit
 * @returns a `Straw` that will emit `targetEvent`
 */
export declare const emit: (targetEvent: any) => import("./core").Straw;
/**
 * It accepts an `event` and returns a `Straw` that will return that `event` when it happens.
 *
 * An optional `transformer` function can be passed to transform the `event` before consumption.
 *
 * @param {FEvent} event an event to look for
 * @param transformer function to be applied to event before return
 * @returns a `Straw` that will look for `event`
 */
export declare const on: ({ type, ref, id }: FEvent, transformer?: (FEvent: any) => any) => import("./core").Straw;
/**
 * It accepts an event `targetEvent` and returns a `Straw` that will return true until that event happens (inclusive of when `targetEvent` happens).
 *
 * @param targetEvent an event to wait for
 * @returns a `Straw` that will return true until that event happens
 */
export declare const beforeEvent: (targetEvent: FEvent) => any;
/**
 * It accepts an event `targetEvent` and returns a `Straw` that will return true only after that event happens (inclusive of when `targetEvent` happens).
 *
 * @param targetEvent an event to wait for
 * @returns a `Straw` that will return true only after that event happens
 */
export declare const afterEvent: (targetEvent: FEvent) => any;
/**
 * It accepts two events `eventStart` and `eventEnd` and returns a `Straw` that will return true after `eventStart` and before `eventEnd` (inclusive of when the events happen).
 *
 * @param eventStart an event to mark the beginning of the interval
 * @param eventEnd an event to mark the end of the interval
 * @returns a `Straw` that will return true after `eventStart` and before `eventEnd`
 */
export declare const betweenEvents: (eventStart: FEvent, eventEnd: FEvent) => any;
