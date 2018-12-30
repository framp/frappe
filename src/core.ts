import test from './test' // <test>

const STRAW_KEY = '__type'
const STRAW_VALUE = 'Straw'

export interface FEvent {
  type?: any
  ref?: any
  id?: any
  data?: any
}
export interface EmitEvent {
  (FEvent): (event: any) => void
}

export interface Straw {
  (val?: any, time?: number, event?: FEvent, emit?: EmitEvent): [Straw, any]
  __type: 'Straw'
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
export const of = (
  func: (
    val?: any,
    time?: number,
    event?: FEvent,
    emit?: EmitEvent
  ) => [Straw, any]
): Straw => {
  func[STRAW_KEY] = STRAW_VALUE
  return func as Straw
}

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
export const run = (
  straw: Straw,
  inputs: Array<any>,
  times: Array<number> = [],
  events: Array<FEvent> = [],
  emits: Array<EmitEvent> = []
): Array<any> =>
  inputs.reduce(
    ([straw, outputs], input, index) => {
      const [newStraw, output] = straw(
        input,
        times[index],
        events[index],
        emits[index]
      )
      return [newStraw, outputs.concat([output])]
    },
    [straw, []]
  )[1]

// <test
{
  const assert = test('run')
  const aStraw = of(a => [aStraw, a * 2])
  assert.stringEqual(run(aStraw, [1, 2, 3, 4]), [2, 4, 6, 8])
}
// test>

/**
 * It's a `Straw` that returns always the value.
 *
 * @returns a tuple containing the `id` `Straw` and the value passed.
 */
export const id = of(val => [id, val])
// <test
{
  const assert = test('id')
  assert.stringEqual(id.__type, STRAW_VALUE)
  assert.stringEqual(run(id, [1, 2, 3, 4]), [1, 2, 3, 4])
}
// test>

/**
 * It accepts a value `val` and return a `Straw` that will always return that `val`.
 *
 * @param val a value to use
 * @returns a `Straw` that will always return `val`
 */
export const constant = (val): Straw => of(a => [constant(val), val])
// <test
{
  const assert = test('constant')
  assert.stringEqual(run(constant(42), [1, 2, 3, 4]), [42, 42, 42, 42])
}
// test>

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
export const fn = (
  func: (val?: any, time?: number, event?: FEvent, emit?: EmitEvent) => any
): Straw =>
  of((val, time, event, emit) => [fn(func), func(val, time, event, emit)])
// <test
{
  const assert = test('fn')
  const dfn = fn(a => a * 2)
  assert.stringEqual(run(dfn, [1, 2, 3, 4]), [2, 4, 6, 8])
}
// test>

const composeFrom = (reduce: string, ...straws: Array<Straw>) =>
  of((val, time, event, emit) => {
    const [newStraws, out] = straws[reduce](
      (res, f) => {
        const [straw, out] = f(res[1], time, event, emit)
        return [[straw].concat(res[0]), out]
      },
      [[], val]
    )
    return [composeFrom(reduce, ...newStraws), out]
  })
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
export const composeRight = (...straws) => composeFrom('reduceRight', ...straws)
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
export const composeLeft = (...straws) => composeFrom('reduce', ...straws)
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
export const compose = (...straws) => composeFrom('reduceRight', ...straws)

// <test
{
  const assert = test('compose')
  const bStraw = of(a => [bStraw, a * 3])
  const cStraw = of(a => [cStraw, a * 2])
  assert.stringEqual(
    run(
      compose(
        bStraw,
        cStraw
      ),
      [1, 2, 3, 4]
    ),
    [6, 12, 18, 24]
  )
  assert.stringEqual(
    run(
      compose(
        cStraw,
        bStraw,
        cStraw
      ),
      [1, 2, 3, 4]
    ),
    [12, 24, 36, 48]
  )
  assert.stringEqual(
    run(
      compose(
        compose(
          bStraw,
          cStraw
        ),
        bStraw
      ),
      [1, 2, 3, 4]
    ),
    [18, 36, 54, 72]
  )
}
// test>

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
export const split = (...straws: Array<Straw>) =>
  of((vals, time, event, emit) => {
    const results = vals.map((v, i) => straws[i](v, time, event, emit))
    const newStraws = results.map(([a]) => a)
    const newVals = results.map(([_, a]) => a)
    return [split(...newStraws), newVals]
  })

// <test
{
  const assert = test('split')
  const fStraw = of(a => [fStraw, a * 2])
  const gStraw = of(a => [gStraw, a * 3])
  const hStraw = of(([a, b]) => [hStraw, [a + 1, b - 1]])
  assert.stringEqual(split(fStraw, gStraw)([2, 2])[1], [4, 6])
  assert.stringEqual(split(fStraw, gStraw, gStraw)([2, 2, 2])[1], [4, 6, 6])
  assert.stringEqual(
    run(split(fStraw, gStraw), [[1, 1], [2, 2], [3, 3], [4, 4]]),
    [[2, 3], [4, 6], [6, 9], [8, 12]]
  )
  assert.stringEqual(
    run(
      compose(
        hStraw,
        split(fStraw, gStraw)
      ),
      [[1, 1], [2, 2], [3, 3], [4, 4]]
    ),
    [[3, 2], [5, 5], [7, 8], [9, 11]]
  )
}
// test>

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
export const fanout = (...straws: Array<Straw>) =>
  compose(
    split(...straws),
    fn(val => straws.map(() => val))
)

// <test
{
  const assert = test('Test: fanout')
  const iStraw = of(a => [iStraw, a * 2])
  const jStraw = of(a => [jStraw, a * 3])
  const kStraw = of(a => [kStraw, a * 4])
  assert.stringEqual(fanout(iStraw, jStraw)(2)[1], [4, 6])
  assert.stringEqual(fanout(iStraw, jStraw)(2)[1], [4, 6])
  assert.stringEqual(fanout(iStraw, jStraw, kStraw)(2)[1], [4, 6, 8])
}
// test>

export interface AccumStateFn {
  (acc: any, val: any, time: number, event: FEvent, emit: EmitEvent): [any, any]
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
export const accumState = (func: AccumStateFn, acc: any) =>
  of((val, time, event, emit) => {
    const [newAcc, output] = func(acc, val, time, event, emit)
    return [accumState(func, newAcc), output]
  })

export interface AccumFn {
  (acc: any, val: any, time: number, event: FEvent, emit: EmitEvent): any
}

/**
 * It creates a `Straw` that will keep state, given a function `func` and an initial state `acc`.
 *
 * Similarly to a reducer, `func` accepts `acc`, `val`, `time`, `event`, `emit` and returns a single value that will be returned in the current execution and used as `acc` in the next execution of the `Straw`.
 *
 * If you want your internal state to be different from what it's being returned, see `accumState`.
 *
 * @param func the reducer function
 * @param acc the initial state
 * @returns a `Straw` that uses `func` to store state
 */
export const accum = (func: AccumFn, acc: any) =>
  accumState((acc, val, time, event, emit) => {
    const newVal = func(acc, val, time, event, emit)
    return [newVal, newVal]
  }, acc)

// <test
{
  const assert = test('accumState, accum')
  const impoliteSumCounter = accumState(
    ([a, c], b) => [
      [a + b, c + 1],
      a < 10 ? 'Back off ' + (c + 2) + ' times!' : a + b
    ],
    [0, 0]
  )
  assert.stringEqual(run(impoliteSumCounter, [3, 1, 4, 5, 14, 2]), [
    'Back off 2 times!',
    'Back off 3 times!',
    'Back off 4 times!',
    'Back off 5 times!',
    27,
    29
  ])
  const sum = accum((a, b) => a + b, 0)
  assert.stringEqual(run(sum, [3, 5, 9, 0, 14, 2]), [3, 8, 17, 17, 31, 33])
}
// test>

/**
 * It accepts a value `val` and return a boolean indicating whether `val` is a `Straw` or not.
 *
 * @param val a value to check
 * @returns a boolean to indicate if `val` is a `Straw`
 */
export const isStraw = (val: any) =>
  typeof val === 'function' && val[STRAW_KEY] === STRAW_VALUE
/**
 * It accepts a value `val` and return `val`, if it's a `Straw`, or the `Straw` `constant(val)`.
 *
 * @param val a value to use
 * @returns a `Straw`, either `val` or `constant(val)`
 */
export const constantify = (val: any): Straw =>
  isStraw(val) ? val : constant(val)

export interface HoldConditionFn {
  (acc: any, val: any, time: number, event: FEvent, emit: EmitEvent): boolean
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
export const holdWhen = (condition: HoldConditionFn, straw: Straw) =>
  accumState(
    ([straw, acc], val, time, event, emit) => {
      const [newStraw, result] = straw(val, time, event, emit)
      return condition(acc, result, time, event, emit)
        ? [[newStraw, result], result]
        : [[newStraw, acc], acc]
    },
    [straw]
)
/**
 * It creates a `Straw` that holds the first value returned by `straw` for all the executions.
 *
 * @param straw the straw to run through
 * @returns a holding values `Straw`
 */
export const holdFirst = (straw: Straw) => holdWhen((acc, val) => !acc, straw)
/**
 * It creates a `Straw` that holds all the truthy values returned by `straw` for all the executions.
 *
 * @param straw the straw to run through
 * @returns a holding values `Straw`
 */
export const hold = (straw: Straw) => holdWhen((acc, val) => val, straw)

// <test
{
  const assert = test('hold')
  assert.stringEqual(
    run(holdWhen((acc, val) => val % 2 === 0, id), [
      null,
      1,
      null,
      2,
      3,
      4,
      5,
      6
    ]),
    [null, null, null, 2, 2, 4, 4, 6]
  )
  assert.stringEqual(
    run(holdFirst(id), [null, 1, null, 3, null, null, null, 5, 6]),
    [null, 1, 1, 1, 1, 1, 1, 1, 1]
  )
  assert.stringEqual(
    run(hold(id), [null, 1, null, 3, null, null, null, 5, 6]),
    [null, 1, 1, 3, 3, 3, 3, 5, 6]
  )
}
// test>

/**
 * It creates a `Straw` that invokes the given `straw` at most `n` times.
 *
 * @param n the number of executions that will invoke `straw`
 * @param straw the straw to run through
 * @returns a `Straw` that will return values for at most `n` executions
 */
export const take = (n: number, straw: Straw) =>
  accumState(
    ([straw, acc], val, time, event, emit) => {
      if (acc === 0) return [[straw, acc], null]
      const [newStraw, newVal] = straw(val, time, event, emit)
      return [[newStraw, acc - 1], newVal]
    },
    [straw, n]
)

/**
 * It creates a `Straw` that invokes the given `straw` only once.
 *
 * @param straw the straw to run through
 * @returns a `Straw` that will return only the first value
 */
export const once = (straw: Straw) => take(1, straw)

// <test
{
  const assert = test('take')
  assert.stringEqual(run(take(2, id), [1, 2, 3, 4, 5]), [
    1,
    2,
    null,
    null,
    null
  ])
  assert.stringEqual(
    run(take(3, accum((acc, val) => acc + val, 0)), [1, 2, 3, 4, 5]),
    [1, 3, 6, null, null]
  )
  assert.stringEqual(
    run(once(accum((acc, val) => acc + val, 0)), [1, 2, 3, 4, 5]),
    [1, null, null, null, null]
  )
}
// test>
export interface ReduceFn {
  (
    acc: any,
    straw: Straw,
    val: any,
    time: number,
    event: FEvent,
    emit: EmitEvent
  ): [Straw, any]
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
export const reduce = (func: ReduceFn, acc: any, straws: Array<Straw>) =>
  of((val, time, event, emit) => {
    const [newStraws, newVal] = straws.reduce(
      ([straws, acc], straw) => {
        const [newStraw, newVal] = func(acc, straw, val, time, event, emit)
        return [straws.concat(newStraw), newVal]
      },
      [[], acc]
    )
    return [reduce(func, acc, newStraws), newVal]
  })

// <test
{
  const assert = test('reduce')
  const reducer: ReduceFn = (
    acc: any,
    straw: Straw,
    val: any,
    time: number,
    event: FEvent,
    emit: EmitEvent
  ) => {
    const [newStraw, newVal] = straw(val, time, event, emit)
    return [newStraw, newVal + acc]
  }
  assert.stringEqual(
    run(reduce(reducer, 0, [constant(1), constant(2), constant(3), id]), [
      1,
      2,
      3,
      4,
      5
    ]),
    [7, 8, 9, 10, 11]
  )
}
// test>

/**
 * It creates a `Straw` from a number of `Straws` which return a boolean to indicate if all the `Straws` outputs are truthy.
 *
 * The equivalent of the `&&` operator for `Straws`.
 *
 * @param straws the `Straws` to evaluate
 * @returns a `Straw` that will return the desired boolean
 */
export const and = (...straws: Array<Straw>) =>
  reduce(
    (acc, straw, val, time, event, emit) => {
      if (!acc) return [straw, acc]
      const [newStraw, newVal] = straw(val, time, event, emit)
      return [newStraw, acc && newVal]
    },
    true,
    straws
)

/**
 * It creates a `Straw` from a number of `Straws` which return a boolean to indicate if at least one of the `Straws` outputs is truthy.
 *
 * The equivalent of the `||` operator for `Straws`.
 *
 * @param straws the `Straws` to evaluate
 * @returns a `Straw` that will return the desired boolean
 */
export const or = (...straws: Array<Straw>) =>
  reduce(
    (acc, straw, val, time, event, emit) => {
      if (acc) return [straw, acc]
      const [newStraw, newVal] = straw(val, time, event, emit)
      return [newStraw, acc || newVal]
    },
    false,
    straws
)

/**
 * It creates a `Straw` from a single `Straws` which return a boolean to indicate if the `Straw` output is falsy.
 *
 * The equivalent of the `!` operator for `Straws`.
 *
 * @param straw the `Straw` to evaluate
 * @returns a `Straw` that will return the desired boolean
 */
export const not = (straw: Straw) =>
  of((val, time, event, emit) => {
    const [newStraw, newVal] = straw(val, time, event, emit)
    return [not(newStraw), !newVal]
  })

// <test
{
  const assert = test('and, or, not')
  assert.equal(and(constant(true), constant(true))()[1], true)
  assert.equal(and(constant(true), constant(false))()[1], false)
  assert.equal(and(constant(false), constant(false))()[1], false)
  assert.equal(and(constant(true), constant(true), constant(true))()[1], true)
  assert.equal(or(constant(true), constant(true))()[1], true)
  assert.equal(or(constant(true), constant(false))()[1], true)
  assert.equal(or(constant(false), constant(false))()[1], false)
  assert.equal(or(constant(true), constant(false), constant(true))()[1], true)
  assert.equal(not(constant(true))()[1], false)
}
// test>

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
export const when = (...args: Array<Straw>) =>
  of((val, time, event, emit) => {
    const indexedArgs = args.map((val, i): [Straw, number] => [val, i])
    const conditions = indexedArgs.filter(([val, i]) => i % 2 === 0)
    let newArgs = args.slice()
    for (let i = 0; i < conditions.length; i++) {
      const [condition, conditionArgIndex] = conditions[i]
      const [conditionStraw, conditionVal] = condition(val, time, event, emit)
      if (!conditionVal) {
        newArgs = newArgs
          .slice(0, conditionArgIndex)
          .concat(conditionStraw)
          .concat(newArgs.slice(conditionArgIndex + 1))
        continue
      }
      const result = args[conditionArgIndex + 1]
      const [resultStraw, resultVal] = result(val, time, event, emit)
      newArgs = newArgs
        .slice(0, conditionArgIndex)
        .concat([conditionStraw, resultStraw])
        .concat(newArgs.slice(conditionArgIndex + 2))
      return [when(...newArgs), resultVal]
    }
    return [when(...newArgs), null]
  })

// <test
{
  const assert = test('when')
  const ageCheck = when(
    fn(v => v < 18),
    constant('minor'),
    fn(v => v === 18),
    constant('18'),
    fn(v => v > 18),
    constant('adult')
  )
  assert.stringEqual(run(ageCheck, [1, 3, 15, 18, 22, 98]), [
    'minor',
    'minor',
    'minor',
    '18',
    'adult',
    'adult'
  ])
}
// test>
