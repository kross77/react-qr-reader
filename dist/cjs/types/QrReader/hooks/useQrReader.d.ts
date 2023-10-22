import { MutableRefObject } from 'react';
export type UseQrReaderHook = (props: UseQrReaderHookProps) => UseQrReaderHookReturnType;
export type UseQrReaderHookReturnType = void;
export type UseQrReaderRefs = [
    MutableRefObject<HTMLCanvasElement>,
    MutableRefObject<HTMLVideoElement>
];
export type UseQrReaderCallbacks = [
    OnLoadFunction,
    OnScanFunction,
    OnErrorFunction
];
export type OnScanFunction = (decoded: any) => void;
export type OnLoadFunction = (stream: MediaStream) => void;
export type OnErrorFunction = (err: Error) => void;
export type DebugDataTypes = 'raw_data' | 'load' | 'value' | 'error';
export type DebugFunction = (data: any, type: DebugDataTypes) => void;
export type UseQrReaderHookProps = {
    /**
     * The camera to use, especify 'user' for front camera or 'environment' for back camera.
     */
    facingMode?: VideoFacingModeEnum;
    /**
     * The resolution of the video (or image in legacyMode). Larger resolution will increase the accuracy but it will also slow down the processing time.
     */
    resolution?: number;
    /**
     * Use custom camera constraints that the override default behavior.
     */
    constraints?: MediaTrackConstraintSet;
    /**
     * Refs of the elements that the components will render
     */
    refs?: UseQrReaderRefs;
    /**
     * Callbacks that the hook uses
     */
    callbacks?: UseQrReaderCallbacks;
    /**
     * It enables debug logs to see what's going on with the QrReader
     */
    debug?: DebugFunction;
};
export declare const useQrReader: UseQrReaderHook;
