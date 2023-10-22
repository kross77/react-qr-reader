import { useWorker } from '@koale/useworker';
import { useEffect, useRef } from 'react';
import { decodeQR } from "../helpers/utils.js";
import { getImageData } from "../helpers/image.js";
import { getVideoStream, prepareVideoStream } from "../helpers/video.js";
import { clearFrames, clearPreview, clearStreams } from "../helpers/cleanup.js";
const JSQR = 'https://cdn.jsdelivr.net/npm/jsqr@1.2.0/dist/jsQR.min.js';
export const useQrReader = ({
  callbacks: [onLoad, onScan, onError],
  refs: [canvas, preview],
  constraints,
  facingMode,
  resolution,
  debug
}) => {
  const cancelIds = useRef([]);
  const streams = useRef([]); // eslint-disable-next-line no-unused-vars

  const [decodeQrImage, {
    kill: clearWorker
  }] = useWorker(decodeQR, {
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

  useEffect(() => {
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