export type GetVideoStreamParams = {
    /**
     * Use custom camera constraints that the override default behavior.
     */
    constraints?: MediaTrackConstraintSet;
    /**
     * The camera to use, especify 'user' for front camera or 'environment' for back camera.
     */
    facingMode: VideoFacingModeEnum;
    /**
     * The resolution of the video (or image in legacyMode). Larger resolution will increase the accuracy but it will also slow down the processing time.
     */
    resolution?: number;
};
export declare const getVideoStream: ({ facingMode, constraints, resolution, }: GetVideoStreamParams) => Promise<MediaStream>;
export type PrepareVideoStreamParams = {
    /**
     * Video element to use for setting camera stream
     */
    preview: HTMLVideoElement | any;
    /**
     * Camera stream to setup in the video element
     */
    stream: MediaStream;
};
export declare const prepareVideoStream: ({ preview, stream, }: PrepareVideoStreamParams) => Promise<void>;
