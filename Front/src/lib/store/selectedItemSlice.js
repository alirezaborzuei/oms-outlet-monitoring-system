// selectedItemSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  psekodu: null,
};

const selectedItemSlice = createSlice({
  name: 'selectedItem',
  initialState,
  reducers: {
    setPsekodu(state, action) {
      state.psekodu = action.payload;
    },
    clearPsekodu(state) {
      state.psekodu = null;
    },
  },
});

export const { setPsekodu, clearPsekodu } = selectedItemSlice.actions;
export const selectPsekodu = (state) => state.selectedItem.psekodu;
export default selectedItemSlice.reducer;
