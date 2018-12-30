import React from 'react'
import { fn, accumState, compose } from '../src'

const countDown = accumState(acc => [acc - 1, acc <= 0 ? 'BOOM' : acc], 5)

const renderCountDown = fn(text => (
  <div>
    <h1>{text}</h1>
  </div>
))

export default compose(
  renderCountDown,
  countDown
)
