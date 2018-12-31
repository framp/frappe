declare const _default: (description: string) => ((a: any) => never) & {
    stringEqual: (a: any, b: any) => void;
    equal: (a: any, b: any) => void;
    fail: (message?: string) => never;
};
export default _default;
