import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { API } from '@/config';

const initialState = {
  items: [],
  selectedItem: null,
};

const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    setItems(state, action) {
      // Ensure action.payload is an array
      if (Array.isArray(action.payload)) {
        state.items = action.payload.map((item, index) => ({
          ...item,
          _uniqueKey: `${item.id}_${index}`,  // Generate a unique key
        }));
      } else {
        console.error('Expected an array but received:', action.payload);
        state.items = []; // Clear items or handle differently
      }
    },
    selectItem(state, action) {
      state.selectedItem = action.payload;
    },
    selectItemSUH(state, action) {
      state.selectedItem = action.payload;
    },
    addAttachment(state, action) {
      const item = state.items.find(item => item.id === state.selectedItem.id);
      if (item) {
        item.attachments = item.attachments || [];
        item.attachments.push(action.payload);
      }
    },
  },
});

export const { setItems, selectItem, addAttachment } = itemsSlice.actions;

export const fetchItems = (token, user) => async (dispatch) => {
  try {
    if (user !== "undefined") {
      const response = await axios.get(`${API}/GoldenShop`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Log the response data to verify its structure
     // console.log('Fetched items:', response.data);
      dispatch(setItems(response.data));
    }
  } catch (error) {
    console.error(error);
  }
};

export const fetchItemsSUH = (token, user) => async (dispatch) => {
  try {
    if (user !== "undefined") {
      const response = await axios.get(`${API}/GoldenShop/AllSUH`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Log the response data to verify its structure
     // console.log('Fetched items (SUH):', response.data);
      dispatch(setItems(response.data));
    }
  } catch (error) {
    console.error(error);
  }
};

// Fetch all customers from the new API
export const fetchAllCustomers = (token,SUH) => async (dispatch) => {
  try {
    const response = await axios.get(`${API}/GoldenShop/AllCustomer/${SUH}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
   // console.log(response.data)
    dispatch(setItems(response.data));
  } catch (error) {
    console.error(error);
  }
};

export const selectUnvisitedCount = (state) =>
  state.items.items.filter(item => !item.visitTime).length;

export default itemsSlice.reducer;
