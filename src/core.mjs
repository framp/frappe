import test from "./test";

const STRAW_KEY = "__type";
const STRAW_VALUE = "Straw";

export const run = (straw, inputs, times = [], events = [], emits = []) =>
  inputs.reduce(
    ([straw, outputs], input, index) => {
      const [newStraw, output] = straw(
        input,
        times[index],
        events[index],
        emits[index]
      );
      return [newStraw, outputs.concat([output])];
    },
    [straw, []]
  )[1];

{
  const assert = test("run");
  const aStraw = a => [aStraw, a * 2];
  assert.stringEqual(run(aStraw, [1, 2, 3, 4]), [2, 4, 6, 8]);
}

export const of = f => Object.assign(f, { [STRAW_KEY]: STRAW_VALUE });
export const id = of(val => [id, val]);
{
  const assert = test("id");
  assert.stringEqual(id.__type, STRAW_VALUE);
  assert.stringEqual(run(id, [1, 2, 3, 4]), [1, 2, 3, 4]);
}

export const constant = val => of(a => [constant(val), val]);
{
  const assert = test("constant");
  assert.stringEqual(run(constant(42), [1, 2, 3, 4]), [42, 42, 42, 42]);
}

export const fn = f =>
  of((val, time, event, emit) => [fn(f), f(val, time, event, emit)]);
{
  const assert = test("fn");
  const dfn = of(a => a * 2);
  assert.stringEqual(run(fn(dfn), [1, 2, 3, 4]), [2, 4, 6, 8]);
}

const composeFrom = reduce => (...fs) =>
  of((val, time, event, emit) => {
    const [straws, out] = fs[reduce](
      (res, f) => {
        const [straw, out] = f(res[1], time, event, emit);
        return [[straw].concat(res[0]), out];
      },
      [[], val]
    );
    return [composeFrom(reduce)(...straws), out];
  });
export const composeRight = composeFrom("reduceRight");
export const composeLeft = composeFrom("reduce");
export const compose = composeRight;

{
  const assert = test("compose");
  const bStraw = a => [bStraw, a * 3];
  const cStraw = a => [cStraw, a * 2];
  assert.stringEqual(
    run(
      compose(
        bStraw,
        cStraw
      ),
      [1, 2, 3, 4]
    ),
    [6, 12, 18, 24]
  );
  assert.stringEqual(
    run(
      compose(
        cStraw,
        bStraw,
        cStraw
      ),
      [1, 2, 3, 4]
    ),
    [12, 24, 36, 48]
  );
  assert.stringEqual(
    run(
      compose(
        compose(
          bStraw,
          cStraw
        ),
        bStraw
      ),
      [1, 2, 3, 4]
    ),
    [18, 36, 54, 72]
  );
}

export const split = (...straws) =>
  of((vals, time, event, emit) => {
    const results = vals.map((v, i) => straws[i](v, time, event, emit));
    const newStraws = results.map(([a]) => a);
    const newVals = results.map(([_, a]) => a);
    return [split(...newStraws), newVals];
  });

{
  const assert = test("split");
  const fStraw = a => [fStraw, a * 2];
  const gStraw = a => [gStraw, a * 3];
  const hStraw = ([a, b]) => [hStraw, [a + 1, b - 1]];
  assert.stringEqual(split(fStraw, gStraw)([2, 2])[1], [4, 6]);
  assert.stringEqual(split(fStraw, gStraw, gStraw)([2, 2, 2])[1], [4, 6, 6]);
  assert.stringEqual(
    run(split(fStraw, gStraw), [[1, 1], [2, 2], [3, 3], [4, 4]]),
    [[2, 3], [4, 6], [6, 9], [8, 12]]
  );
  assert.stringEqual(
    run(
      compose(
        hStraw,
        split(fStraw, gStraw)
      ),
      [[1, 1], [2, 2], [3, 3], [4, 4]]
    ),
    [[3, 2], [5, 5], [7, 8], [9, 11]]
  );
}

export const fanout = (...straws) =>
  compose(
    split(...straws),
    fn(val => straws.map(() => val))
  );

{
  const assert = test("Test: fanout");
  const iStraw = a => [iStraw, a * 2];
  const jStraw = a => [jStraw, a * 3];
  const kStraw = a => [kStraw, a * 4];
  assert.stringEqual(fanout(iStraw, jStraw)(2)[1], [4, 6]);
  assert.stringEqual(fanout(iStraw, jStraw)(2)[1], [4, 6]);
  assert.stringEqual(fanout(iStraw, jStraw, kStraw)(2)[1], [4, 6, 8]);
}

export const accum = (f, acc) =>
  of((val, time, event, emit) => {
    const [acc1, output] = f(acc, val, time, event, emit);
    return [accum(f, acc1), output];
  });

export const accum1 = (f, acc) =>
  accum((acc, val, time, event, emit) => {
    const b1 = f(acc, val, time, event, emit);
    return [b1, b1];
  }, acc);

{
  const assert = test("accum, accum1");
  const impoliteSumCounter = accum(
    ([a, c], b) => [
      [a + b, c + 1],
      a < 10 ? "Back off " + (c + 2) + " times!" : a + b
    ],
    [0, 0]
  );
  assert.stringEqual(run(impoliteSumCounter, [3, 1, 4, 5, 14, 2]), [
    "Back off 2 times!",
    "Back off 3 times!",
    "Back off 4 times!",
    "Back off 5 times!",
    27,
    29
  ]);
  const sum = accum1((a, b) => a + b, 0);
  assert.stringEqual(run(sum, [3, 5, 9, 0, 14, 2]), [3, 8, 17, 17, 31, 33]);
}

export const isStraw = val =>
  typeof val === "function" && val[STRAW_KEY] === STRAW_VALUE;

