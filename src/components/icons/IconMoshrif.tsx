import React from 'react';

interface IconMoshrifProps {
  size?: number | string;
  rounded?: boolean;
}

export default function IconMoshrif({ size = 168, rounded = true }: IconMoshrifProps) {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;
  return (
    <div
      style={{
        width: pixelSize,
        height: pixelSize,
        backgroundColor: '#2117FB',
        borderRadius: rounded ? '9999px' : '0',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-label="Moshrif Logo"
    >
      <svg width="70%" height="70%" viewBox="0 0 168 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 101.553V73.9885C32 68.9949 36.429 65 41.8423 65H67.2681C70.4395 65 71.9705 65.6991 73.5562 67.9462L80.3365 77.3342C82.633 80.5301 87.7729 80.5301 90.0147 77.3342L96.7949 67.9462C98.3806 65.749 99.9663 65 103.083 65H126.158C131.626 65 136 69.0448 136 73.9885V95.0115C136 100.005 131.571 104 126.158 104H109.535C104.067 104 99.693 99.9552 99.693 95.0115C99.693 89.7682 92.2019 87.7209 89.0305 92.1152L83.1798 100.305C81.1567 103.101 79.2976 104 75.1966 104H64.0967C59.9411 104 58.1367 103.101 56.1136 100.305L50.1535 92.0154C46.9821 87.621 39.4911 89.6684 39.4911 94.9116V101.553C39.4911 103.351 38.7802 104 36.8118 104H34.734C32.7655 104 32.0547 103.351 32.0547 101.553H32Z" fill="white"/>
      </svg>
    </div>
  );
}
