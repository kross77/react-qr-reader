export const styles: any = {
  container: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  video: {
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'block',
    overflow: 'hidden',
    position: 'absolute',
    transform: undefined,
    objectFit: 'cover',
  },
  viewFinder: {
    top: 0,
    left: 0,
    zIndex: 1,
    boxSizing: 'border-box',
    border: '50px solid rgba(0, 0, 0, 0.3)',
    boxShadow: 'inset 0 0 0 5px rgba(255, 0, 0, 0.5)',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
};
