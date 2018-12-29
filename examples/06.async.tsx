import React from 'react'
import {
  promise,
  listenOn,
  hold,
  on,
  or,
  once,
  constant,
  when,
  fn,
  compose,
  fanout
} from '../src'

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
const onStartOrOnReload = or(
  once(constant(true)),
  on({ type: 'click', ref: button })
)
const fireKittyRequest = when(onStartOrOnReload, kittyRequest)

const render = fn(([button, kittyImage]) => (
  <div>
    <h1>It's a kitty!</h1>
    <div>{button}</div>
    <p>{kittyImage ? <img src={kittyImage} /> : 'Loading...'}</p>
  </div>
))

export default compose(
  render,
  fanout(button, kittyImage, fireKittyRequest)
)
