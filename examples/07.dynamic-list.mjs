import React from "react";
import {
  listenOn,
  hold,
  on,
  fn,
  compose,
  fanout,
  dynamicList
} from "../src/index.mjs";

//1. O-Ren Ishii
//2. Vernita Green
//3. Budd
//4. Elle Driver
//5. Bill

const input = listenOn("input", fn(() => <input />));
const submit = listenOn("click", fn(() => <button>Kill</button>));
const list = compose(
  dynamicList({
    add: on("click", submit),
    remove: on("click", "delete-button")
  }),
  hold(on("input", input, event => event.data.target.value))
);

const render = fn(([input, submit, list], time, event, emit) => (
  <div>
    <h1>Death List Five</h1>
    <div>
      {input} {submit}
    </div>

    <div>
      <ol>
        {list.map((el, id) => (
          <li key={id}>
            <span>{el}</span>
            <span>
              &nbsp;
              <button onClick={emit("click", { ref: "delete-button", id })}>
                X
              </button>
            </span>
          </li>
        ))}
      </ol>
    </div>
  </div>
));

export default compose(
  render,
  fanout(input, submit, list)
);
