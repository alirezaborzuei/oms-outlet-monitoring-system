 "use client";
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { fetchPhotosByVisit } from '../../../lib/store/photoStatusSlice';
import { fetchVisit, updateVisit } from '../../../lib/store/visitsSlice';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Layout from '@/components/Layout';
import AuthWrapper from '@/components/AuthWrapper';
import swal from 'sweetalert';
import Modal from '@/components/Modal'; // Import Modal component
import { API } from '@/config';

const PhotoDetail = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const visitID = pathname.split('/').pop();
  const photos = useSelector(state => state.photo.photos);
  const token = useSelector(state => state.auth.token);
  const username = useSelector(state => state.auth.user);
  const role = useSelector(state => state.auth.role);
  const [visitInfo, setVisitInfo] = useState(null);
  const [photoStates, setPhotoStates] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [comments, setComments] = useState({});
  const [Score, setScore] = useState({});
  const [visitApproved, setVisitApproved] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const flowDisplayMap = {
    '': 'بازدید نشده',
   /*  'Draft': 'در انتظار تأیید فروشنده', */
    'Supervisor': 'در انتظار تأیید سرپرست فروش',
    'Specialist': 'در انتظار تأیید کارشناس آموزش و مرچندایزینگ',
    'Finished': 'تمام شده',
    'Rejected by Supervisor': 'رد شده توسط سرپرست فروش',
    'Rejected by Specialist': 'رد شده توسط کارشناس آموزش و مرچندایزینگ',
  };
  
  useEffect(() => {
    if (token && visitID) {
      dispatch(fetchPhotosByVisit({ token, visitID })).then((response) => {
        setPhotoStates(response.payload.map(photo => ({
          ...photo,
          supervisorComment: photo.supervisorComment || '',
          merchComment: photo.merchComment || ''
        })));
        dispatch(fetchVisit({ token, VID: visitID })).then((response) => {
          setVisitInfo(response.payload);
        });
      });
    } 
  }, [dispatch, token, visitID]);

  const handleCommentChange = (attachmentID, comment) => {
    setComments(prevComments => ({
      ...prevComments,
      [attachmentID]: comment
    }));
  };

  const handleScoreChange = (attachmentID, score) => {
    setScore(prevScores => ({
       ...prevScores,
       [attachmentID]: score
    }));
 };
 

  const handlePhotoApproval = async (attachmentID, approvalStatus) => {
    const updatedPhoto = photoStates.find(photo => photo.attachmentID === attachmentID);

    if (role === 'Specialist') {
      updatedPhoto.merchApproval = approvalStatus;
      updatedPhoto.merchComment = comments[attachmentID] || '';
      updatedPhoto.merchApprover = username.sub;
      updatedPhoto.merchActionDateTime = new Date().toISOString();
      updatedPhoto.flow = approvalStatus === 'Approved' ? 'Finished' : `Rejected by Specialist`;
    } else if (role === 'LDAPUser' && updatedPhoto.flow === 'Supervisor') {
      updatedPhoto.supervisorApproval = approvalStatus;
      updatedPhoto.supervisorComment = comments[attachmentID] || '';
      updatedPhoto.supervisorApprover = username.sub;
      updatedPhoto.supervisorActionDateTime = new Date().toISOString();
      updatedPhoto.flow = approvalStatus === 'Approved' ? 'Specialist' : `Rejected by Supervisor`;
    }
    try {
      // Replace with your API URL
      const url = `${API}/attachment`;
      await axios.put(url, updatedPhoto, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPhotoStates(photoStates.map(photo =>
        photo.attachmentID === attachmentID ? updatedPhoto : photo
      ));
      swal("Success", "تایید شد.","success")
      closeModal();
    } catch (error) {
      console.error("Failed to update photo approval", error);
      swal("Error", `Failed to update photo approval: ${error.message}`, "error");
    }
  };

  const handleVisitApproval = async (approvalStatus) => {
    const isSupervisorStep = photoStates.some(photo => photo.flow === 'Supervisor');
      if (isSupervisorStep) {
      swal("Error", "Cannot approve visit while photos are in Supervisor step.", "error");
      return;
       }
    try {
      let data;
      // Set visit approval status
      setVisitApproved(approvalStatus);

    if(role==='LDAPUser' ){
    data = {
        visitID: visitInfo.visitID,
        supervisorApproval: approvalStatus,
        supervisorComment: comments['visit'] || '',
        supervisorApprover: username.sub,
        supervisorActionDateTime: new Date().toISOString(),
        photoStates: photoStates,
        flow:approvalStatus === 'Approved' ? 'Specialist' : `Rejected by Supervisor`,
      };
      }

  if (role=='Specialist'){

  data = {
    visitID: visitInfo.visitID,
    merchApproval: approvalStatus,
    merchComment: comments['visit'] || '',
    merchApprover: username.sub,
    merchActionDateTime: new Date().toISOString(),
    photoStates: photoStates,
    flow:approvalStatus === 'Approved' ? 'Finished' : `Rejected by Specialist`,
    score: Score['visit'] || '',
 
  };  }
console.log(data)
  swal(data)
      await dispatch(updateVisit({ token,visitID, data })).unwrap();
      swal("Success", "Visit approval updated successfully", "success").then(() => {
        dispatch(fetchVisit({ token, visitID })).then((response) => {
          setVisitInfo(response.payload);
        });
      });
    } catch (error) {
      console.error("Visit approval failed", error);
      swal("Error", `Visit approval failed: ${error.message}`, "error");
    }
  };
  const handleBack = () => {
    router.back();
  };

  const openModal = (photo) => {
    setSelectedPhoto(photo);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPhoto(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return ''; // یا متن دیگری مثل 'تاریخ در دسترس نیست'
    }
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
  
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  };

  if (!photoStates || photoStates.length === 0) {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  return (
   
  <Layout>
      <AuthWrapper>
        <div className="max-w-4xl mx-auto px-4 py-8" style={{ direction: 'rtl' }}>
          <div className="mb-8">


            {visitInfo && (
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-2xl font-semibold mb-6 text-right">اطلاعات ویزیت</h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                    <p className="font-medium text-right"><strong>شماره بازدید:</strong></p>
                    <p className="text-right">{visitInfo.visitID}</p>

                    <p className="font-medium text-right"><strong>تاریخ بازدید:</strong></p>
                    <p className="text-right">{formatDate(visitInfo.visitDate)}</p>

                    <p className="font-medium text-right"><strong>کد SUH:</strong></p>
                    <p className="text-right">{visitInfo.suhCode}</p>

                    <p className="font-medium text-right"><strong>کد مشتری:</strong></p>
                    <p className="text-right">{visitInfo.customerCode}</p>

                    <p className="font-medium text-right"><strong>جریان:</strong></p>
                    <p className="text-right">{flowDisplayMap[visitInfo.flow]}</p>
                  
                    <p className="font-medium text-right"><strong>نام سرپرست فروش:</strong></p>
                    <p className="text-right">{visitInfo.supervisorApprover}</p>

                    <p className="font-medium text-right"><strong>وضعیت سرپرست فروش:</strong></p>
                    <p className="text-right">{visitInfo.supervisorApproval}</p> 

                    <p className="font-medium text-right"><strong>نظر سرپرست فروش:</strong></p>
                    <p className="text-right">{visitInfo.supervisorComment}</p>    
                    
                    <p className="font-medium text-right"><strong>تاریخ تایید سرپرست فروش:</strong></p>
                    <p className="text-right">{ formatDate(visitInfo.supervisorActionDateTime)}</p>

                    <p className="font-medium text-right"><strong>نام کارشناس آموزش و مرچندایزینگ:</strong></p>
                    <p className="text-right">{visitInfo.merchApprover}</p>

                    <p className="font-medium text-right"><strong>وضعیت کارشناس آموزش و مرچندایزینگ:</strong></p>
                    <p className="text-right">{visitInfo.merchApproval}</p>

                    <p className="font-medium text-right"><strong>نظر کارشناس آموزش و مرچندایزینگ:</strong></p>
                    <p className="text-right">{visitInfo.merchComment}</p>   
                    
                    <p className="font-medium text-right"><strong>تاریخ تایید کارشناس آموزش و مرچندایزینگ:</strong></p>
                    <p className="text-right">{formatDate(visitInfo.merchActionDateTime)}</p>


                  </div>
                </div>
              </div>
            )}
          </div>

          {visitInfo && ((role === 'LDAPUser' && visitInfo.flow==='Supervisor')) && (
            <div className={`bg-gray-100 p-6 rounded-lg shadow-md mb-8 ${photoStates.some(photo => photo.flow === 'Supervisor') ? 'hidden' : ''}`}>
              <h3 className="text-2xl font-semibold mb-4 text-right">تایید کلی ویزیت</h3>
              <textarea
                placeholder="نظر کلی خود را در مورد ویزیت بنویسید..."
                value={comments['visit'] || ''}
                onChange={(e) => handleCommentChange('visit', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded mb-4 text-right rtl"
                rows="4"
              />
              <div className="flex justify-between">
                <button
                  onClick={() => handleVisitApproval('Approved')}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                >
                  تایید ویزیت
                </button>
                <button
                  onClick={() => handleVisitApproval('Rejected')}
                  className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
                >
                  رد ویزیت
                </button>
              </div>
            </div>
          )} 
          
          {visitInfo && role === 'Specialist' && visitInfo.flow === 'Specialist' && !photoStates.some(photo => photo.flow === 'Specialist') &&(
  <div className={`bg-gray-100 p-6 rounded-lg shadow-md mb-8 ${photoStates.some(photo => photo.flow === 'Supervisor') ? 'hidden' : ''}`}>
    <h3 className="text-2xl font-semibold mb-4 text-right">تایید کلی ویزیت</h3>
    <textarea
      placeholder="نظر کلی خود را در مورد ویزیت بنویسید..."
      value={comments['visit'] || ''}
      onChange={(e) => handleCommentChange('visit', e.target.value)}
      className="w-full p-3 border border-gray-300 rounded mb-4 text-right rtl"
      rows="4"
    />
    
    <label className="block mb-2 text-lg font-medium text-right">امتیاز دهی:</label>
    <input
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none 	cursor-pointer"
      type="range"
      min="0"
      max="100"
      onChange={(e) => handleScoreChange('visit', e.target.value)}
      value={Score['visit'] || 50}  // مقدار امتیاز ثابت
      
    />
    <div className="text-right text-gray-600 mb-4">امتیاز فعلی: {Score['visit'] || 50}</div>
    
    <div className="flex justify-between">
      <button
        onClick={() => handleVisitApproval('Approved')}
        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
      >
        تایید ویزیت
      </button>
      <button
        onClick={() => handleVisitApproval('Rejected')}
        className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
      >
        رد ویزیت
      </button>
    </div>
  </div>
)}


          <h2 className="text-2xl font-semibold mb-6 text-right">عکس‌های ارسال شده:</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {photoStates.map(photo => (
              <li
                key={photo.attachmentID}
                className="relative cursor-pointer border rounded-lg overflow-hidden shadow-lg transition-transform transform hover:scale-105 rtl"
                onClick={() => openModal(photo)}
              >
                <Image
                  src={`data:image/jpeg;base64,${photo.imageDataBase64}`}
                  alt="Uploaded"
                  width={200}
                  height={200}
                  className="object-cover"
                />
                <div className="p-2">
                  <p className="text-sm font-medium text-right">{flowDisplayMap[photo.flow]}</p>
               {/*    <p className="text-xs text-gray-600 text-right">{photo.supervisorApprover}</p>
                  <p className="text-xs text-gray-600 text-right">{photo.merchApproval}</p> */}
                </div>
              </li>
            ))}
          </ul>

          <Modal isOpen={isModalOpen} onClose={closeModal}>
  {selectedPhoto && (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="relative max-w-full max-h-full overflow-auto bg-white rounded-lg shadow-lg">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-white bg-red-600 hover:bg-red-700 rounded-full p-2"
        >
          ✕
        </button>
        <div className="flex justify-center mb-6">
          <Image
            src={`data:image/jpeg;base64,${selectedPhoto.imageDataBase64}`}
            alt="Selected"
            layout="intrinsic"
            width={1280} // عرض واقعی تصویر
            height={720} // ارتفاع واقعی تصویر
            className="object-contain"
          />
        </div>
        <h3 className="text-3xl font-bold text-center mb-6">جزئیات تصویر</h3>
        <div className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <p className="font-medium text-lg text-right"><strong>جریان:</strong></p>
              <p className="text-gray-700 text-right">{flowDisplayMap[selectedPhoto.flow]}</p>

              <p className="font-medium text-lg text-right"><strong>نام سرپرست فروش:</strong></p>
              <p className="text-gray-700 text-right">{selectedPhoto.supervisorApprover}</p> 
              
              <p className="font-medium text-lg text-right"><strong>وضعیت سرپرست فروش:</strong></p>
              <p className="text-gray-700 text-right">{selectedPhoto.supervisorApproval}</p> 
              
              <p className="font-medium text-lg text-right"><strong>نظر سرپرست فروش:</strong></p>
              <p className="text-gray-700 text-right">{selectedPhoto.supervisorComment}</p>
                
              <p className="font-medium text-lg text-right"><strong>تاریخ تایید سرپرست فروش:</strong></p>
              <p className="text-gray-700 text-right">
                {formatDate(selectedPhoto.supervisorActionDateTime)}
              </p>
              
              <p className="font-medium text-lg text-right"><strong>نام کارشناس آموزش و مرچندایزینگ:</strong></p>
              <p className="text-gray-700 text-right">{selectedPhoto.merchApprover}</p>


              <p className="font-medium text-lg text-right"><strong>وضعیت کارشناس آموزش و مرچندایزینگ:</strong></p>
              <p className="text-gray-700 text-right">{selectedPhoto.merchApproval}</p>  
              
              <p className="font-medium text-lg text-right"><strong>نظر کارشناس آموزش و مرچندایزینگ:</strong></p>
              <p className="text-gray-700 text-right">{selectedPhoto.merchComment}</p>

              <p className="font-medium text-lg text-right"><strong>تاریخ تایید کارشناس آموزش و مرچندایزینگ:</strong></p>
              <p className="text-gray-700 text-right">
              {formatDate(selectedPhoto.merchActionDateTime)}
              </p>

            </div>

            {(selectedPhoto.flow === 'Supervisor' && role === 'LDAPUser') && (
              <div className="mt-6">
                <textarea
                  placeholder="نظر خود را در مورد این تصویر بنویسید..."
                  value={comments[selectedPhoto.attachmentID] || ''}
                  onChange={(e) => handleCommentChange(selectedPhoto.attachmentID, e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg text-right mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                />
                <div className="flex justify-between">
                  <button
                    onClick={() => handlePhotoApproval(selectedPhoto.attachmentID, 'Approved')}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                    disabled={visitInfo.flow === 'Supervisor' && role !== 'LDAPUser'}
                  >
                    تایید تصویر
                  </button>
                  <button
                    onClick={() => handlePhotoApproval(selectedPhoto.attachmentID, 'Rejected')}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                    disabled={visitInfo.flow === 'Supervisor' && role !== 'LDAPUser'}
                  >
                    رد تصویر
                  </button>
                </div>
              </div>
            )}

            {(selectedPhoto.flow === 'Specialist' && role === 'Specialist') && (
              <div className="mt-6">
                <textarea
                  placeholder="نظر خود را در مورد این تصویر بنویسید..."
                  value={comments[selectedPhoto.attachmentID] || ''}
                  onChange={(e) => handleCommentChange(selectedPhoto.attachmentID, e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg text-right mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                />
                <div className="flex justify-between">
                  <button
                    onClick={() => handlePhotoApproval(selectedPhoto.attachmentID, 'Approved')}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                  >
                    تایید تصویر
                  </button>
                  <button
                    onClick={() => handlePhotoApproval(selectedPhoto.attachmentID, 'Rejected')}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                  >
                    رد تصویر
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )}
</Modal>


          <button
            onClick={handleBack}
            className="mt-6 bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
          >
            بازگشت
          </button>
        </div>
      </AuthWrapper>
    </Layout> 
  );
};
export default PhotoDetail; 
