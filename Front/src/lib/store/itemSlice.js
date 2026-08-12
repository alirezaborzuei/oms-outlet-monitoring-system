

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API } from '@/config';

const initialState = {
  items: [],
  selectedItem: null,
  visitID: null,
  visitStatus: null, // Adding visitStatus to initialState
};

// Thunks
export const fetchItemId = createAsyncThunk(
  'item/fetchItemId',
  async ({ token, user, id }, { dispatch }) => {
    try {
   
      const response = await axios.get(`${API}/GoldenShop/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (Array.isArray(response.data) && response.data.length > 0) {
        dispatch(setItem(response.data[0]));
      } else {
        dispatch(setItem(null));
      }
    } catch (error) {
      console.error(error);
    }
  }
);

export const createVisit = createAsyncThunk(
  'item/createVisit',
  async ({ token, customerCode }, { dispatch }) => {
    try {
      const response = await axios.post(
        `${API}/visit?customerCode=${customerCode}`,{},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json', // Ensure the content type is set
          },
        }
      );
      const visitID = response.data.visitID;
      dispatch(setVisitID(visitID));
      return visitID;
    } catch (error) {
      console.error('Error creating visit:', error);
    }
  }
);

function base64ToBlob(base64Data, contentType) {
  // Check if base64Data contains the prefix and remove it
  const base64Pattern = /^data:(.+);base64,(.*)$/;
  const matches = base64Data.match(base64Pattern);

  if (matches) {
      base64Data = matches[2]; // Extract only the base64 part
      contentType = matches[1]; // Extract the MIME type
  }

  const byteCharacters = atob(base64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}


export const uploadFile = createAsyncThunk(
  'item/uploadFile',
  async ({ token, visitID, file, lat, long }, { dispatch }) => {
    try {
      const base64Image = file//'data:image/png;base64,...'; // Your base64 string
      const contentType = 'image/png'; // Extracted from your base64 string
      const blob = base64ToBlob(base64Image, contentType);
      const files = new File([blob], 'image.png', { type: contentType });

      const formData = new FormData();
      if (!files) {
        console.error('File is undefined or null');
        return;
      }
      formData.append('file', files);
      formData.append('visitID', visitID);
      formData.append('lat', lat);
      formData.append('long', long);
     // console.log( visitID, lat, long,files.name,files.type,files)

      await axios.post(`${API}/Attachment`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      dispatch(addAttachment(file.name)); // Assuming the server returns the filename as the attachment
    }
     catch (error) {
      alert.error('Error uploading file:', error);
      console.error('Error uploading file:', error);
    }
  }
);



export const checkVisitStatus = createAsyncThunk(
  'item/checkVisitStatus',
  async ({ token, customerCode }, { dispatch }) => {
    try {
      const response = await axios.get(`${API}/Visit/byCustomerCode/${customerCode}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
     
      if(response.data){
       
         const status = response.data.visitID; 
         const visitID = response.data.visitID;
         dispatch(setVisitID(visitID));
         // Assuming the response contains the visit status
        dispatch(setVisitStatus(status));
      }
      else{
        const status =null; // Assuming the response contains the visit status
        dispatch(setVisitStatus(status));
      }
     
      return status;
    } catch (error) {
      alert.error('Error checking visit status:', error);
      console.error('Error checking visit status:', error);
    }
  }
);

// Slice
const itemSlice = createSlice({
  name: 'item',
  initialState,
  reducers: {
    setItems(state, action) {
      state.items = action.payload;
    },
    setItem(state, action) {
      state.selectedItem = action.payload;
    },
    addAttachment(state, action) {
      const item = state.selectedItem;
      if (item) {
        item.attachments = item.attachments || [];
        item.attachments.push(action.payload);
      }
    },
    setVisitID(state, action) {
      state.visitID = action.payload;
    },
    clearVisitID: (state) => {
      state.visitID = null;   
      },
    setVisitStatus(state, action) {
      state.visitStatus = action.payload;
    },
    
  },
});

export const { setItems, setItem, addAttachment, setVisitID, setVisitStatus,clearVisitID } = itemSlice.actions;

export default itemSlice.reducer;
