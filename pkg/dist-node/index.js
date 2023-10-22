'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);
var useworker = require('@koale/useworker');

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }

  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

var styles = {
  container: {
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    paddingTop: '100%'
  },
  hidden: {
    display: 'none'
  },
  videoPreview: {
    top: 0,
    left: 0,
    display: 'block',
    position: 'absolute',
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: undefined
  }
};

const getDeviceId = async facingMode => {
  let videoInputDevices = await navigator.mediaDevices.enumerateDevices();
  videoInputDevices = videoInputDevices.filter(deviceInfo => deviceInfo.kind === 'videoinput');

  if (videoInputDevices.length < 1) {
    throw new Error('No video input devices found');
  }

  const regex = facingMode === 'environment' ? /rear|back|environment/gi : /front|user|face/gi;
  const devices = await Promise.all(videoInputDevices.filter(videoDevice => regex.test(videoDevice.label)).map(async videoDevice => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: {
            exact: videoDevice.deviceId
          }
        }
      });
      stream.getVideoTracks().forEach(track => {
        track.getCapabilities();
        track.getSettings();
      });
      stream.getTracks().forEach(track => track.stop());
      return {
        deviceId: videoDevice.deviceId,
        streamError: false
      };
    } catch (err) {
      return {
        deviceId: videoDevice.deviceId,
        streamError: true
      };
    }
  }));
  const [device] = devices.filter(device => !device.streamError);

  if (!device) {
    throw new Error('No video input devices found');
  }

  return device.deviceId;
};
const decodeQR = ({
  data,
  width,
  height
}) => {
  // eslint-disable-next-line no-restricted-globals
  const decoded = self.jsQR(data, width, height, {
    inversionAttempts: 'attemptBoth'
  });

  try {
    return JSON.parse(decoded === null || decoded === void 0 ? void 0 : decoded.data);
  } catch (err) {
    return decoded === null || decoded === void 0 ? void 0 : decoded.data;
  }
};

const getImageData = async ({
  resolution,
  preview,
  canvas
}) => new Promise(resolve => {
  if (!preview || !canvas) {
    resolve(null);
  }

  if (preview.readyState === preview.HAVE_ENOUGH_DATA) {
    // Get image/video dimensions
    let width = Math.floor(preview.videoWidth);
    let height = Math.floor(preview.videoHeight); // Canvas draw offsets

    let hozOffset = 0;
    let vertOffset = 0; // Crop image to fit 1:1 aspect ratio

    const smallestSize = width < height ? width : height;
    const ratio = resolution / smallestSize;
    height = ratio * height;
    width = ratio * width;
    vertOffset = (height - resolution) / 2 * -1;
    hozOffset = (width - resolution) / 2 * -1;
    canvas.width = resolution;
    canvas.height = resolution;
    const ctx = canvas.getContext('2d', {
      alpha: false
    });
    ctx.imageSmoothingEnabled = false; // gives less blurry images

    ctx.drawImage(preview, hozOffset, vertOffset, width, height);
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    resolve(image);
  } else {
    resolve(null);
  }
});

const getVideoStream = async ({
  facingMode,
  constraints,
  resolution
}) => {
  var _navigator, _navigator2, _navigator2$mediaDevi; // Check browser facingMode constraint support
  // Firefox ignores facingMode or deviceId constraints


  const isFirefox = /firefox/i.test((_navigator = navigator) === null || _navigator === void 0 ? void 0 : _navigator.userAgent);
  const supportedConstraints = (_navigator2 = navigator) === null || _navigator2 === void 0 ? void 0 : (_navigator2$mediaDevi = _navigator2.mediaDevices) === null || _navigator2$mediaDevi === void 0 ? void 0 : _navigator2$mediaDevi.getSupportedConstraints();
  const defaultConstraints = {
    width: {
      min: resolution
    }
  };

  if (supportedConstraints !== null && supportedConstraints !== void 0 && supportedConstraints.facingMode) {
    defaultConstraints.facingMode = {
      ideal: facingMode
    };
  }

  if (supportedConstraints !== null && supportedConstraints !== void 0 && supportedConstraints.frameRate) {
    defaultConstraints.frameRate = {
      ideal: 25,
      min: 10
    };
  }

  let video = null;

  if (supportedConstraints.facingMode || isFirefox) {
    video = constraints || defaultConstraints;
  } else {
    const deviceId = await getDeviceId(facingMode);
    video = _objectSpread2(_objectSpread2({}, {
      deviceId
    }), constraints);
  }

  return await navigator.mediaDevices.getUserMedia({
    video
  });
};
const prepareVideoStream = async ({
  preview,
  stream
}) => new Promise((resolve, reject) => {
  try {
    if (!preview || !stream) {
      resolve();
    }

    window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

    if ('srcObject' in preview) {
      preview.srcObject = stream;
    } else if ('mozSrcObject' in preview) {
      preview.mozSrcObject = stream;
    } else {
      preview.src = window.URL && window.URL.createObjectURL(stream) || stream;
    } // IOS play in fullscreen


    preview.setAttribute('playsInline', true);
    resolve();
  } catch (err) {
    reject(err);
  }
});

