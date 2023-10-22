import * as React from 'react';

import { styles } from './styles';
import { useQrReader } from './hooks';

import { QrReaderProps } from '../types';

export const QrReader: React.FC<QrReaderProps> = ({
  videoContainerStyle,
  containerStyle,
  videoStyle,
  constraints,
  showViewFinder,
  scanDelay,
  className,
  onResult,
  videoId,
  viewFinderColor,
  viewFinderStrokeWidth,
}) => {
  useQrReader({
    constraints,
    scanDelay,
    onResult,
    videoId,
  });

  return (
    <section className={className} style={containerStyle}>
      <section style={styles.container}>
        <div
          style={{
            height: '100%',
            width: '100%',
            overflow: 'hidden',
            position: 'static',
          }}
        >
          {showViewFinder && (
            <svg
              width="50px"
              viewBox="0 0 100 100"
              style={styles.viewFinder as any}
            >
              <path
                fill="none"
                d="M13,0 L0,0 L0,13"
                stroke={viewFinderColor}
                strokeWidth={viewFinderStrokeWidth}
              />
              <path
                fill="none"
                d="M0,87 L0,100 L13,100"
                stroke={viewFinderColor}
                strokeWidth={viewFinderStrokeWidth}
              />
              <path
                fill="none"
                d="M87,100 L100,100 L100,87"
                stroke={viewFinderColor}
                strokeWidth={viewFinderStrokeWidth}
              />
              <path
                fill="none"
                d="M100,13 L100,0 87,0"
                stroke={viewFinderColor}
                strokeWidth={viewFinderStrokeWidth}
              />
            </svg>
          )}
          <video
            muted
            id={videoId}
            style={{
              ...styles.video,
              ...videoStyle,
              transform: constraints?.facingMode === 'user' && 'scaleX(-1)',
            }}
          />
        </div>
      </section>
    </section>
  );
};

QrReader.displayName = 'QrReader';
QrReader.defaultProps = {
  constraints: {
    facingMode: 'user',
  },
  videoId: 'video',
  scanDelay: 500,
};
