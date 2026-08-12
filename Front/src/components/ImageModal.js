/* import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllImages } from '@/lib/store/imageSlice';
import Modal from './Modal';
import Image from 'next/image';
import Link from 'next/link';

const ImageModal = ({ isOpen, onClose, token, distCode, index }) => {
  const dispatch = useDispatch();
  const [pageNumber, setPageNumber] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(index || 0); // Local index state
  const pageSize = 10;

  const { attachments: images, status: imageStatus, totalPages } = useSelector((state) => ({
    attachments: state.attachments.attachments,
    status: state.attachments.status,
    totalPages: state.attachments.totalPages,
  }));

  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setPageNumber(1); // Reset to the first page
      setCurrentIndex(index || 0); // Reset to the initial index
      dispatch(fetchAllImages({ token, pageNumber: 1, pageSize, distCode }));
    }
  }, [isOpen, dispatch, token, distCode, index]);

  useEffect(() => {
    if (pageNumber > 1) {
      dispatch(fetchAllImages({ token, pageNumber, pageSize, distCode }));
    }
  }, [pageNumber, dispatch, token, distCode]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
    } else if (pageNumber > 1) {
      setPageNumber((prevPage) => prevPage - 1);
      setCurrentIndex(pageSize - 1); // Move to the last image of the previous page
    }
  }, [currentIndex, pageNumber]);

  const handleNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    } else if (pageNumber < totalPages) {
      setPageNumber((prevPage) => prevPage + 1);
      setCurrentIndex(0); // Move to the first image of the next page
    }
  }, [currentIndex, images.length, pageNumber, totalPages]);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'ArrowLeft') {
      handlePrev();
    } else if (event.key === 'ArrowRight') {
      handleNext();
    } else if (event.key === 'Escape') {
      onClose();
    }
  }, [handlePrev, handleNext, onClose]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      modalRef.current.focus(); // Focus the modal to capture key events
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  const image = images[currentIndex] || null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div
        ref={modalRef}
        tabIndex="0"
        onKeyDown={handleKeyDown}
        className="flex flex-col items-center justify-center h-full p-4"
      >
        {image ? (
          <div className="flex flex-col items-center mb-4">
            <Image
              src={`data:image/jpeg;base64,${image.imageDataBase64}`}
              alt={image.imageStandardName}
              layout="intrinsic"
              width={900}
              height={700}
              className="object-contain"
            />
            <p className="mt-2 text-lg font-semibold">{image.imageStandardName}</p>
            <Link href={`/photo/${image.visitID}`} className="mt-2 text-blue-600">
              View Details
            </Link>
          </div>
        ) : (
          imageStatus === 'loading' && <p>در حال بارگذاری...</p>
        )}
        <div className="flex justify-between w-full mt-4">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0 && pageNumber === 1}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 disabled:opacity-50"
          >
            قبلی
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex >= images.length - 1 && pageNumber === totalPages}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 disabled:opacity-50"
          >
            بعدی
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ImageModal; */


import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllImages } from '@/lib/store/imageSlice';
import Modal from './Modal';
import Image from 'next/image';
import Link from 'next/link';

const ImageModal = ({ isOpen, onClose, token, distCode, index }) => {
  const dispatch = useDispatch();
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  const { attachments: images, status: imageStatus, totalPages } = useSelector((state) => ({
    attachments: state.attachments.attachments,
    status: state.attachments.status,
    totalPages: state.attachments.totalPages,
  }));

  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setPageNumber(1); // Reset to first page
      dispatch(fetchAllImages({ token, pageNumber: 1, pageSize, distCode }));
    }
  }, [isOpen, dispatch, token, distCode]);

  useEffect(() => {
    if (pageNumber > 1) {
      dispatch(fetchAllImages({ token, pageNumber, pageSize, distCode }));
    }
  }, [pageNumber, dispatch, token, distCode]);

  const handlePrev = useCallback(() => {
    if (index === 0 && pageNumber > 1) {
      setPageNumber(pageNumber - 1); // Load previous page
    }
  }, [pageNumber, index]);

  const handleNext = useCallback(() => {
    if (index >= images.length - 1 && pageNumber < totalPages) {
      setPageNumber(pageNumber + 1); // Load next page
    }
  }, [images.length, pageNumber, totalPages, index]);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'ArrowLeft') {
      handlePrev();
    } else if (event.key === 'ArrowRight') {
      handleNext();
    } else if (event.key === 'Escape') {
      onClose();
    }
  }, [handlePrev, handleNext, onClose]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      modalRef.current.focus(); // Focus the modal to capture key events
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  const image = images[index] || null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div
        ref={modalRef}
        tabIndex="0"
        onKeyDown={handleKeyDown}
        className="flex flex-col items-center justify-center h-full p-4"
      >
        {image ? (
          <div className="flex flex-col items-center mb-4">
            <Image
              src={`data:image/jpeg;base64,${image.imageDataBase64}`}
              alt={image.imageStandardName}
              layout="intrinsic"
              width={900}
              height={700}
              className="object-contain"
            />
            <p className="mt-2 text-lg font-semibold">{image.imageStandardName}</p>
            <Link href={`/photo/${image.visitID}`} className="mt-2 text-blue-600">
              View Details
            </Link>
          </div>
        ) : (
          imageStatus === 'loading' && <p>در حال بارگذاری...</p>
        )}
        <div className="flex justify-between w-full mt-4">
          <button
            onClick={handlePrev}
            disabled={index === 0 && pageNumber === 1}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 disabled:opacity-50"
          >
            قبلی
          </button>
          <button
            onClick={handleNext}
            disabled={index >= images.length - 1 && pageNumber === totalPages}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 disabled:opacity-50"
          >
            بعدی
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ImageModal;
