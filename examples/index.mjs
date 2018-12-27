import React from "react";
import { render } from "react-dom";
import { strawRunner, timeStrategy } from "../src/index.mjs";
import hello from "./00.hello.mjs";
import straw from "./01.straw.mjs";
import time from "./02.time.mjs";
import clock from "./03.clock.mjs";
import countdown from "./04.countdown.mjs";
import event from "./05.event.mjs";
import async from "./06.async.mjs";
import dynamicList from "./07.dynamic-list.mjs";
// import todo from "./08.todo.mjs";

const App = strawRunner(dynamicList, {
  verbose: true,
  updateStrategies: [timeStrategy(1000)]
});
render(<App />, document.getElementById("app"));
