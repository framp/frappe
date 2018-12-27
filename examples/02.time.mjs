import React from "react";
import { fn } from "../src/index.mjs";

export default fn((val, time) => {
  const seconds = parseInt(time / 1000);
  return (
    <div>
      <h1>
        {seconds} second{seconds === 1 ? "" : "s"} passed
      </h1>
    </div>
  );
});
