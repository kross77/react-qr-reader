import { getDeviceId } from "./utils.js";
export const getVideoStream = async ({
  facingMode,
  constraints,
  resolution
}) => {
  var _navigator, _navigator2, _navigator2$mediaDevi;

  // Check browser facingMode constraint support
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
    video = { ...{
        deviceId
      },
      ...constraints
    };
  }

  return await navigator.mediaDevices.getUserMedia({
    video
  });
};
export const prepareVideoStream = async ({
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