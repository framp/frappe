import React from "react";
import { fn } from "../src";

export default fn((val, time) => {
  const seconds = Math.floor(time / 1000);
  return (
    <div>
      <h1>
        {seconds} second{seconds === 1 ? "" : "s"} passed
      </h1>
    </div>
  );
});
