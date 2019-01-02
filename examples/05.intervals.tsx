import React from 'react'
import {
  fn,
  on,
  listenOn,
  betweenEvents,
  compose,
  fanout,
  when,
  restartWhen,
  afterTime
} from '../src'

const buttonStart = listenOn(
  { type: 'click' },
  fn(() => <button>Start</button>)
)
const buttonStop = listenOn({ type: 'click' }, fn(() => <button>Stop</button>))
const start = { type: 'click', ref: buttonStart }
const stop = { type: 'click', ref: buttonStop }

const showIsOn = betweenEvents(start, stop)
const color = when(
  showIsOn,
  compose(
    fn(passed => (passed ? '#76B8A6' : '#700d00')),
    afterTime(2000)
  )
)
const renderShow = fn(([show, backgroundColor]) => (
  <div
    style={{
      width: 100,
      height: 100,
      backgroundColor,
      animation: 'spin 4s linear infinite',
      display: show ? 'block' : 'none'
    }}
  />
))
const magicShow = restartWhen(
  on(stop),
  compose(
    renderShow,
    fanout(showIsOn, color)
  )
)

const renderApp = fn(
  ([buttonStart, buttonStop, magicShow, click], time, event) => (
    <div>
      <h1>Magic Show</h1>
      <p>
        {buttonStart} {buttonStop}
      </p>
      {magicShow}
    </div>
  )
)
export default compose(
  renderApp,
  fanout(buttonStart, buttonStop, magicShow)
)
