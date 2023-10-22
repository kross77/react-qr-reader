import { useEffect, useRef } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';
import { isMediaDevicesSupported, isValidType } from "./helpers/utils.js"; // TODO: add support for debug logs

export const useQrReader = ({
  scanDelay: delayBetweenScanAttempts,
  constraints: video,
  onResult,
  videoId
}) => {
  const controlsRef = useRef(null);
  useEffect(() => {
    const codeReader = new BrowserQRCodeReader(null, {
      delayBetweenScanAttempts
    });

    if (!isMediaDevicesSupported() && isValidType(onResult, 'onResult', 'function')) {
      const message = 'MediaDevices API has no support for your browser. You can fix this by running "npm i webrtc-adapter"';
      onResult(null, new Error(message), codeReader);
    }

    if (isValidType(video, 'constraints', 'object')) {
      codeReader.decodeFromConstraints({
        video
      }, videoId, (result, error) => {
        if (isValidType(onResult, 'onResult', 'function')) {
          onResult(result, error, codeReader);
        }
      }).then(controls => controlsRef.current = controls).catch(error => {
        if (isValidType(onResult, 'onResult', 'function')) {
          onResult(null, error, codeReader);
        }
      });
    }

    return () => {
      var _controlsRef$current;

      (_controlsRef$current = controlsRef.current) === null || _controlsRef$current === void 0 ? void 0 : _controlsRef$current.stop();
    };
  }, []);
};