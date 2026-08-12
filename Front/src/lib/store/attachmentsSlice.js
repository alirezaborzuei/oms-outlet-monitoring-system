 import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API } from '@/config';

// Create an async thunk for fetching attachments
export const fetchAllAttachments = createAsyncThunk(
  'attachments/fetchAllAttachments',
  async ({ token, pageNumber, pageSize, distCode, filters, sortOptions }) => {
    try {
      // Prepare the request body
      const requestBody = {
        pageNumber,
        pageSize,
        distCode,
        sortColumn: sortOptions?.sortColumn || 'AttachmentID',
        sortOrder: sortOptions?.sortOrder || 'asc',
        filterColumn: filters?.filterColumn || '', // Default empty if not provided
        filterValue: filters?.filterValue || '' // Default empty if not provided
      };

     // console.log("Request Body:", requestBody); // Check request body

      // Make the POST request with JSON body
      const response = await axios.post(`${API}/attachment/all`, requestBody, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

    //  console.log("Response Data:", response.data); // Check response data
      return response.data;
    } catch (error) {
      throw Error(error.response?.data?.message || 'Error fetching attachments');
    }
  }
);


const attachmentsSlice = createSlice({
  name: 'attachments',
  initialState: {
    attachments: [],
    totalCount: 0,
    distCode: 0,
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
    resetAttachments: (state) => {
      state.attachments = [];
      state.totalCount = 0;
      state.pageSize = 10;
      state.totalPages = 0;
      state.distCode = 0;
      state.currentPage = 1;
      state.status = 'idle';
      state.error = null;
      state.filters = { filterColumn: '', filterValue: '' };
      state.sortOptions = { sortColumn: '', sortOrder: '' };
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    setSortOptions: (state, action) => {
      state.sortOptions = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllAttachments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllAttachments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.attachments = action.payload.attachments;
        state.totalCount = action.payload.totalCount;
        state.pageSize = action.payload.pageSize;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.pageNumber;
        state.distCode = action.payload.distCode;
      })
      .addCase(fetchAllAttachments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { resetAttachments, setFilters, setSortOptions } = attachmentsSlice.actions;
export default attachmentsSlice.reducer;
 