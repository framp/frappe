import test from "./test";
import { run, constant, accum, compose, hold, Straw } from "./core";
import { on } from "./event";

export interface DynamicDriver {
  new: () => any;
  remove: (id: any) => (list: any) => any;
  add: (id: any, val: any) => (list: any) => any;
}

export interface DynamicActions {
  add?: Straw;
  remove?: Straw;
}

export const listDriver = {
  new: () => [],
  remove: id => list => list.slice(0, id).concat(list.slice(id + 1)),
  add: (id, val) => list => {
    if (typeof id === "undefined") {
      return list.concat(val);
    }
    return list.slice(0, id).concat(val, list.slice(id + 1));
  }
};
export const mapDriver = {
  new: () => {},
  remove: id => map => {
    const copy = { ...map };
    delete copy[id];
    return copy;
  },
  add: (id, val) => map => ({
    ...map,
    [id]: val
  })
};

export const dynamicStructure = (driver: DynamicDriver) => ({
  add = constant(false),
  remove = constant(false)
}: DynamicActions = {}) =>
  accum(
    ([add, remove, acc], val, time, event, emit) => {
      const [newAdd, addTriggered] = add(val, time, event, emit);
      const [newRemove, removeTriggered] = remove(val, time, event, emit);
      const actions = [
        removeTriggered &&
          typeof removeTriggered.id !== "undefined" &&
          driver.remove(removeTriggered.id),
        addTriggered && driver.add(addTriggered.id, val)
      ].filter(Boolean);
      const newAcc = actions.reduce((acc, fn) => fn(acc), acc);
      return [[newAdd, newRemove, newAcc], newAcc];
    },
    [add, remove, driver.new()]
  );

export const dynamicList = dynamicStructure(listDriver);
export const dynamicMap = dynamicStructure(mapDriver);

{
  const assert = test("dynamicStructure");
  const list = compose(
    dynamicList({
      add: on("click", "submit"),
      remove: on("click", "delete-button")
    }),
    hold(on("input", "input", event => event.data.target.value))
  );
  const emitFakeSpy = () => () => {};
  assert.stringEqual(
    run(
      list,
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      [],
      [
        null,
        { type: "click", ref: "submit" },
        { type: "input", ref: "input", data: { target: { value: "Bill" } } },
        null,
        { type: "click", ref: "submit" },
        null,
        { type: "click", ref: "delete-button", id: 0 },
        {
          type: "input",
          ref: "input",
          data: { target: { value: "O-Ren Ishii" } }
        },
        { type: "click", ref: "submit" },
        { type: "click", ref: "delete-button", id: 1 }
      ],
      [
        emitFakeSpy,
        emitFakeSpy,
        emitFakeSpy,
        emitFakeSpy,
        emitFakeSpy,
        emitFakeSpy,
        emitFakeSpy,
        emitFakeSpy,
        emitFakeSpy,
        emitFakeSpy,
        emitFakeSpy
      ]
    ),
    [
      [],
      [null],
      [null],
      [null],
      [null, "Bill"],
      [null, "Bill"],
      ["Bill"],
      ["Bill"],
      ["Bill", "O-Ren Ishii"],
      ["Bill"]
    ]
  );
  const map = compose(
    dynamicMap({
      add: on("click", "edit-button"),
      remove: on("click", "delete-button")
    }),
    hold(on("input", "input", event => event.data.target.value))
  );
  assert.stringEqual(
    run(
      map,
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      [],
      [
        null,
        { type: "click", ref: "edit-button", id: "void" },
        { type: "input", ref: "input", data: { target: { value: "Bill" } } },
        null,
        { type: "click", ref: "edit-button", id: "boss" },
        null,
        { type: "click", ref: "delete-button", id: "void" },
        {
          type: "input",
          ref: "input",
          data: { target: { value: "O-Ren Ishii" } }
        },
        { type: "click", ref: "edit-button", id: "geisha" },
        { type: "click", ref: "delete-button", id: "geisha" }
      ],
      [
        emitFakeSpy,
        emitFakeSpy,
        emitFakeSpy,
        emitFakeSpy,
        emitFakeSpy,
        emitFakeSpy,
        emitFakeSpy,
        emitFakeSpy,
        emitFakeSpy,
        emitFakeSpy,
        emitFakeSpy
      ]
    ),
    [
      null,
      {},
      {},
      {},
      { boss: "Bill" },
      { boss: "Bill" },
      { boss: "Bill" },
      { boss: "Bill" },
      { boss: "Bill", geisha: "O-Ren Ishii" },
      { boss: "Bill" }
    ]
  );
}
