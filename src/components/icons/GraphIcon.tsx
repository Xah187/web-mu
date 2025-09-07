import React from 'react';

interface GraphIconProps {
  width?: number;
  height?: number;
  fill?: string;
}

export default function GraphIcon({ width = 109, height = 44, fill = '#2117FB' }: GraphIconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 109 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.5482 27.5529C10.3932 27.5529 3.14794 35.4683 1 40.5294V43H108V5.29705C98.1447 7.71619 86.2783 -3.7566 79.3728 3.36235C72.8026 10.1356 74.382 16.8168 59.193 17.3066C44.004 17.7964 35.7281 27.5529 30.0965 28.9182C25.5922 30.0102 21.9921 27.5529 15.5482 27.5529Z" fill={fill} />
    </svg>
  );
}
