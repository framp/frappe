import React from "react";
import { fn, listenOn, on, compose, holdFirst, fanout } from "../src/index.mjs";

const button = listenOn("click", fn(() => <button>Click me</button>));

const hasBeenClicked = holdFirst(on("click", button));

const render = fn(([button, hasBeenClicked]) => (
  <div>
    <h1>It has {hasBeenClicked ? "" : "not "}been clicked</h1>
    {button}
  </div>
));

export default compose(
  render,
  fanout(button, hasBeenClicked)
);