export const constantify = val => (isStraw(val) ? val : constant(val));

export const holdWhen = (condition, straw) =>
  accum(
    ([straw, acc], val, time, event, emit) => {
      const [newStraw, result] = straw(val, time, event, emit);
      return condition(acc, result, time, event, emit)
        ? [[newStraw, result], result]
        : [[newStraw, acc], acc];
    },
    [straw]
  );
export const holdFirst = straw => holdWhen((acc, val) => !acc, straw);
export const hold = straw => holdWhen((acc, val) => val, straw);

{
  const assert = test("hold");
  assert.stringEqual(
    run(holdWhen((acc, val) => val % 2 === 0, id), [
      null,
      1,
      null,
      2,
      3,
      4,
      5,
      6
    ]),
    [null, null, null, 2, 2, 4, 4, 6]
  );
  assert.stringEqual(
    run(holdFirst(id), [null, 1, null, 3, null, null, null, 5, 6]),
    [null, 1, 1, 1, 1, 1, 1, 1, 1]
  );
  assert.stringEqual(
    run(hold(id), [null, 1, null, 3, null, null, null, 5, 6]),
    [null, 1, 1, 3, 3, 3, 3, 5, 6]
  );
}

export const take = (n, straw) =>
  accum(
    ([straw, acc], val, time, event, emit) => {
      if (acc === 0) return [[straw, acc]];
      const [newStraw, newVal] = straw(val, time, event, emit);
      return [[newStraw, acc - 1], newVal];
    },
    [straw, n]
  );
export const once = straw => take(1, straw);

{
  const assert = test("take");
  assert.stringEqual(run(take(2, id), [1, 2, 3, 4, 5]), [
    1,
    2,
    null,
    null,
    null
  ]);
  assert.stringEqual(
    run(take(3, accum1((acc, val) => acc + val, 0)), [1, 2, 3, 4, 5]),
    [1, 3, 6, null, null]
  );
  assert.stringEqual(
    run(once(accum1((acc, val) => acc + val, 0)), [1, 2, 3, 4, 5]),
    [1, null, null, null, null]
  );
}

export const reduce = (f, base, straws) =>
  of((val, time, event, emit) => {
    const [newStraws, newVal] = straws.reduce(
      ([straws, acc], straw) => {
        const [newStraw, newVal] = f(acc, straw, val, time, event, emit);
        return [straws.concat(newStraw), newVal];
      },
      [[], base]
    );
    return [reduce(f, base, newStraws), newVal];
  });

{
  const assert = test("reduce");
  const reducer = (acc, straw, val, time, event, emit) => {
    const [newStraw, newVal] = straw(val, time, event, emit);
    return [newStraw, newVal + acc];
  };
  assert.stringEqual(
    run(reduce(reducer, 0, [constant(1), constant(2), constant(3), id]), [
      1,
      2,
      3,
      4,
      5
    ]),
    [7, 8, 9, 10, 11]
  );
}

export const and = (...straws) =>
  reduce(
    (acc, straw, val, time, event, emit) => {
      if (!acc) return [straw, acc];
      const [newStraw, newVal] = straw(val, time, event, emit);
      return [newStraw, acc && newVal];
    },
    true,
    straws
  );

export const or = (...straws) =>
  reduce(
    (acc, straw, val, time, event, emit) => {
      if (acc) return [straw, acc];
      const [newStraw, newVal] = straw(val, time, event, emit);
      return [newStraw, acc || newVal];
    },
    false,
    straws
  );

export const not = straw =>
  of((val, time, event, emit) => {
    const [newStraw, newVal] = straw(val, time, event, emit);
    return [not(newStraw), !newVal];
  });

{
  const assert = test("and, or, not");
  assert.equal(and(constant(true), constant(true))()[1], true);
  assert.equal(and(constant(true), constant(false))()[1], false);
  assert.equal(and(constant(false), constant(false))()[1], false);
  assert.equal(and(constant(true), constant(true), constant(true))()[1], true);
  assert.equal(or(constant(true), constant(true))()[1], true);
  assert.equal(or(constant(true), constant(false))()[1], true);
  assert.equal(or(constant(false), constant(false))()[1], false);
  assert.equal(or(constant(true), constant(false), constant(true))()[1], true);
  assert.equal(not(constant(true))()[1], false);
}

export const when = (...args) =>
  of((val, time, event, registerEvent) => {
    const indexedArgs = args.map((val, i) => [val, i]);
    const conditions = indexedArgs.filter(([val, i]) => i % 2 === 0);
    let newArgs = args.slice();
    for (let i = 0; i < conditions.length; i++) {
      const [condition, conditionArgIndex] = conditions[i];
      const [conditionStraw, conditionVal] = condition(
        val,
        time,
        event,
        registerEvent
      );
      if (!conditionVal) {
        newArgs = newArgs
          .slice(0, conditionArgIndex)
          .concat(conditionStraw)
          .concat(newArgs.slice(conditionArgIndex + 1));
        continue;
      }
      const result = args[conditionArgIndex + 1];
      const [resultStraw, resultVal] = result(val, time, event, registerEvent);
      newArgs = newArgs
        .slice(0, conditionArgIndex)
        .concat([conditionStraw, resultStraw])
        .concat(newArgs.slice(conditionArgIndex + 2));
      return [when(...newArgs), resultVal];
    }
    return [when(...newArgs), null];
  });

{
  const assert = test("when");
  const ageCheck = when(
    fn(v => v < 18),
    constant("minor"),
    fn(v => v === 18),
    constant("18"),
    fn(v => v > 18),
    constant("adult")
  );
  assert.stringEqual(run(ageCheck, [1, 3, 15, 18, 22, 98]), [
    "minor",
    "minor",
    "minor",
    "18",
    "adult",
    "adult"
  ]);
}
