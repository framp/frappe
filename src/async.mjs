import test from "./test";
import { run, fn } from "./core";
export const promise = f => {
  const ref = fn((val, time, event, emit) => {
    f(val, time, event, emit)
      .then(emit("promise-resolve", { ref }))
      .catch(emit("promise-error", { ref }));
  });
  return ref;
};

{
  const assert = test("promise");
  const delay = t =>
    promise(v => new Promise(res => setTimeout(() => res(v), t)));
  const emitSpy = (type, opts) => {
    assert(["promise-resolve", "promise-error"].includes(type));
    assert.stringEqual(opts, {});
    return event => assert([1, 2, 3, 42].includes(event));
  };
  assert.stringEqual(
    run(delay(5), [1, 2, 3, 42], [], [], [emitSpy, emitSpy, emitSpy, emitSpy]),
    [null, null, null, null]
  );
}
