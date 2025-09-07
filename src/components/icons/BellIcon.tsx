import React from 'react';

interface BellIconProps {
  count?: number;
  size?: number;
  stroke?: string;
}

export default function BellIcon({ count = 0, size = 22, stroke = '#7e879a' }: BellIconProps) {
  return (
    <div className="relative inline-flex">
      <svg width={size} height={(size * 19) / 22} viewBox="0 0 22 19" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.52992 13.394C1.31727 14.7471 2.268 15.6862 3.43205 16.1542C7.89481 17.9486 14.1052 17.9486 18.5679 16.1542C19.732 15.6862 20.6827 14.7471 20.4701 13.394C20.3394 12.5625 19.6932 11.8701 19.2144 11.194C18.5873 10.2975 18.525 9.3197 18.5249 8.27941C18.5249 4.2591 15.1559 1 11 1C6.84413 1 3.47513 4.2591 3.47513 8.27941C3.47503 9.3197 3.41272 10.2975 2.78561 11.194C2.30684 11.8701 1.66061 12.5625 1.52992 13.394Z" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ position: 'absolute', left: size * 0.27, top: (size * 19) / 22 * 0.7 }}>
        <svg width={size * 0.45} height={(size * 0.45) / 2} viewBox={`0 0 ${size * 0.45} ${(size * 0.45) / 2}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1C1.79613 1.6219 2.8475 2 4 2C5.1525 2 6.2039 1.6219 7 1" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {count > 0 && (
        <div style={{ position: 'absolute', top: '-20%', right: '-10%' }}>
          <svg width={17} height={17} viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="5.5" cy="5.5" r="5.5" fill="#2117FB" />
          </svg>
          <span style={{ position: 'absolute', top: '-2px', right: '-2px', fontSize: 8, fontWeight: 700, color: '#f4f4f4' }}>
            {String(count).length > 2 ? `${String(count).slice(0, 1)}+` : count}
          </span>
        </div>
      )}
    </div>
  );
}
