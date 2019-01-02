import React from 'react'
import { of, Straw, FEvent } from './core'
// #if TEST
import { constant } from './core'
import test from './test'
// #endif

interface ReactRunnerStrategy {
  mount: (update: (FEvent) => void) => any
  unmount: (id: any) => void
}

interface ReactRunnerProps {
  straw: Straw
  options: {
    updateStrategies: Array<ReactRunnerStrategy>
    verbose: boolean
  }
}
interface ReactRunnerState {
  straw: [Straw, React.Component]
  strategies: Array<ReactRunnerStrategy>
  start?: number
}

/**
 * It's a React component that will execute a `Straw` and render it.
 *
 * It will re-render every time there is a new event being triggered or whenever an update strategy fires.
 *
 */
export class ReactRunner extends React.Component<
  ReactRunnerProps,
  ReactRunnerState
> {
  public static defaultProps = {
    options: {
      verbose: false,
      updateStrategies: []
    }
  }
  constructor (props: ReactRunnerProps) {
    super(props)
    this.strawUpdate = this.strawUpdate.bind(this)
    this.strawExec = this.strawExec.bind(this)
    this.emitEvent = this.emitEvent.bind(this)
    this.state = {
      straw: this.strawExec(this.props.straw, 0, null),
      strategies: []
    }
  }
  componentDidMount () {
    const strategies = []
      .concat(this.props.options.updateStrategies)
      .reduce(
        (acc, strategy) => acc.concat(strategy.mount(this.strawUpdate)),
        []
      )
    const start = Date.now()
    this.setState(state => ({ ...state, strategies, start }))
  }

  strawUpdate (event: FEvent) {
    this.setState(state => ({
      ...state,
      straw: this.strawExec(state.straw[0], Date.now() - state.start, event)
    }))
  }

  emitEvent (event: FEvent) {
    return (data: any) => {
      if (data.persist) data.persist()
      this.strawUpdate({
        ...event,
        data
      })
    }
  }

  strawExec (straw: Straw, time: number, event: FEvent) {
    if (this.props.options.verbose) {
      console.log(time, event)
    }
    return straw(null, time, event, this.emitEvent)
  }

  render () {
    return this.state.straw[1]
  }

  componentWillUnmount () {
    []
      .concat(this.props.options.updateStrategies)
      .forEach((strategy, index) => {
        strategy.unmount(this.state.strategies[index])
      })
  }
}

export const timeStrategy = (time: number) => ({
  mount: update => setInterval(update, time || 1000 / 60),
  unmount: id => clearInterval(id)
})
export const animationFrameStrategy = () => ({
  mount: update => requestAnimationFrame(update),
  unmount: id => cancelAnimationFrame(id)
})

/**
 * It accepts an `event` (or array of `events`) and a `Straw` returning a React element and return a `Straw` which returns the React element extended with the needed event listeners, setup using the `type` property of the `event`.
 *
 * The events will be plugged via `ReactRunner` into the application and will be available to all the `Straws`.
 *
 * @param event an event (or array of `event`) to listen for
 * @param straw a Straw returning a React element to extend with the listeners from `event`
 * @returns a `Straw` returning the React element from `straw` with the event listeners from event
 */
export const listenOn = (event: Array<FEvent> | FEvent, straw: Straw) => {
  const events = [].concat(event)
  const ref: Straw = of((val, time, event, emit) => {
    const newEvents = events.map(event => ({ ...event, ref: event.ref || ref }))
    const eventHandlers = events.reduce((acc, event) => {
      const handlerName =
        'on' + event.type[0].toUpperCase() + event.type.slice(1)
      return {
        ...acc,
        [handlerName]: emit({ ...event, ref: event.ref || ref })
      }
    }, {})
    const [newStraw, element] = straw(val, time, event, emit)
    return [
      listenOn(newEvents, newStraw),
      {
        ...element,
        props: {
          ...element.props,
          ...eventHandlers
        }
      }
    ]
  })
  return ref
}

// #if TEST
{
  const assert = test('listenOn')
  const fakeReactElement = constant({ props: { onSubmit: () => null } })
  const emitFakeSpy = () => () => null
  const element1 = listenOn({ type: 'click' }, fakeReactElement)
  assert.stringEqual(
    Object.keys(element1(null, null, null, emitFakeSpy)[1].props),
    ['onSubmit', 'onClick']
  )
  const element2 = listenOn(
    [{ type: 'click' }, { type: 'input' }],
    fakeReactElement
  )
  assert.stringEqual(
    Object.keys(element2(null, null, null, emitFakeSpy)[1].props),
    ['onSubmit', 'onClick', 'onInput']
  )
  const element3 = listenOn(
    { type: 'click', ref: 'delete-button', id: 1 },
    fakeReactElement
  )
  assert.stringEqual(
    Object.keys(element3(null, null, null, emitFakeSpy)[1].props),
    ['onSubmit', 'onClick']
  )
  const emitSpy = ({ type, ref, id }: FEvent) => {
    assert.equal(type, 'click')
    assert.equal(ref, 'delete-button')
    assert.equal(id, 1)
    return event => assert.stringEqual(event, { hello: 'data' })
  }
  element3(null, null, null, emitSpy)[1].props.onClick({ hello: 'data' })
}
// #endif
