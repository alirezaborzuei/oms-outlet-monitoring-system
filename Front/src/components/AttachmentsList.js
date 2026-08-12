import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAttachments } from '../lib/store/attachmentsSlice';
import { fetchItems } from '../lib/store/itemsSlice';
import Slider from "react-slick";
import axios from 'axios';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Image from 'next/image';
import { API } from '@/config';
import { useRouter } from 'next/navigation';
import PhotoList from './PhotoList';

const AttachmentsSlider = ({ musterino }) => {
  const dispatch = useDispatch();
  const attachments = useSelector((state) => state.attachments.attachments);
  const status = useSelector((state) => state.attachments.status);
  const error = useSelector((state) => state.attachments.error);
  const token = useSelector((state) => state.auth.token);
  const items = useSelector(state => state.items.items);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const router = useRouter();
  const username = useSelector(state => state.auth.user);
  const role = useSelector(state => state.auth.role);
  const [comments, setComments] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bulkApprovalStatus, setBulkApprovalStatus] = useState('Pending');
  const [bulkComment, setBulkComment] = useState('');
  const [visitID, setVisitID] = useState(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      dispatch(fetchItems(token, username));
    }
  }, [dispatch, isAuthenticated, token, username]);

  useEffect(() => {
    if (items.length > 0) {
      const visitItem = items.find(item => item.musterino === musterino);
      if (visitItem) {
        setVisitID(visitItem.visitID);
      }
    }
  }, [items, musterino]);

  useEffect(() => {
    if (musterino && token) {
      dispatch(fetchAttachments(token, musterino));
    }
  }, [dispatch, musterino, token]);

  const handleCommentChange = (attachmentID, comment) => {
    setComments(prevComments => ({
      ...prevComments,
      [attachmentID]: comment
    }));
  };

  const handleApproval = async (attachmentID, approvalStatus) => {
    try {
      let data;
      
      if (role === 'Specialist') {
        data = {
          attachmentID: attachmentID,
          merchApproval: approvalStatus,
          merchComment: comments[attachmentID] || '',
          merchApprover: username.sub,
          merchActionDateTime: new Date().toISOString(),
          flow: approvalStatus === 'Approved' ? 'Finished' : `Rejected by Specialist`
        };
      } else if (role === 'LDAPUser') {
        data = {
          attachmentID: attachmentID,
          supervisorApproval: approvalStatus,
          supervisorComment: comments[attachmentID] || '',
          supervisorApprover: username.sub,
          supervisorActionDateTime: new Date().toISOString(),
          flow: approvalStatus === 'Approved' ? 'Specialist' : `Rejected by Supervisor`
        };
      } else {
        alert("Role is not defined. Check with admin site.");
        return;
      }

      await axios.put(`${API}/Attachment`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      dispatch(fetchAttachments(token, musterino));
    } catch (error) {
      console.error("Approval failed", error);
      alert("Approval failed: " + error.message);
    }
  };

  const handleBulkApproval = async (approvalStatus) => {
    let data;

    try {
      if (role === 'Specialist') {
        data = {
          visitID: visitID,
          MerchApproval: approvalStatus,
          MerchComment: bulkComment,
          MerchApprover: username.sub,
          MerchActionDateTime: new Date().toISOString(),
          flow: approvalStatus === 'Approved' ? 'Finished' : 'Draft'
        };
      } else if (role === 'LDAPUser') {
        data = {
          visitID: visitID,
          supervisorApproval: approvalStatus,
          supervisorComment: bulkComment,
          supervisorApprover: username.sub,
          supervisorActionDateTime: new Date().toISOString(),
          MerchApproval: 'Pending',
          flow: approvalStatus === 'Approved' ? 'Specialist' : 'Draft'
        };
      }

  
      await dispatch(updateVisit({ token, visitID, data })).unwrap();
      
      swal("Success", "Visit updated successfully", "success").then(() => {
        router.back();
      });
    } catch (error) {
      swal("Error", `Update failed: ${error.message}`, "error");
    }
    
  };

  const handleBack = () => {
    router.back();
  };

  const pendingAttachments = attachments.filter(attachment => {
    if (role === 'LDAPUser') {
      return attachment.supervisorApproval === 'Pending';
    } else if (role === 'Specialist') {
      return attachment.merchApproval === 'Pending';
    }
    return false;
  });

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'failed') {
    return <div>Error: {error}</div>;
  }

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    beforeChange: (current, next) => setCurrentIndex(next)
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" style={{ direction: 'rtl' }}>
      <h2 className="text-3xl font-bold mb-4">تاییدیه</h2>

      {pendingAttachments.length > 0 ? (
        <Slider {...settings}>
          {pendingAttachments.map((attachment) => (
            <div key={attachment.attachmentID} className="p-4">
              <div className="shadow-lg rounded-lg overflow-hidden mb-4">
                <Image
                  src={`data:image/jpeg;base64,${attachment.imageDataBase64}`}
                  width={500}
                  height={500}
                  alt={attachment.imageStandardName}
                  className="w-full h-auto"
                />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {attachment.imageStandardName.split('_').pop()}
              </h3>
              <textarea
                placeholder="نظر خود را بنویسید..."
                value={comments[attachment.attachmentID] || ''}
                onChange={(e) => handleCommentChange(attachment.attachmentID, e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mb-4 text-right"
                rows="3"
              />
              <div className="flex justify-between space-x-2">
                <button
                  onClick={() => handleApproval(attachment.attachmentID, 'Approved')}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  تایید
                </button>
                <button
                  onClick={() => handleApproval(attachment.attachmentID, 'Rejected')}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  رد
                </button>
              </div>
              <br />
          <button
            onClick={handleBack}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
          >
            بازگشت
          </button>
            </div>
          ))}
        </Slider>
      ) : (
        <div>
          <textarea
            placeholder="نظر خود را بنویسید..."
            value={bulkComment}
            onChange={(e) => setBulkComment(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4 text-right"
            rows="3"
          />
          <div className="flex justify-between space-x-2">
            <button
              onClick={() => handleBulkApproval('Approved')}
              className="bg-green-500 text-white px-4 py-2 rounded mt-4"
            >
              تایید کلی
            </button>
            <button
              onClick={() => handleBulkApproval('Rejected')}
              className="bg-red-500 text-white px-4 py-2 rounded mt-4"
            >
              رد کلی
            </button>
          </div>
          <br />
          <button
            onClick={handleBack}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
          >
            بازگشت
          </button>
        </div>
      )}
      <br />
      <PhotoList />
    </div>
  );
};

export default AttachmentsSlider;
