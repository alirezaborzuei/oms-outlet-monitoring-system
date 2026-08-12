// components/Modal.js
import React from 'react';
import CloseIcon from './CloseIcon'; // Import CloseIcon component

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 relative w-full h-full">
        <CloseIcon
          size={24}
          color="gray"
          onClick={onClose}
          className="absolute top-4 right-4"
        />
        <div className="h-full w-full overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;