import styles from "./styles.js";
import React, { useRef } from 'react';
import { useQrReader } from "./hooks/useQrReader.js";
export const QrReader = ({
  constraints,
  facingMode,
  resolution,
  ViewFinder,
  className,
  onError,
  onScan,
  onLoad,
  style,
  debug
}) => {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  useQrReader({
    callbacks: [onLoad, onScan, onError],
    refs: [canvasRef, videoRef],
    constraints,
    facingMode,
    resolution,
    debug
  });
  return /*#__PURE__*/React.createElement("section", {
    className: className,
    style: style
  }, /*#__PURE__*/React.createElement("section", {
    style: styles.container
  }, !!ViewFinder && /*#__PURE__*/React.createElement(ViewFinder, null), /*#__PURE__*/React.createElement("video", {
    muted: true,
    ref: videoRef,
    style: { ...styles.videoPreview,
      transform: facingMode === 'user' && 'scaleX(-1)'
    }
  }), /*#__PURE__*/React.createElement("canvas", {
    ref: canvasRef,
    style: styles.hidden
  })));
};
QrReader.displayName = 'QrReader';
QrReader.defaultProps = {
  resolution: 600,
  constraints: null,
  facingMode: 'environment'
};
export default QrReader;