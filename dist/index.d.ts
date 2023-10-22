import React from 'react';

type OnScanFunction = (decoded: any) => void;
type OnLoadFunction = (stream: MediaStream) => void;
type OnErrorFunction = (err: Error) => void;
type DebugDataTypes = 'raw_data' | 'load' | 'value' | 'error';
type DebugFunction = (data: any, type: DebugDataTypes) => void;

type QrReaderProps = {
    /**
     * The camera to use, especify 'user' for front camera or 'environment' for back camera.
     */
    facingMode: VideoFacingModeEnum;
    /**
     * The resolution of the video (or image in legacyMode). Larger resolution will increase the accuracy but it will also slow down the processing time.
     */
    resolution: number;
    /**
     * ClassName for the container element.
     */
    className?: string;
    /**
     * Use custom camera constraints that the override default behavior.
     */
    constraints?: MediaTrackConstraintSet;
    /**
     * Called when an error occurs.
     */
    onError?: OnErrorFunction;
    /**
     * Scan event handler. Called every scan with the decoded value or null if no QR code was found.
     */
    onScan?: OnScanFunction;
    /**
     * Called when the component is ready for use.
     */
    onLoad?: OnLoadFunction;
    /**
     * Styling for the container element. Warning The preview will always keep its 1:1 aspect ratio.
     */
    style?: any;
    /**
     * Function that takes a context and gives you the choice to log
     */
    debug?: DebugFunction;
    /**
     * Property that represents the view finder component
     */
    ViewFinder: (props: any) => React.ReactElement<any, any> | null;
};
declare const QrReader: React.FunctionComponent<QrReaderProps>;

export { QrReader, QrReaderProps };
