import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API } from '@/config';
import { createSelector } from 'reselect';

// Existing async thunks
export const fetchVisits = createAsyncThunk(
  'visits/fetchVisits',
  async ({ token, musterino }) => {
    const response = await axios.get(`${API}/Visit/vistbyCustomerCode/${musterino}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
);

export const fetchVisit = createAsyncThunk(
  'visits/fetchVisit',
  async ({ token, VID }) => {
    const response = await axios.get(`${API}/Visit/${VID}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
);

export const createVisit = createAsyncThunk(
  'visits/createVisit',
  async ({ token, customerCode }, { dispatch }) => {
    try {
      const response = await axios.post(
        `${API}/visit?customerCode=${customerCode}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const visitID = response.data.visitID;
      dispatch(setVisitID(visitID));
      return visitID;
    } catch (error) {
      alert.error('Error creating visit:', error);
      console.error('Error creating visit:', error);
    }
  }
);
export const updateVisit = createAsyncThunk(
  'visits/updateVisit',
  async ({ token, visitID, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API}/visit/${visitID}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data; // Returning updated visit data
    } catch (error) {
      return rejectWithValue(error.response.data); // Handling errors
    }
  }
);

// New async thunks for updating photo and visit approvals
export const updatePhotoApproval = createAsyncThunk(
  'visits/updatePhotoApproval',
  async ({ token, attachmentID, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API}/Attachment/${attachmentID}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data; // Return updated photo data
    } catch (error) {
      return rejectWithValue(error.response.data); // Handle errors
    }
  }
);


const visitsSlice = createSlice({
  name: 'visits',
  initialState: {
    visits: [],
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVisits.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchVisits.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.visits = action.payload;
      })
      .addCase(fetchVisits.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })

      .addCase(fetchVisit.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchVisit.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.visits = state.visits.map(visit =>
          visit.visitID === action.payload.visitID ? action.payload : visit
        );
      })
      .addCase(fetchVisit.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      
      .addCase(createVisit.fulfilled, (state, action) => {
        state.visits.push(action.payload);
      })
      .addCase(updatePhotoApproval.fulfilled, (state, action) => {
        // Update photo in the state
        state.visits = state.visits.map(visit => ({
          ...visit,
          photos: visit.photos.map(photo =>
            photo.attachmentID === action.payload.attachmentID ? action.payload : photo
          )
        }))
        .addCase(updateVisit.fulfilled, (state, action) => {
          // Replace the old visit data with the updated one
          state.visits = state.visits.map(visit =>
            visit.visitID === action.payload.visitID ? action.payload : visit
          );
        })
        .addCase(updateVisit.rejected, (state, action) => {
          state.error = action.payload || action.error.message;
        });
      })
  
      .addCase(updatePhotoApproval.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })
  }
});

// Selector for extracting visits based on musterino
export const selectVisitsByCustomer = createSelector(
  (state) => state.visits.visits,
  (_, musterino) => musterino,
  (visits, musterino) => visits?.filter(visit => visit.customerCode === musterino) || []
);

export default visitsSlice.reducer;
