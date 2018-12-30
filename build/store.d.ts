import { Straw } from './core';
export interface DynamicDriver {
    new: () => any;
    remove: (id: any) => (list: any) => any;
    add: (id: any, val: any) => (list: any) => any;
}
export interface DynamicActions {
    add?: Straw;
    remove?: Straw;
}
/**
 * An array-like driver for `dynamicStructure` that store data in a JavaScript Array.
 */
export declare const arrayDriver: {
    /**
     * Function used to return an initial value
     *
     * @returns an empty Array
     */
    new: () => any[];
    /**
     * Function used to remove an element from the Array.
     *
     * @param id an index to delete in the Array
     * @returns an Array with the element at the `id` index removed
     */
    remove: (id: number) => (array: any) => any;
    /**
     * Function used to add an element to the Array.
     *
     * If `id` is not provided the element will be added at the end of the Array.
     *
     * @param id the index where the new element will be inserted
     * @param val a value to insert
     * @returns an Array with `val` inserted at the `id` index
     */
    add: (id: number, val: any) => (array: any) => any;
};
/**
 * A map-like driver for `dynamicStructure` that store data in a JavaScript Object.
 */
export declare const mapDriver: {
    /**
     * Function used to return an initial value
     *
     * @returns an empty Object
     */
    new: () => {};
    /**
     * Function used to remove an element from the Object.
     *
     * @param id a key to delete in the Object
     * @returns an Object with the element at the `id` key removed
     */
    remove: (id: any) => (map: any) => any;
    /**
     * Function used to add an element to the Object.
     *
     * @param id the key where the new element will be inserted
     * @param val a value to insert in the Object
     * @returns an Object with `val` inserted at the `id` key
     */
    add: (id: any, val: any) => (map: any) => any;
};
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
export declare const dynamicStructure: (driver: DynamicDriver) => ({ add, remove }?: DynamicActions) => any;
/**
 * It creates a `Straw` that will maintain state, adding and removing elements, by reading data from provided `actions` `Straws`.
 *
 * Items will be inserted and removed into an Array.
 *
 * @param {DynamicActions} actions an Object providing an `add` and `remove` `Straws`
 * @returns a `Straw` that will retunr the current state
 */
export declare const dynamicArray: (actions: DynamicActions) => any;
/**
 * It creates a `Straw` that will maintain state, adding and removing elements, by reading data from provided `actions` `Straws`.
 *
 * Items will be inserted and removed into an Object.
 *
 * @param {DynamicActions} actions an Object providing an `add` and `remove` `Straws`
 * @returns a `Straw` that will return the current state
 */
export declare const dynamicMap: (actions: DynamicActions) => any;
