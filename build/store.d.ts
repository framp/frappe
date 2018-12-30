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
export declare const arrayDriver: {
    new: () => any[];
    remove: (id: number) => (array: any) => any;
    add: (id: number, val: any) => (array: any) => any;
};
export declare const mapDriver: {
    new: () => {};
    remove: (id: any) => (map: any) => any;
    add: (id: any, val: any) => (map: any) => any;
};
export declare const dynamicStructure: (driver: DynamicDriver) => ({ add, remove }?: DynamicActions) => any;
export declare const dynamicArray: (actions: DynamicActions) => any;
export declare const dynamicMap: (actions: DynamicActions) => any;
