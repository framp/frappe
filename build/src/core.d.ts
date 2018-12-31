export interface FEvent {
    type?: any;
    ref?: any;
    id?: any;
    data?: any;
}
export interface EmitEvent {
    (FEvent: any): (event: any) => void;
}
export interface Straw {
    (val?: any, time?: number, event?: FEvent, emit?: EmitEvent): [Straw, any];
    __type: 'Straw';
}
export declare const of: (func: (val?: any, time?: number, event?: FEvent, emit?: EmitEvent) => [Straw, any]) => Straw;
export declare const run: (straw: Straw, inputs: any[], times?: number[], events?: FEvent[], emits?: EmitEvent[]) => any[];
export declare const id: Straw;
export declare const constant: (val: any) => Straw;
export declare const fn: (func: (val?: any, time?: number, event?: FEvent, emit?: EmitEvent) => any) => Straw;
export declare const composeRight: (...straws: any[]) => any;
export declare const composeLeft: (...straws: any[]) => any;
export declare const compose: (...straws: any[]) => any;
export declare const split: (...straws: Straw[]) => any;
export declare const fanout: (...straws: Straw[]) => any;
export interface AccumStateFn {
    (acc: any, val: any, time: number, event: FEvent, emit: EmitEvent): [any, any];
}
export declare const accumState: (func: AccumStateFn, acc: any) => any;
export interface AccumFn {
    (acc: any, val: any, time: number, event: FEvent, emit: EmitEvent): any;
}
export declare const accum: (func: AccumFn, acc: any) => any;
export declare const isStraw: (val: any) => boolean;
export declare const constantify: (val: any) => Straw;
export interface HoldConditionFn {
    (acc: any, val: any, time: number, event: FEvent, emit: EmitEvent): boolean;
}
export declare const holdWhen: (condition: HoldConditionFn, straw: Straw) => any;
export declare const holdFirst: (straw: Straw) => any;
export declare const hold: (straw: Straw) => any;
export declare const take: (n: number, straw: Straw) => any;
export declare const once: (straw: Straw) => any;
export interface ReduceFn {
    (acc: any, straw: Straw, val: any, time: number, event: FEvent, emit: EmitEvent): [Straw, any];
}
export declare const reduce: (func: ReduceFn, acc: any, straws: Straw[]) => any;
export declare const and: (...straws: Straw[]) => any;
export declare const or: (...straws: Straw[]) => any;
export declare const not: (straw: Straw) => any;
export declare const when: (...args: Straw[]) => any;
