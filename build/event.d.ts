import { FEvent } from './core';
export declare const event: import("./core").Straw;
export declare const emit: (targetEvent: any) => import("./core").Straw;
export declare const on: ({ type, ref, id }: FEvent, transformer?: (FEvent: any) => any) => import("./core").Straw;
export declare const beforeEvent: (targetEvent: FEvent) => any;
export declare const afterEvent: (targetEvent: FEvent) => any;
export declare const betweenEvents: (eventStart: FEvent, eventEnd: FEvent) => any;
