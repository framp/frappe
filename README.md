# Frappe

Frappe is a library for defining UI components based on time and events.

The main building block is called `Straw` and it's a function which accepts 3 parameters `val`, `time`, `event` and returns an array containing a `Straw` and a result.

```
import { of } from '@framp/frappe'
const straw = of((val, time, event) => [straw, val*2])
const [nextStraw, result] = straw(4, 0, null)
assert.equal(result, 8)
const [nextNextStraw, nextResult] = straw(5, 1, null)
assert.equal(nextResult, 10)
```

- `val` is a value passed to the `Straw`, it can be anything.
- `time` is a number representing how much time passed since the beginning of the computation.
- `event` is an object that describe an event (if it happened).

Running a `Straw` means calling it as a function and reading its result.

If you want to run a `Straw` twice, you should use the `nextStraw` being returned for the second call.

This simple pattern can be used to alter the behaviour of your `Straw` over executions and even to store state.

```
import { of, run, accumState } from '@framp/frappe'
const sumAll = (state = 0) => of((val, time, event) => [sumAll(state+val), state+val])
const results = run(sumAll(), [1,2,3,4,5])
assert.equal(results, [1,3,6,10,15)
const sumAll2 = accumState((a, b) => a + b, 0) //equivalent to sumAll()
```

The main advantage of this approach over global stores, is that state is kept locally and can be accessed easily and in a controlled way by composing `Straws` where you need them (more in the next section).

The main advantage over a mutable state approach (like `setState` in React) is control and predictability, which derives from modelling state changes as a fold operation over a set of values.

## Composition

`Straws` can be composed together

+ fanout

## React

```
import React from 'react'
import { fn } from '@framp/frappe'

export const app = fn((val, time, event) => [(
  <span>{time} ms passed</span>
  <span>{event ? An {event.type} event happened!}</span>
)])
```

## hold, take, when

## time

## events

## store



## Inspiration

The main source of inspiration are Arrowised Functional Reactive Programming (aFRP) libraries like [Netwire](https://hackage.haskell.org/package/netwire) and [Yampa](https://wiki.haskell.org/Yampa).

JavaScript is a vastly different language from Haskell, which translate to different developers expectations. When facing a choice between pragmatism / familiarity and purity, Frappe takes the pragmatic approach.