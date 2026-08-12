"use client";

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPhotos } from '../lib/store/photoStatusSlice';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const PhotoList = () => {
  const dispatch = useDispatch();
  const photos = useSelector(state => state.photo.photos);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const pathname = usePathname();

  const musterino = pathname.split('/').pop();

  useEffect(() => {
    if (musterino) {
      dispatch(fetchPhotos(musterino));
    }
  }, [dispatch, musterino]);

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
  };

  if (photos.length === 0) {
    return null;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">عکس‌های ارسال شده:</h2>
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {photos.map(photo => (
        
          <li
            key={photo.attachmentID}
            onClick={() => handlePhotoClick(photo)}
            className="cursor-pointer border rounded-lg overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105"
          >
            <Image
              src={`data:image/jpeg;base64,${photo.imageDataBase64}`}
              alt="Uploaded"
              width={200}
              height={200}
              className="object-cover"
            />
            <p className="text-center mt-2 text-sm font-medium">{photo.flow}</p>
          </li>
        ))}
      </ul>

      {selectedPhoto && (
        <div className="p-4 bg-white shadow-lg rounded-lg mt-6">
          <h3 className="text-xl font-bold mb-4">جزئیات عکس</h3>
          {/* <p className="mb-2"><strong>تاریخ آپلود:</strong> {new Date(selectedPhoto.imageUploadDate).toLocaleString()}</p> */}
          {/* <p className="mb-2"><strong>نام استاندارد تصویر:</strong> {selectedPhoto.imageStandardName}</p> */}
          <p className="mb-2"><strong>نام سرپرست:</strong> {selectedPhoto.supervisorApprover}</p>
          <p className="mb-2"><strong>تأییدیه سرپرست:</strong> {selectedPhoto.supervisorApproval}</p>
          <p className="mb-2"><strong>نظر سرپرست:</strong> {selectedPhoto.supervisorComment}</p>
          {/* <p className="mb-2"><strong>تاریخ عمل سرپرست:</strong> {new Date(selectedPhoto.supervisorActionDateTime).toLocaleString()}</p> */}
          <p className="mb-2"><strong>نام مرچ:</strong> {selectedPhoto.MerchApprover}</p>
          <p className="mb-2"><strong>تأییدیه مرچ:</strong> {selectedPhoto.merchApproval}</p>
          {/* <p className="mb-2"><strong>نظر مرچ:</strong> {selectedPhoto.merchComment}</p> */}
          {/* <p className="mb-2"><strong>دسته‌بندی:</strong> {selectedPhoto.category}</p> */}
          <p className="mb-2"><strong>جریان:</strong> {selectedPhoto.flow}</p>
          {/* <p className="mb-2"><strong>عرض جغرافیایی:</strong> {selectedPhoto.lat}</p> */}
          {/* <p className="mb-2"><strong>طول جغرافیایی:</strong> {selectedPhoto.long}</p> */}
          {/* <p className="mb-2"><strong>تاریخ عمل مرچ:</strong> {new Date(selectedPhoto.merchActionDateTime).toLocaleString()}</p> */}
        </div>
      )}
    </div>
  );
};

export default PhotoList;
