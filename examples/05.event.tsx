import React from 'react'
import { fn, listenOn, on, compose, holdFirst, fanout } from '../src'

const button = listenOn({ type: 'click' }, fn(() => <button>Click me</button>))

const hasBeenClicked = holdFirst(on({ type: 'click', ref: button }))

const render = fn(([button, hasBeenClicked]) => (
  <div>
    <h1>It has {hasBeenClicked ? '' : 'not '}been clicked</h1>
    {button}
  </div>
))

export default compose(
  render,
  fanout(button, hasBeenClicked)
)
