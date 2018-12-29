import React from 'react'
import { render } from 'react-dom'
import { ReactRunner, timeStrategy } from '../src'
import hello from './00.hello'
import straw from './01.straw'
import time from './02.time'
import clock from './03.clock'
import countdown from './04.countdown'
import event from './05.event'
import async from './06.async'
import dynamicArray from './07.dynamic-list'
// import todo from "./08.todo.ts";

const straws = [
  hello,
  straw,
  time,
  clock,
  countdown,
  event,
  async,
  dynamicArray
]

const options = {
  verbose: true,
  updateStrategies: [timeStrategy(1000)]
}
render(
  <ReactRunner straw={straws[straws.length - 1]} options={options} />,
  document.getElementById('app')
)
