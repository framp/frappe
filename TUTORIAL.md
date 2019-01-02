<img src="https://framp.me/frappe/img/frappe.svg" alt="Frappe" width="150"/>

# Frappe

Frappe is a library for defining UI components based on time and events.

Frappe is for you if:

 - You like declarative programming
 - You like defining small components and compose them into bigger applications
 - You like your state to be close to where you need it (locally stateful programming)

If you have some doubts, please consult the [documentation](https://framp.me/frappe/docs/).

*Code snippets are not available in the documentation right now, but you can find relevant tests right after every function's implementation in the [code](https://github.com/framp/frappe/blob/mast@framp/frappe/core.ts)*

## Setup

To get started, you may want to install the library, [React](https://reactjs.org/) and [Parcel](https://parceljs.org/).

```bash
mkdir frappe-test && cd frappe-test
npm i @framp/frappe react react-dom parcel
```

You can execute the React based examples with this [index.html](https://github.com/framp/frappe/blob/master/examples/index.html), using [Parcel](https://parceljs.org/) and saving the code in `index.tsx`.

```bash
curl https://raw.githubusercontent.com/framp/frappe/master/examples/index.html > index.html
curl https://raw.githubusercontent.com/framp/frappe/master/tsconfig.json > tsconfig.json
parcel index.html
```

You can also use this [JSFiddle](https://jsfiddle.net/framp/onr01tmz/).

## Straws

The main building block in Frappe is called `Straw`.

A `Straw` has inputs and an output, exactly like a function, and it will be called multiple time during a normal run of your application.

It can return any type of data: Numbers, Strings, Objects, Arrays, React components.

It's implemented as a function which accepts 3 parameters `val`, `time`, `event` and returns an array containing a `next Straw` and a result.

```jsx
import { of } from '@framp/frappe'
const double = of((val, time, event) => [double, val*2])
const [nextStraw, result] = double(4, 0, null)
assert.equal(result, 8)
const [nextNextStraw, nextResult] = nextStraw(5, 1000, null)
assert.equal(nextResult, 10)
```

After the first call to your `Straw`, `nextStraw` will be called in place of your original `Straw`: this enables us to modify its behaviour in the next calls.

In this example our `Straw double` is returning itself for the next call, so this `Straw` will behave identically in all its runs.
In this case we can replace `of` with `fn`, which will automatically return the same `Straw` for us.

```jsx
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

```jsx
import { fn } from '@framp/frappe'
const oneSecondAfter = fn((val, time, event) => time+1000)
const [nextStraw, result] = oneSecondAfter(null, 0, null)
assert.equal(result, 1000)
const [nextNextStraw, nextResult] = nextStraw(null, 1000, null)
assert.equal(nextResult, 2000)
```

By checking the `event` parameter, you can react to events happening in the system.

```jsx
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

This simple pattern can be used to alter the behaviour of your `Straw` over executions - and even to store state.

```jsx
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

```jsx
import { fn, accum compose, run } from '@framp/frappe'
const double = fn(val => val*2)
const plus1 = fn(val => val+1)
const sumAll = accum((a, b) => a + b, 0)
const results = run(compose(double, plus1, sumAll), [1,2,3,4,5])
assert.equal(results, [(1+1)*2,(3+1)*2,(6+1)*2,(10+1)*2,(15+1)*2)
```

If you want to run `Straws` in parallel on the same value you can use `fanout`.

```jsx
import { fn, fanout run } from '@framp/frappe'
const double = fn(val => val*2)
const plus1 = fn(val => val+1)
const results = run(fanout(double, plus1), [1,2,3,4,5])
assert.equal(results, [[2,2], [4,3], [6,4], [8,5], [10,6]])
```

With this primitives we can compose `Straws`, from tiny functions to complex applications.

## React

A `Straw` returning a React element can be rendered using `ReactRunner`.

```jsx
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
    timeStrategy(1000), // Refresh every second
  ]
}
render(
  <ReactRunner straw={app} options={options} />,
  document.getElementById('app')
)
```

With `ReactRunner` you can also easily inject a Frappe based application inside an existing React application.

By default `ReactRunner` will only re-render when an event is emitted.

If you want your application to re-render more frequently you can use `timeStrategy` or `animationFrameStrategy`.

*In the future, `Straws` will be able to let `ReactRunner` know when they need to be called, making strategies obsolete.*

For the sake of brevity, we will assume in the following examples a file `index.tsx` which run our application.

```jsx
import React from 'react'
import { render }  from 'react-dom'
import { fn, ReactRunner, animationFrameStrategy } from '@framp/frappe'
import app from './app'

const options = {
  verbose: true,
  updateStrategies: [
    animationFrameStrategy // Refresh after every repaint
  ]
}
render(
  <ReactRunner straw={app} options={options} />,
  document.getElementById('app')
)
```

## Events

You can listen to events happening in the system with `on`.

`on` accepts an Object with optional `type`, `ref` and `id` and it will return the event when

```jsx
import React from 'react'
import { fn, on, listenOn, compose, fanout } from '@framp/frappe'

const button = listenOn({ type: 'click' }, fn(() => (<button>Magic</button>)))
const listener = on({ type: 'click', ref: button })

const render = fn(([button, click], time, event) => (
  <div>
    <p>{button}</p>
    <code>{click && click.type}</code>
  </div>
))
export default compose(render, fanout(button, listener))
```

`ref` (and `id`) can be anything, even a reference to a `Straw`! 

An event Object will look this:
```jsx
{
  type: "click",
  ref: Straw,
  id: null,
  data: SyntheticEventFromReact
}
```

`listenOn` is being used to tell React we care about clicks;

*In the future, Frappe will be able to parse the calls to on and automatically handle setting up event listeners for you, making `listenOn` obsolete.*

## Time and Events utilities

Frappe provides a few utilities to generate useful `Straws` to deal with time and events.

`beforeTime(100)`, `afterTime(100)` work with times; they will return `true` before or after enough time has passed since they were run.

`betweenTimes(100,200)` combines the previous functions and will return `true` when inside the range of specified times.

`beforeEven({ type: "click" })`, `afterEvent({ type: "click" })` work with events; they will return `true` before or after a certain event happened, since they were run.

`betweenEvents({ type: "click", ref: 'a' }, { type: "click", ref: 'b'  })` similarly combines the previous functions and returns `true` after the first event and before the second one.

Let's check out an example!

```jsx
import React from 'react'
import { fn, on, listenOn, betweenEvents, compose, fanout, when, restartWhen, afterTime } from '@framp/frappe'

const buttonStart = listenOn({ type: 'click' }, fn(() => (<button>Start</button>)))
const buttonStop = listenOn({ type: 'click' }, fn(() => (<button>Stop</button>)))
const start = { type: 'click', ref: buttonStart }
const stop = { type: 'click', ref: buttonStop }

const showIsOn = betweenEvents(start, stop)
const color = when(showIsOn, compose(fn(passed => passed ? '#76B8A6' : '#700d00'), afterTime(2000)))
const renderShow = fn(([show, backgroundColor]) => 
  (<div style={({
    width: 100, 
    height: 100, 
    backgroundColor,
    animation: 'spin 4s linear infinite',
    display: show ? 'block' : 'none'
  })} />))
const magicShow = restartWhen(on(stop), compose(renderShow, fanout(showIsOn, color)))

const renderApp = fn(([buttonStart, buttonStop, magicShow, click], time, event) => (
  <div>
    <h1>Magic Show</h1>
    <p>{buttonStart} {buttonStop}</p>
    {magicShow}
  </div>
))
export default compose(renderApp, fanout(buttonStart, buttonStop, magicShow))
```

When we press on Start (and before we press on Stop), renderShow will be rendered.

Two seconds after starting, the color of the div will change.

`restartWhen` is being used after every `stop` event to reset the `Straw` to its original function.

## Asynchronous actions

We can plug asynchronous actions in our event system using `promise`.

`promise` accepts a Promise returning function and it returns a `Straw` that will call your code and emit a `promise-resolve` or a `promise-error`.

```jsx
import React from 'react'
import { fn, when, hold, promise, on, listenOn, compose, fanout } from '@framp/frappe'

const kittyRequest = promise(() =>
  fetch(
    'http://api.giphy.com/v1/gifs/random?tag=funny+cat&rating=g&api_key=dc6zaTOxFJmzC&limit=1'
  )
    .then(res => res.json())
    .then(res => res.data.image_url)
)

const button = listenOn({ type: 'click' }, fn(() => <button>New Kitty</button>))
const kittyImage = hold(
  on({ type: 'promise-resolve', ref: kittyRequest }, v => v.data)
)
const fireKittyRequest = when(on({ type: 'click', ref: button }), kittyRequest)

const render = fn(([button, kittyImage]) => (
  <div>
    <h1>It's a kitty!</h1>
    <div>{button}</div>
    <p>{kittyImage ? <img src={kittyImage} /> : ':('}</p>
  </div>
))

export default compose(
  render,
  fanout(button, kittyImage, fireKittyRequest)
)
```

## Straw utilities
Frappe provides some handy utilities for dealing with `Straws`.

`when` will accept an even number of `Straws`, logically paired up in `condition` and `action`.
The first `action` whose `condition` returned a truthy value, will be returned.

```jsx
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

```jsx
import { run, hold, holdWhen, id} from '@framp/frappe'
const results = run(hold(id), [null, 1, null, 2, 3, 4])
asserts.deepEqual(results, [null, null, null, 2, 2, 4],)
const resultsWhen = run(holdWhen((acc, val) => val % 2 === 0, id), [null, 1, null, 2, 3, 4],
asserts.deepEqual(resultsWhen, [null, null, null, 2, 2, 4])
```

`take` will run a `Straw` only a limited number of times and return `null` afterwards.
It's especially useful when you want to fire off things once.

```jsx
import { run, hold, holdWhen, id} from '@framp/frappe'
const results = run(hold(id), [null, 1, null, 2, 3, 4])
asserts.deepEqual(results, [null, null, null, 2, 2, 4],)
const resultsWhen = run(holdWhen((acc, val) => val % 2 === 0, id), [null, 1, null, 2, 3, 4],
asserts.deepEqual(resultsWhen, [null, null, null, 2, 2, 4])
```

## Data storage

As we saw before we can use `Straws` to store state.

`dynamicArray` and `dynamicMap` can be used to store data using events as inputs.

By providing an `add Straw`, a `dynamicArray` or map can understand when it needs to treat its `val` as input and store another element in the Array.
By providing a `remove Straw`, a `dynamicArray` can read the event `id` property to delete the element at index `id`.

```jsx
import React from 'react'
import { listenOn, hold, on, fn, compose, fanout, dynamicArray } from '../src'

// 1. O-Ren Ishii
// 2. Vernita Green
// 3. Budd
// 4. Elle Driver
// 5. Bill

const input = listenOn({ type: 'input' }, fn(() => <input />))
const submit = listenOn({ type: 'click' }, fn(() => <button>Kill</button>))
const inputText = on({ type: 'input', ref: input }, event => event.data.target.value)
const list = compose(
  dynamicArray({
    add: on({ type: 'click', ref: submit }),
    remove: on({ type: 'click', ref: 'delete-button' })
  }),
  hold(inputText)
)

const render = fn(([input, submit, list], time, event, emit) => (
  <div>
    <h1>Death List Five</h1>
    <div>
      {input} {submit}
    </div>

    <div>
      <ol>
        {list.map((el, id) => (
          <li key={id}>
            <span>{el}</span>
            <span>
              &nbsp;
              <button
                onClick={emit({ type: 'click', ref: 'delete-button', id })}
              >
                X
              </button>
            </span>
          </li>
        ))}
      </ol>
    </div>
  </div>
))

export default compose(
  render,
  fanout(input, submit, list)
)
```

There is a fourth parameter being passed to every `Straw`, `emit`.

`emit` is a function that accept an event Object and returns a callback that will accept more data.

The data passed in the callback will be set as the `data` property in the emitted event.

## Conclusions

That's all folks!

I hope you enjoyed this tour of Frappe and you'll want to build something with it.

You can have a look at the [examples](https://github.com/framp/frappe/tree/master/examples) for more or at the [documentation](https://framp.me/frappe/docs/) for more details.

There are a lot of features to build and a lot of room for improvements.
If you're interested in contributing, check out the [Contributors Guidelines](https://github.com/framp/frappe/blob/master/CONTRIBUTORS.md)
