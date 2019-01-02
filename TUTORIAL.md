<img src="https://framp.me/frappe/img/frappe.svg" alt="Frappe" width="150"/>

# Frappe

Frappe is a library for defining UI components based on time and events.

## Setup

To get started, you may want to install the library, [React](https://reactjs.org/) and [Parcel](https://parceljs.org/).

```bash
mkdir frappe-test && cd frappe-test
npm i @framp/frappe react react-dom parcel
```

You can also use this [Fiddle](https://jsfiddle.net/framp/onr01tmz/).

## Straws

The main building block is called `Straw` and it's a function which accepts 3 parameters `val`, `time`, `event` and returns an array containing a `next` `Straw` and a result.

```javascript
import { of } from '@framp/frappe'
const double = of((val, time, event) => [double, val*2])
const [nextStraw, result] = double(4, 0, null)
assert.equal(result, 8)
const [nextNextStraw, nextResult] = nextStraw(5, 1000, null)
assert.equal(nextResult, 10)
```

In this case our `Straw` `double` is returning itself for the next call.
In this case we can replace `of` with `fn`, which will automatically return the same `Straw` for us.

```
import { of, fn } from '@framp/frappe'
const double = fn((val, time, event) => val*2)
const tripleThenDoubleForever = of((val, time, event) => [double, val*3])
const [nextStraw, result] = tripleThenDoubleForever(4, 0, null)
assert.equal(result, 12)
const [nextNextStraw, nextResult] = nextStraw(5, 1000, null)
assert.equal(nextResult, 10)
```

- `val` is a value passed to the `Straw`, it can be anything.
- `time` is a number representing how much time passed since the beginning of the computation.
- `event` is an object that describe an event (if it happened).

You can use `time` to return time dependent results.

```javascript
import { fn } from '@framp/frappe'
const oneSecondAfter = fn((val, time, event) => time+1000)
const [nextStraw, result] = oneSecondAfter(null, 0, null)
assert.equal(result, 1000)
const [nextNextStraw, nextResult] = nextStraw(null, 1000, null)
assert.equal(nextResult, 2000)
```

By checking the `event` parameter, you can react to events happening in the system.

```javascript
import { of } from '@framp/frappe'
const onButtonClick = fn((val, time, event) => event.type === 'click')
const [nextStraw, result] = onButtonClick(null, 0, null)
assert.equal(result, false)
const [nextNextStraw, nextResult] = nextStraw(null, 1000, { type: 'click', ref: 'button'})
assert.equal(nextResult, true)
```

## Running a Straw

As we saw in the introduction, running a `Straw` means calling it as a function and reading its result.

If you want to run a `Straw` twice, you should use the `nextStraw` being returned for the second call.

This simple pattern can be used to alter the behaviour of your `Straw` over executions and even to store state.

```javascript
import { of, run, accumState } from '@framp/frappe'
const sumAll = (state = 0) => of((val, time, event) => [sumAll(state+val), state+val])
const results = run(sumAll(), [1,2,3,4,5])
assert.equal(results, [1,3,6,10,15)
const sumAll2 = accumState((a, b) => a + b, 0) //equivalent to sumAll()
```

The main advantage of this approach over global stores, is that state is kept locally and can be accessed easily and in a controlled way by composing `Straws` where you need them (more in the next section).

The main advantage over a mutable state approach (like `setState` in React) is control and predictability, which derives from modelling state changes as a fold operation over a set of values.

## Composition

`Straws` can be composed together using `compose`; each `Straw` will send its result down to the next `Straw` as the `val` parameter.
`time` and `event` will stay the same for all the `Straws`.

```javascript
import { fn, accum compose, run } from '@framp/frappe'
const double = fn(val => val*2)
const plus1 = fn(val => val+1)
const sumAll = accum((a, b) => a + b, 0)
const results = run(compose(double, plus1, sumAll), [1,2,3,4,5])
assert.equal(results, [(1+1)*2,(3+1)*2,(6+1)*2,(10+1)*2,(15+1)*2)
```

If you want to run `Straws` in parallel on the same value you can use `fanout`.

```javascript
import { fn, fanout run } from '@framp/frappe'
const double = fn(val => val*2)
const plus1 = fn(val => val+1)
const results = run(fanout(double, plus1), [1,2,3,4,5])
assert.equal(results, [[2,2], [4,3], [6,4], [8,5], [10,6]])
```

## React

You can execute the following examples with this [index.html](https://github.com/framp/frappe/blob/master/examples/index.html), using [Parcel](https://parceljs.org/) and saving the code in `index.tsx`.

```bash
curl https://raw.githubusercontent.com/framp/frappe/master/examples/index.html > index.html
curl https://raw.githubusercontent.com/framp/frappe/master/tsconfig.json > tsconfig.json
parcel index.html
```

A `Straw` returning a React element can be rendered using `ReactRunner`.

```javascript
import React from 'react'
import { render }  from 'react-dom'
import { fn, ReactRunner, timeStrategy } from '@framp/frappe'
const app = fn((val, time, event) => (
  <div>
    <span>{time} ms passed</span>
    <span>{event ? `An ${event.type} event happened!` : ''}</span>
  </div>))
const options = {
  verbose: true,
  updateStrategies: [
    timeStrategy(100), // Refresh every second
  ]
}
render(
  <ReactRunner straw={app} options={options} />,
  document.getElementById('app')
)
```

With `ReactRunner` you can also inject easily a Frappe based application inside an existing React application.

By default `ReactRunner` will only re-render when an event is emitted. 
If you want your application to re-render more frequently you can use `timeStrategy` or `animationFrameStrategy`.

```javascript
import React from 'react'
import { render }  from 'react-dom'
import { fn, ReactRunner, timeStrategy, animationFrameStrategy } from '@framp/frappe'
const app = fn((val, time, event) => [(
  <span>{time} ms passed</span>
  <span>{event ? An {event.type} event happened!}</span>
)])
const options = {
  verbose: true,
  updateStrategies: [
    animationFrameStrategy, // Refresh before every repaint
  ]
}
render(
  <ReactRunner straw={app} options={options} />,
  document.getElementById('app')
```

## Events

on

listenOn

events + async

## Time

A few combinators to deal with time 

## Straw utilities
Frappe provides some handy utilities for dealing with `Straws`.

`when` will accept an even number of `Straws`, logically paired up in `condition` and `action`.
The first `action` whose `condition` returned a truthy value, will be returned.

```javascript
import { run, when } from '@framp/frappe'
const ageCheck = when(
  fn(v => v < 18),
  constant('minor'),
  fn(v => v === 18),
  constant('18'),
  fn(v => v > 18),
  constant('adult')
)
asserts.deepEqual(run(ageCheck), [15, 13, 18, 20, 18], ['minor', 'minor', '18', 'adult', '18'])
```

`hold` will remember the last time a `Straw` returned a truthy value and keep returning that value until the `Straw` start returning a truthy value again.
If you need more advanced functionalities, you can use `holdWhen`, which will accept a predicate to establish whether the value need to be held or not.

```javascript
import { run, hold, holdWhen, id} from '@framp/frappe'
const results = run(hold(id), [null, 1, null, 2, 3, 4])
asserts.deepEqual(results, [null, null, null, 2, 2, 4],)
const resultsWhen = run(holdWhen((acc, val) => val % 2 === 0, id), [null, 1, null, 2, 3, 4],
asserts.deepEqual(resultsWhen, [null, null, null, 2, 2, 4])
```

`take` will run a `Straw` only a limited number of times and return `null` afterwards.
It's especially useful when you want to fire off things once.

```javascript
import { run, hold, holdWhen, id} from '@framp/frappe'
const results = run(hold(id), [null, 1, null, 2, 3, 4])
asserts.deepEqual(results, [null, null, null, 2, 2, 4],)
const resultsWhen = run(holdWhen((acc, val) => val % 2 === 0, id), [null, 1, null, 2, 3, 4],
asserts.deepEqual(resultsWhen, [null, null, null, 2, 2, 4])
```

## store


## Conclusions

That's it!
