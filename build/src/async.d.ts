import { FEvent, EmitEvent } from './core';
interface PromiseFn {
    (val: any, time: number, event: FEvent, emit: EmitEvent): Promise<any>;
}
export declare const promise: (func: PromiseFn) => import("./core").Straw;
export {};
