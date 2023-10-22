export type GetImageDataParams = {
    /**
     * The resolution of the video (or image in legacyMode). Larger resolution will increase the accuracy but it will also slow down the processing time.
     */
    resolution: number;
    /**
     * The video from where to capture the image to use with the canvas
     */
    preview: HTMLVideoElement;
    /**
     * The canvas where the QR image is rendered to get ImageData
     */
    canvas: HTMLCanvasElement;
};
export declare const getImageData: ({ resolution, preview, canvas, }: GetImageDataParams) => Promise<ImageData | null>;
