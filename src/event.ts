import { run, fn, and, accum, accum1, FEvent } from './core'
import test from './test' // {test}

/**
 * It's a `Straw` that returns always the event.
 *
 * @returns a tuple containing the `event` `Straw` and the event passed.
 */
export const event = fn((val?: any, time?: number, event?: FEvent) => event)
// {test
{
  const assert = test('event')
  assert.stringEqual(
    run(
      event,
      [1, 2, 3, 4],
      [0, 0, 0, 0],
      [null, null, { type: 'click', ref: 'button' }, null]
    ),
    [null, null, { type: 'click', ref: 'button' }, null]
  )
}
// test}

/**
 * It accepts an event `targetEvent` and returns a `Straw` that will emit it.
 *
 * @param targetEvent an event to emit
 * @returns a `Straw` that will emit `targetEvent`
 */
export const emit = (targetEvent: any) =>
  fn((val, time, event, emit) => emit(targetEvent)({}))

/**
 * It accepts an `event` and returns a `Straw` that will return that `event` when it happens.
 *
 * An optional `transformer` function can be passed to transform the `event` before consumption.
 *
 * @param {FEvent} event an event to look for
 * @param transformer function to be applied to event before return
 * @returns a `Straw` that will look for `event`
 */

export const on = (
  { type, ref, id }: FEvent,
  transformer: (FEvent) => any = val => val
) =>
  fn(
    (val, time, event) =>
      (event &&
        (!type || event.type === type) &&
        (!ref || event.ref === ref) &&
        (!id || event.id === id) &&
        transformer(event)) ||
      undefined
)

// {test
{
  const assert = test('on')
  const listener = on({ type: 'click', ref: 'button' })
  assert.stringEqual(
    run(
      listener,
      [1, 2, 3, 4],
      [0, 0, 0, 0],
      [null, null, { type: 'click', ref: 'button' }, null]
    ),
    [null, null, { type: 'click', ref: 'button' }, null]
  )
  const listenerWithId = on(
    { type: 'click', ref: 'button', id: 'magic' },
    Boolean
  )
  assert.stringEqual(
    run(
      listenerWithId,
      [1, 2, 3, 4],
      [0, 0, 0, 0],
      [
        null,
        { type: 'click', ref: 'button', id: 'muggle' },
        { type: 'click', ref: 'button', id: 'magic' },
        null
      ]
    ),
    [null, null, true, null]
  )
}
// test}


/**
 * It accepts an event `targetEvent` and returns a `Straw` that will return true until that event happens (inclusive of when `targetEvent` happens).
 *
 * @param targetEvent an event to wait for
 * @returns a `Straw` that will return true until that event happens
 */
export const beforeEvent = (targetEvent: FEvent) =>
  accum((acc, val, time, event, emit) => {
    const [, happened] = on(targetEvent, Boolean)(val, time, event, emit)
    return [!happened && acc, acc]
  }, true)
/**
 * It accepts an event `targetEvent` and returns a `Straw` that will return true only after that event happens (inclusive of when `targetEvent` happens).
 *
 * @param targetEvent an event to wait for
 * @returns a `Straw` that will return true only after that event happens
 */
export const afterEvent = (targetEvent: FEvent) =>
  accum1((acc, val, time, event, emit) => {
    const [, happened] = on(targetEvent, Boolean)(val, time, event, emit)
    return happened || acc
  }, false)
/**
 * It accepts two events `eventStart` and `eventEnd` and returns a `Straw` that will return true after `eventStart` and before `eventEnd` (inclusive of when the events happen).
 *
 * @param eventStart an event to mark the beginning of the interval
 * @param eventEnd an event to mark the end of the interval
 * @returns a `Straw` that will return true after `eventStart` and before `eventEnd`
 */
export const betweenEvents = (eventStart: FEvent, eventEnd: FEvent) =>
  and(afterEvent(eventStart), beforeEvent(eventEnd))

// {test
{
  const assert = test('beforeEvent, afterEvent, between')
  assert.stringEqual(
    run(
      beforeEvent({ type: 'stop', ref: 'magic' }),
      [0, 0, 0, 0, 0, 0],
      [],
      [
        null,
        { type: 'start', ref: 'magic' },
        null,
        { type: 'stop', ref: 'magic' },
        null,
        null
      ]
    ),
    [true, true, true, true, false, false]
  )
  assert.stringEqual(
    run(
      afterEvent({ type: 'start', ref: 'magic' }),
      [0, 0, 0, 0, 0, 0],
      [],
      [
        null,
        { type: 'start', ref: 'magic' },
        null,
        { type: 'stop', ref: 'magic' },
        null,
        null
      ]
    ),
    [false, true, true, true, true, true]
  )
  assert.stringEqual(
    run(
      betweenEvents(
        { type: 'start', ref: 'magic' },
        { type: 'stop', ref: 'magic' }
      ),
      [0, 0, 0, 0, 0, 0],
      [],
      [
        null,
        { type: 'start', ref: 'magic' },
        null,
        { type: 'stop', ref: 'magic' },
        null,
        null
      ]
    ),
    [false, true, true, true, false, false]
  )
}
// test}
