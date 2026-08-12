/* import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API } from '@/config';

// Create an async thunk for fetching images
export const fetchAllImages = createAsyncThunk(
  'images/fetchAllImages',
  async ({ token, pageNumber, pageSize, distCode, filters, sortOptions }) => {
    try {
      const requestBody = {
        pageNumber,
        pageSize,
        distCode,
        sortColumn: sortOptions?.sortColumn || 'AttachmentID',
        sortOrder: sortOptions?.sortOrder || 'asc',
        filterColumn: filters?.filterColumn || '',
        filterValue: filters?.filterValue || ''
      };

      const response = await axios.post(`${API}/attachment/all`, requestBody, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data; // Return the data for further processing
    } catch (error) {
      throw Error(error.response?.data?.message || 'Error fetching images');
    }
  }
);

const imageSlice = createSlice({
  name: 'images',
  initialState: {
    attachments: [],
    totalCount: 0,
    pageSize: 10,
    totalPages: 0,
    currentPage: 1,
    status: 'idle',
    error: null,
    filters: {
      filterColumn: '',
      filterValue: ''
    },
    sortOptions: {
      sortColumn: '',
      sortOrder: ''
    },
  },
  reducers: {
    resetImages: (state) => {
      state.attachments = [];
      state.totalCount = 0;
      state.pageSize = 10;
      state.totalPages = 0;
      state.currentPage = 1;
      state.status = 'idle';
      state.error = null;
      state.filters = { filterColumn: '', filterValue: '' };
      state.sortOptions = { sortColumn: '', sortOrder: '' };
    },
    setImageFilters: (state, action) => {
      state.filters = action.payload;
    },
    setImageSortOptions: (state, action) => {
      state.sortOptions = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllImages.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllImages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.attachments = [...state.attachments, ...action.payload.attachments]; // Append new images
        state.totalCount = action.payload.totalCount; // Update total count
        state.totalPages = action.payload.totalPages; // Update total pages
        state.currentPage = action.payload.pageNumber; // Update current page
      })
      .addCase(fetchAllImages.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { resetImages, setImageFilters, setImageSortOptions } = imageSlice.actions;
export default imageSlice.reducer;
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API } from '@/config';

// Create an async thunk for fetching images
export const fetchAllImages = createAsyncThunk(
  'images/fetchAllImages',
  async ({ token, pageNumber, pageSize, distCode, filters, sortOptions }) => {
    try {
      const requestBody = {
        pageNumber,
        pageSize,
        distCode,
        sortColumn: sortOptions.sortColumn || 'AttachmentID',
        sortOrder: sortOptions.sortOrder || 'asc',
        filterColumn: filters.filterColumn || '',
        filterValue: filters.filterValue || '',
      };

      const response = await axios.post(`${API}/attachment/all`, requestBody, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data; // Return the data for further processing
    } catch (error) {
      throw Error(error.response?.data?.message || 'Error fetching images');
    }
  }
);

const imageSlice = createSlice({
  name: 'images',
  initialState: {
    attachments: [],
    totalCount: 0,
    pageSize: 10,
    totalPages: 0,
    currentPage: 1,
    status: 'idle',
    error: null,
    filters: {
      filterColumn: '',
      filterValue: '',
    },
    sortOptions: {
      sortColumn: '',
      sortOrder: '',
    },
  },
  reducers: {
    resetImages: (state) => {
      state.attachments = [];
      state.totalCount = 0;
      state.pageSize = 10;
      state.totalPages = 0;
      state.currentPage = 1;
      state.status = 'idle';
      state.error = null;
      state.filters = { filterColumn: '', filterValue: '' };
      state.sortOptions = { sortColumn: '', sortOrder: '' };
    },
    setImageFilters: (state, action) => {
      state.filters = action.payload;
    },
    setImageSortOptions: (state, action) => {
      state.sortOptions = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllImages.pending, (state) => {
        state.status = 'loading';
      })
    /*   .addCase(fetchAllImages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Assuming action.payload contains the data structure you expect
        state.attachments = [...state.attachments, ...action.payload.attachments]; // Append new images
        state.totalCount = action.payload.totalCount; // Update total count
        state.totalPages = action.payload.totalPages; // Update total pages
        state.currentPage = action.payload.pageNumber; // Update current page
      }) */
      .addCase(fetchAllImages.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchAllImages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload.pageNumber === 1) {
          state.attachments = action.payload.attachments; // Reset on first page
        } else {
          state.attachments = [...state.attachments, ...action.payload.attachments]; // Append on next pages
        }
        state.totalCount = action.payload.totalCount;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.pageNumber;
      });
  },
}); 
