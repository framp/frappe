import test from "./test";
import {
  run,
  fn,
  and,
  accum,
  accum1,
  Straw,
  Event,
  EventType,
  EventRef
} from "./core";
import { any } from "prop-types";

export const event = fn((val, time, event) => event);
{
  const assert = test("event");
  assert.stringEqual(
    run(
      event,
      [1, 2, 3, 4],
      [0, 0, 0, 0],
      [null, null, { type: "click", ref: "button" }, null]
    ),
    [null, null, { type: "click", ref: "button" }, null]
  );
}

export const emit = (type: EventType, event: any, opts: EventRef) =>
  fn((val, time, event1, emit) => emit(type, opts)(event));

export const on = (
  type: EventType,
  ref: EventRef | any,
  transformer: (Event) => any = val => val
) =>
  fn(
    (val, time, event) =>
      (event &&
        event.type === type &&
        (!ref ||
          (ref && typeof ref.ref !== "undefined"
            ? event.ref === ref.ref && (!ref.id || ref.id === event.id)
            : event.ref === ref)) &&
        transformer(event)) ||
      undefined
  );

{
  const assert = test("on");
  const listener = on("click", "button");
  assert.stringEqual(
    run(
      listener,
      [1, 2, 3, 4],
      [0, 0, 0, 0],
      [null, null, { type: "click", ref: "button" }, null]
    ),
    [null, null, { type: "click", ref: "button" }, null]
  );
  const listenerWithId = on("click", { ref: "button", id: "magic" }, Boolean);
  assert.stringEqual(
    run(
      listenerWithId,
      [1, 2, 3, 4],
      [0, 0, 0, 0],
      [
        null,
        { type: "click", ref: "button", id: "muggle" },
        { type: "click", ref: "button", id: "magic" },
        null
      ]
    ),
    [null, null, true, null]
  );
}

export const beforeEvent = (type: EventType, ref: EventRef | any) =>
  accum((acc, val, time, event, emit) => {
    const [_, happened] = on(type, ref, Boolean)(val, time, event, emit);
    return [!happened && acc, acc];
  }, true);
export const afterEvent = (type: EventType, ref: EventRef | any) =>
  accum1((acc, val, time, event, emit) => {
    const [_, happened] = on(type, ref, Boolean)(val, time, event, emit);
    return happened || acc;
  }, false);
export const betweenEvents = (
  type1: EventType,
  ref1: EventRef | any,
  type2: EventType,
  ref2: EventRef | any
) => and(afterEvent(type1, ref1), beforeEvent(type2, ref2));

{
  const assert = test("beforeEvent, afterEvent, between");
  assert.stringEqual(
    run(
      beforeEvent("stop", "magic"),
      [0, 0, 0, 0, 0, 0],
      [],
      [
        null,
        { type: "start", ref: "magic" },
        null,
        { type: "stop", ref: "magic" },
        null,
        null
      ]
    ),
    [true, true, true, true, false, false]
  );
  assert.stringEqual(
    run(
      afterEvent("start", "magic"),
      [0, 0, 0, 0, 0, 0],
      [],
      [
        null,
        { type: "start", ref: "magic" },
        null,
        { type: "stop", ref: "magic" },
        null,
        null
      ]
    ),
    [false, true, true, true, true, true]
  );
  assert.stringEqual(
    run(
      betweenEvents("start", "magic", "stop", "magic"),
      [0, 0, 0, 0, 0, 0],
      [],
      [
        null,
        { type: "start", ref: "magic" },
        null,
        { type: "stop", ref: "magic" },
        null,
        null
      ]
    ),
    [false, true, true, true, false, false]
  );
}
