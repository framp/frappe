import React from 'react'
import { render } from 'react-dom'
import { ReactRunner, timeStrategy } from '../src'
import router from './router'
import hello from './00.hello'
import straw from './01.straw'
import time from './02.time'
import clock from './03.clock'
import countdown from './04.countdown'
import event from './05.event'
import async from './06.async'
import dynamicArray from './07.dynamic-array'
// import todo from "./08.todo.ts";

const straws = {
  hello,
  straw,
  time,
  clock,
  countdown,
  event,
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