const clearPreview = preview => {
  if (preview) {
    preview.pause();
    preview.mozSrcObject = null;
    preview.srcObject = null;
    preview.src = '';
  }
};
const clearStreams = streams => {
  const pc = new RTCPeerConnection();
  streams.forEach(stream => {
    if (stream.stop) {
      // Legacy way for older browsers
      stream.stop && stream.stop();
      pc.addStream && pc.addStream(stream);
    } else {
      // New way for modern browsers
      stream.getTracks().forEach(track => {
        track.enabled = !track.enabled;
        track.stop();
        pc.addTrack(track, stream);
      });
    }
  });
};
const clearFrames = cancelIds => {
  cancelIds.forEach(window.cancelAnimationFrame);
};

const JSQR = 'https://cdn.jsdelivr.net/npm/jsqr@1.2.0/dist/jsQR.min.js';
const useQrReader = ({
  callbacks: [onLoad, onScan, onError],
  refs: [canvas, preview],
  constraints,
  facingMode,
  resolution,
  debug
}) => {
  const cancelIds = React.useRef([]);
  const streams = React.useRef([]); // eslint-disable-next-line no-unused-vars

  const [decodeQrImage, {
    kill: clearWorker
  }] = useworker.useWorker(decodeQR, {
    remoteDependencies: [JSQR],
    autoTerminate: false
  });

  const tryQrScan = async () => {
    try {
      const data = await getImageData({
        preview: preview.current,
        canvas: canvas.current,
        resolution
      });
      debug && debug(data, 'raw_data');

      if (!data) {
        throw '[QrReader]: error while trying to decode value';
      }

      const decoded = await decodeQrImage(data);

      if (typeof onScan === 'function') {
        debug && debug(decoded, 'value');
        onScan(decoded);
      }
    } catch (err) {
      if (typeof onError === 'function') {
        debug && debug(err, 'error');
        onError(err);
      }
    } finally {
      const cancelID = window.requestAnimationFrame(tryQrScan);
      cancelIds.current.push(cancelID);
    }
  };

  const initQrScan = async () => {
    try {
      const stream = await getVideoStream({
        constraints,
        resolution,
        facingMode
      });
      streams.current.push(stream);
      await prepareVideoStream({
        preview: preview.current,
        stream
      });
      await preview.current.play();

      if (typeof onLoad === 'function') {
        debug && debug(stream, 'load');
        onLoad(stream);
      }

      const cancelID = window.requestAnimationFrame(tryQrScan);
      cancelIds.current.push(cancelID);
    } catch (err) {
      if (typeof onError === 'function') {
        debug && debug(err, 'error');
        onError(err);
      }
    }
  };

  React.useEffect(() => {
    const clearId = setTimeout(initQrScan, 500);
    return () => {
      clearWorker();
      clearTimeout(clearId);
      clearFrames(cancelIds.current);
      clearPreview(preview.current);
      clearStreams(streams.current);
    }; // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

const QrReader = ({
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
  const canvasRef = React.useRef(null);
  const videoRef = React.useRef(null);
  useQrReader({
    callbacks: [onLoad, onScan, onError],
    refs: [canvasRef, videoRef],
    constraints,
    facingMode,
    resolution,
    debug
  });
  return /*#__PURE__*/React__default.createElement("section", {
    className: className,
    style: style
  }, /*#__PURE__*/React__default.createElement("section", {
    style: styles.container
  }, !!ViewFinder && /*#__PURE__*/React__default.createElement(ViewFinder, null), /*#__PURE__*/React__default.createElement("video", {
    muted: true,
    ref: videoRef,
    style: _objectSpread2(_objectSpread2({}, styles.videoPreview), {}, {
      transform: facingMode === 'user' && 'scaleX(-1)'
    })
  }), /*#__PURE__*/React__default.createElement("canvas", {
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

exports.QrReader = QrReader;
//# sourceMappingURL=index.js.map
