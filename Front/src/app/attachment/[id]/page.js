// pages/attachment/[id].js

// pages/attachment/[id].js
"use client";

import { useParams } from 'next/navigation';
import AttachmentsList from '@/components/AttachmentsList';
import Layout from '@/components/Layout';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';

const AttachmentPage = () => {
  const { id } = useParams(); // Extract musterino from URL
  const selectedItem = useSelector((state) => state.items.selectedItem);

  useEffect(() => {
    if (!selectedItem || selectedItem.musterino !== id) {
      // Handle case where selectedItem is not in Redux or does not match the id
      // You might want to refetch the item or handle this case accordingly
    }
  }, [id, selectedItem]);

  return (
    <Layout>
     {/* <div className="max-w-4xl mx-auto px-4 py-8" style={{ direction: 'rtl' }}> */} <div className="max-w-4xl mx-auto px-4 py-8">
      {/* <h1 className="text-3xl font-bold mb-4">Attachment List</h1> */}  
        {id && <AttachmentsList musterino={id} />}
      </div>
    </Layout>
  );
};

export default AttachmentPage;



/* "use client";

import { useRouter } from 'next/navigation';
import AttachmentsList from '@/components/AttachmentsList';
import Layout from '@/components/Layout';
import { useDispatch, useSelector } from 'react-redux';


const AttachmentPage = () => {
  const router = useRouter();
  const item = useSelector(state => state.item.selectedItem);

  console.log(item)
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8" style={{ direction: 'rtl' }}>
        <h1 className="text-3xl font-bold mb-4">Attachment List</h1>
        { 
          item && <AttachmentsList musterino={item} />}
      </div>
    </Layout>
  );
};

export default AttachmentPage;
  */