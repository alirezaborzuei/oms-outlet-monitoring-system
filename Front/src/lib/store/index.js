import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import itemsReducer from './itemsSlice';
import itemReducer from './itemSlice';
import attachmentsReducer from './attachmentsSlice';
import photoReducer from './photoStatusSlice'
import visitsReducer from './visitsSlice';
import selectedItemReducer from './selectedItemSlice'; 
const store = configureStore({
  reducer: {
    auth: authReducer,
    items: itemsReducer,
    item: itemReducer,
    attachments: attachmentsReducer,
    photo: photoReducer,
    visits: visitsReducer,
    selectedItem: selectedItemReducer, 
  },
});

export default store;
