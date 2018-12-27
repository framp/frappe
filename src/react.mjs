import React from "react";
import test from "./test";
import { of, constant } from "./core";

export const strawRunner = (
  straw,
  { updateStrategies = [], verbose = false } = {}
) =>
  class StrawRunner extends React.Component {
    constructor(props) {
      super(props);
      this.strawUpdate = this.strawUpdate.bind(this);
      this.strawExec = this.strawExec.bind(this);
      this.emitEvent = this.emitEvent.bind(this);
      this.state = { straw: this.strawExec(straw, 0), strategies: [] };
    }
    componentDidMount() {
      const strategies = updateStrategies.reduce(
        (acc, strategy) => acc.concat(strategy[0](this.strawUpdate)),
        []
      );
      const start = new Date();
      this.setState(state => Object.assign({}, state, { strategies, start }));
    }

    strawUpdate(event) {
      this.setState(state => ({
        ...state,
        straw: this.strawExec(state.straw[0], new Date() - state.start, event)
      }));
    }

    emitEvent(type, opts) {
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

    strawExec(straw, time, event) {
      if (verbose) {
        console.log(time, event);
      }
      return straw(null, time, event, this.emitEvent);
    }

    render() {
      return this.state.straw[1];
    }

    componentWillUnmount() {
      updateStrategies.forEach((strategy, index) => {
        strategy[1](this.state.strategies[index]);
      });
    }
  };

export const timeStrategy = time => [
  update => setInterval(update, time || 1000 / 60),
  id => clearInterval(id)
];
export const animationFrameStrategy = () => [
  update => requestAnimationFrame(update),
  id => cancelAnimationFrame(id)
];

export const listenOn = (type, straw, opts = {}) => {
  const types = [].concat(type);
  const ref = of((val, time, event, emit) => {
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
  const emitFakeSpy = () => {};
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
  const emitSpy = (type, opts) => {
    assert.equal(type, "click");
    assert.stringEqual(opts, { ref: "delete-button", id: 1 });
    return event => assert.stringEqual(event, { hello: "data" });
  };
  element3(null, null, null, emitSpy)[1].props.onClick({ hello: "data" });
}
