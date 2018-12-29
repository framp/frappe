import { run, constant, accum, compose, hold, Straw } from './core'
import { on } from './event'
import test from './test' // {test}

export interface DynamicDriver {
  new: () => any
  remove: (id: any) => (list: any) => any
  add: (id: any, val: any) => (list: any) => any
}

export interface DynamicActions {
  add?: Straw
  remove?: Straw
}

/**
 * An array-like driver for `dynamicStructure` that store data in a JavaScript Array.
 */
export const arrayDriver = {
  /**
   * Function used to return an initial value
   *
   * @returns an empty Array
   */
  new: () => [],
  /**
   * Function used to remove an element from the Array.
   *
   * @param id an index to delete in the Array
   * @returns an Array with the element at the `id` index removed
   */
  remove: (id: number) => array =>
    array.slice(0, id).concat(array.slice(id + 1)),
  /**
   * Function used to add an element to the Array.
   *
   * If `id` is not provided the element will be added at the end of the Array.
   *
   * @param id the index where the new element will be inserted
   * @param val a value to insert
   * @returns an Array with `val` inserted at the `id` index
   */
  add: (id: number, val: any) => array => {
    if (typeof id === 'undefined') {
      return array.concat(val)
    }
    return array.slice(0, id).concat(val, array.slice(id + 1))
  }
}
/**
 * A map-like driver for `dynamicStructure` that store data in a JavaScript Object.
 */
export const mapDriver = {
  /**
   * Function used to return an initial value
   *
   * @returns an empty Object
   */
  new: () => ({}),
  /**
   * Function used to remove an element from the Object.
   *
   * @param id a key to delete in the Object
   * @returns an Object with the element at the `id` key removed
   */
  remove: id => map => {
    const copy = { ...map }
    delete copy[id]
    return copy
  },
  /**
   * Function used to add an element to the Object.
   *
   * @param id the key where the new element will be inserted
   * @param val a value to insert in the Object
   * @returns an Object with `val` inserted at the `id` key
   */
  add: (id, val) => map => ({
    ...map,
    [id]: val
  })
}

/**
 * It creates a `Straw` that will maintain state, adding and removing elements, by reading data from provided `actions` `Straws`.
 *
 * It uses a provided driver to manage state.
 *
 * If you're looking for a battery-included solution check out `dynamicArray` and `dynamicMap`.
 *
 * @param driver an Object providing the `new`, `remove`, `add` functions
 * @param {DynamicActions} actions an Object providing an `add` and `remove` `Straws`
 * @returns a `Straw` that will retunr the current state
 */
export const dynamicStructure = (driver: DynamicDriver) => ({
  add = constant(false),
  remove = constant(false)
}: DynamicActions = {}) =>
  accum(
    ([add, remove, acc], val, time, event, emit) => {
      const [newAdd, addTriggered] = add(val, time, event, emit)
      const [newRemove, removeTriggered] = remove(val, time, event, emit)
      const actions = [
        removeTriggered &&
          typeof removeTriggered.id !== 'undefined' &&
          driver.remove(removeTriggered.id),
        addTriggered && driver.add(addTriggered.id, val)
      ].filter(Boolean)
      const newAcc = actions.reduce((acc, fn) => fn(acc), acc)
      return [[newAdd, newRemove, newAcc], newAcc]
    },
    [add, remove, driver.new()]
)

/**
 * It creates a `Straw` that will maintain state, adding and removing elements, by reading data from provided `actions` `Straws`.
 *
 * Items will be inserted and removed into an Array.
 *
 * @param {DynamicActions} actions an Object providing an `add` and `remove` `Straws`
 * @returns a `Straw` that will retunr the current state
 */
export const dynamicArray = (actions: DynamicActions) =>
  dynamicStructure(arrayDriver)(actions)
/**
 * It creates a `Straw` that will maintain state, adding and removing elements, by reading data from provided `actions` `Straws`.
 *
 * Items will be inserted and removed into an Object.
 *
 * @param {DynamicActions} actions an Object providing an `add` and `remove` `Straws`
 * @returns a `Straw` that will return the current state
 */
export const dynamicMap = (actions: DynamicActions) =>
  dynamicStructure(mapDriver)(actions)

// {test
{
  const assert = test('dynamicStructure')
  const list = compose(
    dynamicArray({
      add: on({ type: 'click', ref: 'submit' }),
      remove: on({ type: 'click', ref: 'delete-button' })
    }),
    hold(on({ type: 'input', ref: 'input' }, event => event.data.target.value))
  )
  const emitFakeSpy = () => () => null
  assert.stringEqual(
    run(
      list,
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      [],
      [
        null,
        { type: 'click', ref: 'submit' },
        { type: 'input', ref: 'input', data: { target: { value: 'Bill' } } },
        null,
        { type: 'click', ref: 'submit' },
        null,
        { type: 'click', ref: 'delete-button', id: 0 },
        {
          type: 'input',
          ref: 'input',
          data: { target: { value: 'O-Ren Ishii' } }
        },
        { type: 'click', ref: 'submit' },
        { type: 'click', ref: 'delete-button', id: 1 }
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
      [null, 'Bill'],
      [null, 'Bill'],
      ['Bill'],
      ['Bill'],
      ['Bill', 'O-Ren Ishii'],
      ['Bill']
    ]
  )
  const map = compose(
    dynamicMap({
      add: on({ type: 'click', ref: 'edit-button' }),
      remove: on({ type: 'click', ref: 'delete-button' })
    }),
    hold(on({ type: 'input', ref: 'input' }, event => event.data.target.value))
  )
  assert.stringEqual(
    run(
      map,
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      [],
      [
        null,
        { type: 'click', ref: 'edit-button', id: 'void' },
        { type: 'input', ref: 'input', data: { target: { value: 'Bill' } } },
        null,
        { type: 'click', ref: 'edit-button', id: 'boss' },
        null,
        { type: 'click', ref: 'delete-button', id: 'void' },
        {
          type: 'input',
          ref: 'input',
          data: { target: { value: 'O-Ren Ishii' } }
        },
        { type: 'click', ref: 'edit-button', id: 'geisha' },
        { type: 'click', ref: 'delete-button', id: 'geisha' }
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
      {},
      {},
      {},
      {},
      { boss: 'Bill' },
      { boss: 'Bill' },
      { boss: 'Bill' },
      { boss: 'Bill' },
      { boss: 'Bill', geisha: 'O-Ren Ishii' },
      { boss: 'Bill' }
    ]
  )
}
// test}
