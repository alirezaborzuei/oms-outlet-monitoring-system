// components/CloseIcon.js
import React from 'react';

const CloseIcon = ({ size = 24, color = 'black', onClick }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    onClick={onClick}
    className="cursor-pointer"
  >
    <path d="M19.293 6.707a1 1 0 00-1.414 0L12 11.586 6.121 5.707a1 1 0 00-1.414 1.414L10.586 13 4.707 18.879a1 1 0 001.414 1.414L12 14.414l5.879 5.879a1 1 0 001.414-1.414L13.414 13l5.879-5.879a1 1 0 000-1.414z"/>
  </svg>
);

export default CloseIcon;
