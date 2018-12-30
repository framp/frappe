/// <reference types="node" />
import React from 'react';
import { Straw, FEvent } from './core';
interface ReactRunnerStrategy {
    mount: (update: (FEvent: any) => void) => any;
    unmount: (id: any) => void;
}
interface ReactRunnerProps {
    straw: Straw;
    options: {
        updateStrategies: Array<ReactRunnerStrategy>;
        verbose: boolean;
    };
}
interface ReactRunnerState {
    straw: [Straw, React.Component];
    strategies: Array<ReactRunnerStrategy>;
    start?: number;
}
export declare class ReactRunner extends React.Component<ReactRunnerProps, ReactRunnerState> {
    constructor(props: ReactRunnerProps);
    componentDidMount(): void;
    strawUpdate(event: FEvent): void;
    emitEvent(event: FEvent): (data: any) => void;
    strawExec(straw: Straw, time: number, event: FEvent): [Straw, any];
    render(): React.Component<{}, {}, any>;
    componentWillUnmount(): void;
}
export declare const timeStrategy: (time: number) => {
    mount: (update: any) => NodeJS.Timeout;
    unmount: (id: any) => void;
};
export declare const animationFrameStrategy: () => {
    mount: (update: any) => number;
    unmount: (id: any) => void;
};
export declare const listenOn: (event: FEvent | FEvent[], straw: Straw) => Straw;
export {};
