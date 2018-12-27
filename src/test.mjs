export default description => {
  const fail = (message = "Failed") => {
    throw new Error(`Test ${description}: ${message}`);
  };
  const equal = (a, b) => {
    if (a !== b) {
      console.error("A:", a);
      console.error("B:", b);
      fail("Values are not equal");
    }
  };
  const stringEqual = (a, b) => equal(JSON.stringify(a), JSON.stringify(b));
  const assert = a => !a && fail("Value is not truthy");
  return Object.assign(assert, {
    stringEqual,
    equal,
    fail
  });
};
