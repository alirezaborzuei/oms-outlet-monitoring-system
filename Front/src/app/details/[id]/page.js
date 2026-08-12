
"use client";

import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { fetchVisits, selectVisitsByCustomer } from '@/lib/store/visitsSlice';
import { fetchItemId, createVisit, uploadFile, checkVisitStatus, clearVisitID } from '@/lib/store/itemSlice';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';

const CustomerDetail = ({ params }) => {
  const { id: musterino } = params;
  const dispatch = useDispatch();
  const router = useRouter();
  const token = useSelector(state => state.auth.token);
  const username = useSelector(state => state.auth.username);

  useEffect(() => {
    if (token && musterino) {
      
      dispatch(fetchVisits({ token, musterino }));
      dispatch(fetchItemId({ token, user: username, id: parseInt(musterino, 10) }));
    }
  }, [dispatch, token, musterino, username]);

  const visits = useSelector(state => selectVisitsByCustomer(state, musterino));
  const item = useSelector(state => state.item.selectedItem);
  const handleBack = () => {
  // incoreected
 //   router.push('/listSupervisor'); // هدایت به صفحه‌ی مورد نظر
 router.push(`/customer/${item.distkodu}`); // هدایت به صفحه‌ی مورد نظر 
};
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8" style={{ direction: 'rtl' }}>
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10" style={{ direction: 'rtl' }}>
          <h1 className="text-3xl font-bold mb-4">{item?.unvan}</h1>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold">گروه مشتری:</span>
              <span>{item?.pG4ADI}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">کد مشتری:</span>
              <span>{item?.musterino}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">کد شهر:</span>
              <span>{item?.distkodu}</span>
            </div>
          </div>

          <div className="mb-4 mt-4"> 
          <div className="mb-4 mt-4 flex justify-between space-x-4 rtl:space-x-reverse"> 

  
  <button
    onClick={handleBack}
    className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600"
  >
    بازگشت
  </button>
</div>

     {visits.length  >0  &&(
          <h2 className="text-2xl font-semibold mb-2">بازدیدها</h2>
     )
     
      }    
          <ul className="space-y-4">
            {visits.map(visit => (
              <li key={visit.visitID} className="p-4 bg-white shadow-md rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="block text-lg font-semibold">{`تاریخ: ${visit.visitDate}`}</span>
                    <span className="block text-sm text-gray-600">{`وضعیت: ${visit.flow}`}</span>
                  </div>
                  <a 
                    href={`/photos/${visit.visitID}`}
                    className="text-blue-500 hover:underline"
                  >
                    جزئیات
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
        </div>
        
        
      </div>
    </Layout>
  );
};

export default CustomerDetail;
