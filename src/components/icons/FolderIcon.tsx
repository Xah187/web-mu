import React from 'react';

interface FolderIconProps {
  width?: number;
  height?: number;
}

export default function FolderIcon({ width = 23, height = 21 }: FolderIconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 23 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.058 4.85009L9.27727 3.22547C8.85637 2.84074 8.28539 2.625 7.68969 2.625H2.96484C2.12121 2.625 1.4375 3.24926 1.4375 4.01953V8.85938H9.33297H21.5625V6.65273C21.5625 5.88246 20.8788 5.2582 20.0352 5.2582H12.1379C11.7327 5.2582 11.3446 5.11137 11.058 4.85009Z" fill="#FFB02E" />
      <path d="M20.0352 19.6875H2.96484C2.12121 19.6875 1.4375 19.067 1.4375 18.3014V8.60488C1.4375 7.83923 2.12121 7.21875 2.96484 7.21875H20.0352C20.8788 7.21875 21.5625 7.83923 21.5625 8.60488V18.3014C21.5625 19.067 20.8788 19.6875 20.0352 19.6875Z" fill="#FCD53F" />
    </svg>
  );
}
