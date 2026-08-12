import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API } from '@/config';

export const fetchPhotos = createAsyncThunk('photos/fetchPhotos', async (musterino, { getState }) => {
  const state = getState();
  const token = state.auth.token; // فرض بر این است که توکن در state.auth.token ذخیره شده است

  const response = await axios.get(`${API}/Status?id=${musterino}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
});

export const fetchPhotosByVisit = createAsyncThunk(
  'photo/fetchPhotosByVisit',
  async ({ token, visitID }) => {
    const response = await axios.get(`${API}/Status/byVistId/${visitID}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  }
);

export const deletePhoto = createAsyncThunk(
  'photo/deletePhoto',
  async ({ token, photoID, visitID }) => {
    await axios.delete(`${API}/attachment/${photoID}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { photoID, visitID };
  }
);

const photoSlice = createSlice({
  name: 'photo',
  initialState: {
    photos: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPhotos.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPhotos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.photos = action.payload;
      })
      .addCase(fetchPhotos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchPhotosByVisit.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPhotosByVisit.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.photos = action.payload;
      })
      .addCase(fetchPhotosByVisit.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(deletePhoto.fulfilled, (state, action) => {
        state.photos = state.photos.filter(photo => photo.attachmentID !== action.payload.photoID);
      });
  },
});

export default photoSlice.reducer;
