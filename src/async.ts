import { run, fn, FEvent, EmitEvent } from './core'
import test from './test' // {test}

interface PromiseFn {
  (val: any, time: number, event: FEvent, emit: EmitEvent): Promise<any>
}

/**
 * It accepts a promise returning function `func` and return a `Straw` that will execute `func` and fire a `promise-resolve` event on success or a `promise-error` event on failure.
 * The emitted event will use the returned `Straw` as a ref.
 * @param func promise returning function
 * @returns Straw that will call `func` when run
 */
export const promise = (func: PromiseFn) => {
  const ref = fn((val, time, event, emit) => {
    func(val, time, event, emit)
      .then(emit({ type: 'promise-resolve', ref }))
      .catch(emit({ type: 'promise-error', ref }))
  })
  return ref
}
// {test
{
  const assert = test('promise')
  const delay = t =>
    promise(v => new Promise(resolve => setTimeout(() => resolve(v), t)))
  const emitSpy = ({ type }: FEvent) => {
    assert(['promise-resolve', 'promise-error'].includes(type))
    return event => assert([1, 2, 3, 42].includes(event))
  }
  assert.stringEqual(
    run(delay(5), [1, 2, 3, 42], [], [], [emitSpy, emitSpy, emitSpy, emitSpy]),
    [null, null, null, null]
  )
}
// test}