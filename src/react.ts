import React from "react";
import test from "./test";
import { of, constant, Straw, Event, EventType, EventRef } from "./core";

interface ReactRunnerStrategy {
  mount: (update: (Event) => void) => any;
  unmount: (id: any) => void;
}

interface ReactRunnerProps {
  straw: Straw;
  options: {
    updateStrategies: Array<ReactRunnerStrategy>;
    verbose: boolean;
  };
}
interface ReactRunnerState {
  straw: [Straw, React.Component];
  strategies: Array<ReactRunnerStrategy>;
  start?: number;
}

export class ReactRunner extends React.Component<
  ReactRunnerProps,
  ReactRunnerState
> {
  constructor(props: ReactRunnerProps) {
    super(props);
    this.strawUpdate = this.strawUpdate.bind(this);
    this.strawExec = this.strawExec.bind(this);
    this.emitEvent = this.emitEvent.bind(this);
    this.state = {
      straw: this.strawExec(this.props.straw, 0, null),
      strategies: []
    };
  }
  componentDidMount() {
    const strategies = this.props.options.updateStrategies.reduce(
      (acc, strategy) => acc.concat(strategy.mount(this.strawUpdate)),
      []
    );
    const start = Date.now();
    this.setState(state => ({ ...state, strategies, start }));
  }

  strawUpdate(event: Event) {
    this.setState(state => ({
      ...state,
      straw: this.strawExec(state.straw[0], Date.now() - state.start, event)
    }));
  }

  emitEvent(type: EventType, opts: EventRef) {
    return data => {
      if (data.persist) data.persist();
      this.strawUpdate({
        type,
        ref: opts && opts.ref,
        id: opts && opts.id,
        data
      });
    };
  }

  strawExec(straw: Straw, time: number, event: Event) {
    if (this.props.options.verbose) {
      console.log(time, event);
    }
    return straw(null, time, event, this.emitEvent);
  }

  render() {
    return this.state.straw[1];
  }

  componentWillUnmount() {
    this.props.options.updateStrategies.forEach((strategy, index) => {
      strategy.unmount(this.state.strategies[index]);
    });
  }
}

export const timeStrategy = (time: number) => ({
  mount: update => setInterval(update, time || 1000 / 60),
  unmount: id => clearInterval(id)
});
export const animationFrameStrategy = () => ({
  mount: update => requestAnimationFrame(update),
  unmount: id => cancelAnimationFrame(id)
});

export const listenOn = (
  type: EventType,
  straw: Straw,
  opts: EventRef = {}
) => {
  const types = [].concat(type);
  const ref: Straw = of((val, time, event, emit) => {
    const [newStraw, element] = straw(val, time, event, emit);
    return [
      listenOn(type, newStraw, { ...opts, ref: opts.ref || ref }),
      {
        ...element,
        props: {
          ...element.props,
          ...types.reduce((acc, type) => {
            const handlerName = "on" + type[0].toUpperCase() + type.slice(1);
            return {
              ...acc,
              [handlerName]: emit(type, { ...opts, ref: opts.ref || ref })
            };
          }, {})
        }
      }
    ];
  });
  return ref;
};

{
  const assert = test("listenOn");
  const fakeReactElement = constant({ props: { onSubmit: () => {} } });
  const emitFakeSpy = () => () => {};
  const element1 = listenOn("click", fakeReactElement);
  assert.stringEqual(
    Object.keys(element1(null, null, null, emitFakeSpy)[1].props),
    ["onSubmit", "onClick"]
  );
  const element2 = listenOn(["click", "input"], fakeReactElement);
  assert.stringEqual(
    Object.keys(element2(null, null, null, emitFakeSpy)[1].props),
    ["onSubmit", "onClick", "onInput"]
  );
  const element3 = listenOn("click", fakeReactElement, {
    ref: "delete-button",
    id: 1
  });
  assert.stringEqual(
    Object.keys(element3(null, null, null, emitFakeSpy)[1].props),
    ["onSubmit", "onClick"]
  );
  const emitSpy = (type: EventType, opts: EventRef) => {
    assert.equal(type, "click");
    assert.stringEqual(opts, { ref: "delete-button", id: 1 });
    return event => assert.stringEqual(event, { hello: "data" });
  };
  element3(null, null, null, emitSpy)[1].props.onClick({ hello: "data" });
}
