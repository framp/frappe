import React from 'react'
import { listenOn, hold, on, fn, compose, fanout, dynamicArray } from '../src'

// 1. O-Ren Ishii
// 2. Vernita Green
// 3. Budd
// 4. Elle Driver
// 5. Bill

const input = listenOn({ type: 'input' }, fn(() => <input />))
const submit = listenOn({ type: 'click' }, fn(() => <button>Kill</button>))
const list = compose(
  dynamicArray({
    add: on({ type: 'click', ref: submit }),
    remove: on({ type: 'click', ref: 'delete-button' })
  }),
  hold(on({ type: 'input', ref: input }, event => event.data.target.value))
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
