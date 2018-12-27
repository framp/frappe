import test from "./test";
import { run, fn, accum, and } from "./core";

export const time = fn((val, time) => time);
{
  const assert = test("time");
  assert.stringEqual(run(time, [1, 2, 3, 4], [3, 5, 6, 10]), [3, 5, 6, 10]);
}

export const atTime = (target, margin = 0) =>
  fn((val, time) =>
    Boolean(time - margin <= target && time + margin >= target)
  );
export const periodicTime = period =>
  accum((acc, val, time) => {
    const newAcc = acc === null ? time : acc;
    return [newAcc, parseInt(time / period) % 2 === 0];
  }, null);
export const beforeTime = target =>
  accum((acc, val, time) => {
    const newAcc = acc === null ? time : acc;
    return [newAcc, time - newAcc <= target];
  }, null);
export const afterTime = target =>
  accum((acc, val, time) => {
    const newAcc = acc === null ? time : acc;
    return [newAcc, time - newAcc >= target];
  }, null);
export const betweenTimes = (start, end) =>
  and(beforeTime(end), afterTime(start));

{
  const assert = test(
    "atTime, periodicTime, beforeTime, afterTime, betweenTimes"
  );
  assert.stringEqual(
    run(atTime(100), [0, 0, 0, 0, 0, 0], [0, 1, 50, 100, 150, 200]),
    [false, false, false, true, false, false]
  );
  assert.stringEqual(
    run(atTime(90, 20), [0, 0, 0, 0, 0, 0], [0, 1, 50, 100, 150, 200]),
    [false, false, false, true, false, false]
  );
  assert.stringEqual(
    run(atTime(100, 100), [0, 0, 0, 0, 0, 0], [0, 1, 50, 100, 150, 200]),
    [true, true, true, true, true, true]
  );
  assert.stringEqual(
    run(
      periodicTime(25),
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 22, 25, 27, 50, 66, 75, 88, 100, 104]
    ),
    [true, true, false, false, true, true, false, false, true, true]
  );
  assert.stringEqual(
    run(beforeTime(100), [0, 0, 0, 0, 0, 0], [0, 1, 50, 100, 150, 200]),
    [true, true, true, true, false, false]
  );
  assert.stringEqual(run(beforeTime(100), [0, 0, 0, 0], [100, 150, 200, 205]), [
    true,
    true,
    true,
    false
  ]);
  assert.stringEqual(
    run(afterTime(100), [0, 0, 0, 0, 0, 0], [0, 1, 50, 100, 150, 200]),
    [false, false, false, true, true, true]
  );
  assert.stringEqual(run(afterTime(100), [0, 0, 0, 0], [100, 150, 200, 205]), [
    false,
    false,
    true,
    true
  ]);
  assert.stringEqual(
    run(
      betweenTimes(100, 200),
      [0, 0, 0, 0, 0, 0, 0],
      [0, 1, 50, 100, 150, 200, 205]
    ),
    [false, false, false, true, true, true, false]
  );
}
