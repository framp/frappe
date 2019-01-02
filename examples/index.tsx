import React from 'react'
import { render } from 'react-dom'
import { ReactRunner, timeStrategy } from '../src'
import router from './router'
import hello from './00.hello'
import time from './01.time'
import clock from './02.clock'
import countdown from './03.countdown'
import event from './04.event'
import intervals from './05.intervals'
import async from './06.async'
import dynamicArray from './07.dynamic-array'
// import todo from "./08.todo.ts";

const straws = {
  hello,
  time,
  clock,
  countdown,
  event,
  intervals,
  async,
  dynamicArray
}

const options = {
  verbose: true,
  updateStrategies: [timeStrategy(500)]
}
render(
  <ReactRunner straw={router(straws)} options={options} />,
  document.getElementById('app')
)
