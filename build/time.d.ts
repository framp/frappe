/**
 * It's a `Straw` that returns always the time.
 *
 * @returns a tuple containing the `time` `Straw` and the `time` passed.
 */
export declare const time: import("./core").Straw;
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
export declare const atTime: (targetTime: number, margin?: number) => import("./core").Straw;
/**
 * It accepts a `period` and returns a `Straw` that will alternate returning true or false for `period`.
 *
 * @param period the length in time to use for the interval
 * @returns a `Straw` that will return true or false for `period`
 */
export declare const periodicTime: (period: number) => any;
/**
 * It accepts a `targetTime` time and returns a `Straw` that will return true until `targetTime` time (inclusive of `targetTime`) startTimeing from when the Straw has been executed first.
 *
 * @param targetTime a time to wait for
 * @returns a `Straw` that will return true until `targetTime`
 */
export declare const beforeTime: (targetTime: number) => any;
/**
 * It accepts a `targetTime` time and returns a `Straw` that will return true only after `targetTime` time (inclusive of `targetTime`) startTimeing from when the Straw has been executed first.
 *
 * @param targetTime a time to wait for
 * @returns a `Straw` that will return true until `targetTime`
 */
export declare const afterTime: (targetTime: number) => any;
/**
 * It accepts two times `startTime` and `endTime` and returns a `Straw` that will return true after `startTime` and before `endTime` (inclusive of when the events happen).
 *
 * @param startTime a time to mark the beginning of the interval
 * @param endTime a time to mark the endTime of the interval
 * @returns a `Straw` that will return true after `startTime` and before `endTime`
 */
export declare const betweenTimes: (startTime: number, endTime: number) => any;
