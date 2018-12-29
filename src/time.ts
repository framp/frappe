import test from './test'
import { run, fn, accum, and } from './core'

/**
 * It's a `Straw` that returns always the time.
 *
 * @returns a tuple containing the `time` `Straw` and the `time` passed.
 */
export const time = fn((val, time) => time)
{
  const assert = test('time')
  assert.stringEqual(run(time, [1, 2, 3, 4], [3, 5, 6, 10]), [3, 5, 6, 10])
}

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
export const atTime = (targetTime: number, margin: number = 0) =>
  fn((val, time) =>
    Boolean(time - margin <= targetTime && time + margin >= targetTime)
)
/**
 * It accepts a `period` and returns a `Straw` that will alternate returning true or false for `period`.
 *
 * @param period the length in time to use for the interval
 * @returns a `Straw` that will return true or false for `period`
 */
export const periodicTime = (period: number) =>
  accum((acc, val, time) => {
    const newAcc = acc === null ? time : acc
    return [newAcc, Math.floor(time / period) % 2 === 0]
  }, null)
/**
 * It accepts a `targetTime` time and returns a `Straw` that will return true until `targetTime` time (inclusive of `targetTime`) startTimeing from when the Straw has been executed first.
 *
 * @param targetTime a time to wait for
 * @returns a `Straw` that will return true until `targetTime`
 */
export const beforeTime = (targetTime: number) =>
  accum((acc, val, time) => {
    const newAcc = acc === null ? time : acc
    return [newAcc, time - newAcc <= targetTime]
  }, null)
/**
 * It accepts a `targetTime` time and returns a `Straw` that will return true only after `targetTime` time (inclusive of `targetTime`) startTimeing from when the Straw has been executed first.
 *
 * @param targetTime a time to wait for
 * @returns a `Straw` that will return true until `targetTime`
 */
export const afterTime = (targetTime: number) =>
  accum((acc, val, time) => {
    const newAcc = acc === null ? time : acc
    return [newAcc, time - newAcc >= targetTime]
  }, null)
/**
 * It accepts two times `startTime` and `endTime` and returns a `Straw` that will return true after `startTime` and before `endTime` (inclusive of when the events happen).
 *
 * @param startTime a time to mark the beginning of the interval
 * @param endTime a time to mark the endTime of the interval
 * @returns a `Straw` that will return true after `startTime` and before `endTime`
 */
export const betweenTimes = (startTime: number, endTime: number) =>
  and(beforeTime(endTime), afterTime(startTime))

{
  const assert = test(
    'atTime, periodicTime, beforeTime, afterTime, betweenTimes'
  )
  assert.stringEqual(
    run(atTime(100), [0, 0, 0, 0, 0, 0], [0, 1, 50, 100, 150, 200]),
    [false, false, false, true, false, false]
  )
  assert.stringEqual(
    run(atTime(90, 20), [0, 0, 0, 0, 0, 0], [0, 1, 50, 100, 150, 200]),
    [false, false, false, true, false, false]
  )
  assert.stringEqual(
    run(atTime(100, 100), [0, 0, 0, 0, 0, 0], [0, 1, 50, 100, 150, 200]),
    [true, true, true, true, true, true]
  )
  assert.stringEqual(
    run(
      periodicTime(25),
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 22, 25, 27, 50, 66, 75, 88, 100, 104]
    ),
    [true, true, false, false, true, true, false, false, true, true]
  )
  assert.stringEqual(
    run(beforeTime(100), [0, 0, 0, 0, 0, 0], [0, 1, 50, 100, 150, 200]),
    [true, true, true, true, false, false]
  )
  assert.stringEqual(run(beforeTime(100), [0, 0, 0, 0], [100, 150, 200, 205]), [
    true,
    true,
    true,
    false
  ])
  assert.stringEqual(
    run(afterTime(100), [0, 0, 0, 0, 0, 0], [0, 1, 50, 100, 150, 200]),
    [false, false, false, true, true, true]
  )
  assert.stringEqual(run(afterTime(100), [0, 0, 0, 0], [100, 150, 200, 205]), [
    false,
    false,
    true,
    true
  ])
  assert.stringEqual(
    run(
      betweenTimes(100, 200),
      [0, 0, 0, 0, 0, 0, 0],
      [0, 1, 50, 100, 150, 200, 205]
    ),
    [false, false, false, true, true, true, false]
  )
}
