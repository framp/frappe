import React from 'react'
import { fn, when, compose, on, accumState, restartWhen } from '../src'

const timeout = fn => (...args) => setTimeout(() => fn(...args), 16)
const render = paths =>
  fn((currentView, time, event, emit) => (
    <div>
      <section className='menu'>
        {paths.map((path, index) => (
          <a
            href={`#${path}`}
            key={index}
            onClick={timeout(emit({ type: 'click', ref: 'menu' }))}
          >
            {path}
          </a>
        ))}
      </section>
      <section className='content'>{currentView}</section>
    </div>
  ))

const makeCondition = path => fn(() => document.location.hash === `#${path}`)
const makeRestartableView = view =>
  restartWhen(on({ type: 'click', ref: 'menu' }), view)

export default straws => {
  const paths = Object.keys(straws)
  const views = Object.values(straws)
  const args = views.reduce(
    (acc, view, key) =>
      acc.concat(makeCondition(paths[key]), makeRestartableView(view)),
    []
  )
  return compose(
    render(paths),
    when(...args)
  )
}
