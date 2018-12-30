import { FEvent, EmitEvent } from './core';
interface PromiseFn {
    (val: any, time: number, event: FEvent, emit: EmitEvent): Promise<any>;
}
/**
 * It accepts a promise returning function `func` and return a `Straw` that will execute `func` and fire a `promise-resolve` event on success or a `promise-error` event on failure.
 * The emitted event will use the returned `Straw` as a ref.
 * @param func promise returning function
 * @returns Straw that will call `func` when run
 */
export declare const promise: (func: PromiseFn) => import("./core").Straw;
export {};
