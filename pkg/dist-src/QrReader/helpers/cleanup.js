export const clearPreview = preview => {
  if (preview) {
    preview.pause();
    preview.mozSrcObject = null;
    preview.srcObject = null;
    preview.src = '';
  }
};
export const clearStreams = streams => {
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
export const clearFrames = cancelIds => {
  cancelIds.forEach(window.cancelAnimationFrame);
};