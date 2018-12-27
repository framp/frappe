import React from "react";
import { fn, holdFirst, compose } from "../src/index.mjs";

const render = fn((startingDate, time) => {
  const currentDate = new Date(startingDate + time);
  return (
    <div>
      <h1>{currentDate.toUTCString()}</h1>
    </div>
  );
});

const startingDate = holdFirst(fn(() => +new Date()));

export default compose(
  render,
  startingDate
);
