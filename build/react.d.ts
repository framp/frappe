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
/**
 * It's a React component that will execute a `Straw` and render it.
 *
 * It will re-render every time there is a new event being triggered or whenever an update strategy fires.
 *
 */
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
/**
 * It accepts an `event` (or array of `events`) and a `Straw` returning a React element and return a `Straw` which returns the React element extended with the needed event listeners, setup using the `type` property of the `event`.
 *
 * The events will be plugged via `ReactRunner` into the application and will be available to all the `Straws`.
 *
 * @param event an event (or array of `event`) to listen for
 * @param straw a Straw returning a React element to extend with the listeners from `event`
 * @returns a `Straw` returning the React element from `straw` with the event listeners from event
 */
export declare const listenOn: (event: FEvent | FEvent[], straw: Straw) => Straw;
export {};
