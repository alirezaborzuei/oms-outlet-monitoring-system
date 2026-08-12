// src/lib/store/photoSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  photos: [],
};

export const uploadPhoto = createAsyncThunk(
  'photo/uploadPhoto',
  async ({ token, visitID, file, lat, long }, { dispatch }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('visitID', visitID);
      formData.append('lat', lat);
      formData.append('long', long);

      const response = await axios.post(`${API}/api/Attachment`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      dispatch(addPhoto({ id: response.data.attachmentID, url: response.data.imageUrl }));
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error; // Re-throw the error to handle in UI or other parts of your app
    }
  }
);

const photoSlice = createSlice({
  name: 'photo',
  initialState,
  reducers: {
    addPhoto(state, action) {
      state.photos.push(action.payload);
    },
    removePhoto(state, action) {
      state.photos = state.photos.filter(photo => photo.id !== action.payload);
    },
  },
  extraReducers: {
    [uploadPhoto.fulfilled]: (state, action) => {
      // This is where you can handle additional state updates after successful upload
      console.log('Photo upload successful:', action.payload);
    },
    [uploadPhoto.rejected]: (state, action) => {
      // Handle upload failure here if needed
      console.error('Photo upload failed:', action.error.message);
    },
  },
});

export const { addPhoto, removePhoto } = photoSlice.actions;
export default photoSlice.reducer;
