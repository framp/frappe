import assert from "assert";

const ARROW_KEY = '__type'
const ARROW_VALUE = 'Arrow'

export const run = (arrow, inputs) =>
  inputs.reduce(
    ([arrow, outputs], input) => {
      const [newArrow, output] = arrow(input);
      return [newArrow, outputs.concat([output])];
    },
    [arrow, []]
  )[1];

{
  ("Test: run");
  const aArrow = a => [aArrow, a * 2];
  assert.deepEqual(run(aArrow, [1, 2, 3, 4]), [2, 4, 6, 8]);
}

export const of = fn => Object.assign(fn, { [ARROW_KEY]: ARROW_VALUE })
export const id = of(a => [id, a]);
export const constant = val => of(a => [constant(val), val]);

{
  ("Test: of, id, constant");
  assert.deepEqual(id.__type, 'Arrow');
  assert.deepEqual(run(id, [1, 2, 3, 4]), [1, 2, 3, 4]);
  assert.deepEqual(run(constant(42), [1, 2, 3, 4]), [42, 42, 42, 42]);
}

const composeFrom = reduce => fns => of(arg => {
  const [arrows, out] = fns[reduce](
    (res, fn) => {
      const [arrow, out] = fn(res[1]);
      return [[arrow].concat(res[0]), out];
    },
    [[], arg]
  );
  return [composeFrom(reduce)(arrows), out];
});
export const composeRight = composeFrom("reduceRight");
export const composeLeft = composeFrom("reduce");
export const compose = composeRight;

{
  ("Test: compose");
  const bArrow = a => [bArrow, a * 3];
  const cArrow = a => [cArrow, a * 2];
  assert.deepEqual(run(compose([bArrow, cArrow]), [1, 2, 3, 4]), [
    6,
    12,
    18,
    24
  ]);
  assert.deepEqual(run(compose([cArrow, bArrow, cArrow]), [1, 2, 3, 4]), [
    12,
    24,
    36,
    48
  ]);
  assert.deepEqual(
    run(compose([compose([bArrow, cArrow]), bArrow]), [1, 2, 3, 4]),
    [18, 36, 54, 72]
  );
}

export const arr = f => of(a => [arr(f), f(a)]);

{
  ("Test: arr");
  const dfn = a => a * 2;
  assert.deepEqual(run(arr(dfn), [1, 2, 3, 4]), [2, 4, 6, 8]);
}

export const nth = (n, arrow) => of(vals => {
  const [arrow1, r] = arrow(vals[n]);
  const results = vals
    .slice(0, n)
    .concat(r)
    .concat(vals.slice(n + 1));
  return [nth(n, arrow1), results];
});
export const first = arrow => nth(0, arrow);
export const second = arrow => nth(1, arrow);

{
  ("Test: first, second, nth");
  const eArrow = a => [eArrow, a * 2];
  assert.deepEqual(run(first(eArrow), [[1, 1], [2, 2], [3, 3], [4, 4]]), [
    [2, 1],
    [4, 2],
    [6, 3],
    [8, 4]
  ]);
  assert.deepEqual(run(second(eArrow), [[1, 1], [2, 2], [3, 3], [4, 4]]), [
    [1, 2],
    [2, 4],
    [3, 6],
    [4, 8]
  ]);
  assert.deepEqual(
    run(nth(2, eArrow), [[1, 1, 1], [2, 2, 2], [3, 3, 3], [4, 4, 4]]),
    [[1, 1, 2], [2, 2, 4], [3, 3, 6], [4, 4, 8]]
  );
}

export const split = arrows => of(vals => {
  const results = vals.map((v, i) => arrows[i](v));
  const newArrows = results.map(([a]) => a);
  const newVals = results.map(([_, a]) => a);
  return [split(newArrows), newVals];
});

{
  ("Test: split");
  const fArrow = a => [fArrow, a * 2];
  const gArrow = a => [gArrow, a * 3];
  const hArrow = ([a, b]) => [hArrow, [a + 1, b - 1]];
  assert.deepEqual(split([fArrow, gArrow])([2, 2])[1], [4, 6]);
  assert.deepEqual(split([fArrow, gArrow, gArrow])([2, 2, 2])[1], [4, 6, 6]);
  assert.deepEqual(
    run(split([fArrow, gArrow]), [[1, 1], [2, 2], [3, 3], [4, 4]]),
    [[2, 3], [4, 6], [6, 9], [8, 12]]
  );
  assert.deepEqual(
    run(compose([hArrow, split([fArrow, gArrow])]), [
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4]
    ]),
    [[3, 2], [5, 5], [7, 8], [9, 11]]
  );
}

export const fanout = arrows =>
  compose([split(arrows), arr(val => arrows.map(() => val))]);

{
  ("Test: fanout");
  const iArrow = a => [iArrow, a * 2];
  const jArrow = a => [jArrow, a * 3];
  const kArrow = a => [kArrow, a * 4];
  assert.deepEqual(fanout([iArrow, jArrow])(2)[1], [4, 6]);
  assert.deepEqual(fanout([iArrow, jArrow])(2)[1], [4, 6]);
  assert.deepEqual(fanout([iArrow, jArrow, kArrow])(2)[1], [4, 6, 8]);
}

export const accum = (acc, f) => of(input => {
  const [acc1, output] = f(acc, input);
  return [accum(acc1, f), output];
});

export const accum1 = (acc, f) =>
  accum(acc, (acc, input) => {
    const b1 = f(acc, input);
    return [b1, b1];
  });

{
  ("Test: accum, accum1");
  const impoliteSumCounter = accum([0, 0], ([a, c], b) => [
    [a + b, c + 1],
    a < 10 ? "Back off " + (c + 2) + " times!" : a + b
  ]);
  assert.deepEqual(run(impoliteSumCounter, [3, 1, 4, 5, 14, 2]), [
    "Back off 2 times!",
    "Back off 3 times!",
    "Back off 4 times!",
    "Back off 5 times!",
    27,
    29
  ]);
  const sum = accum1(0, (a, b) => a + b);
  assert.deepEqual(run(sum, [3, 5, 9, 0, 14, 2]), [3, 8, 17, 17, 31, 33]);
}

export const isArrow = val => typeof val === 'function' && val[ARROW_KEY] === ARROW_VALUE

export const constantify = val => isArrow(val) ? val : constant(val);
