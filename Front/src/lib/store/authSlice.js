import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { setCookie, removeCookie } from '../../lib/utils/cookie';
import { decodeToken } from '../../lib/utils/decodeToken';
import { API } from '@/config';

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  role: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authenticate(state, action) {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.role = action.payload.role;
    },
    deauthenticate(state) {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.role = null;
    },
  },
});

export const { authenticate, deauthenticate } = authSlice.actions;

export const login = ({ username, password }) => async (dispatch) => {
  try {
    const response = await axios.post(`${API}/Account/login`, { username, password });
    const token = response.data.token;
    const decodedToken = decodeToken(token);
    setCookie('token', token);
    dispatch(authenticate({ token, user: decodedToken, role: response.data.role })); // Include role in the dispatch
    return { success: true, role: response.data.role }; // Return success status
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message }; // Return error status
  }
};
export const reauthenticate = (token) => (dispatch) => {
  try {
    const decodedToken = decodeToken(token);
    dispatch(authenticate({ token, user: decodedToken, role: decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] }));
  } catch (err) {
    console.error(err);
    dispatch(deauthenticate());
  }
};

export const logout = () => (dispatch) => {
  removeCookie('token');
  dispatch(deauthenticate());
};

export const changePassword = ({ token, oldPassword, newPassword }) => async (dispatch) => {
  try {
    const response = await axios.post(`${API}/Account/change-password`, {
      CurrentPassword: oldPassword,
      NewPassword: newPassword,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Assuming "Password changed successfully" indicates success
    if (response.data.message === 'Password changed successfully') {
      return { success: true, message: response.data.message };
    } else {
      return { success: false, message: response.data.message || 'Unknown error occurred.' };
    }
  } catch (err) {
    console.error(err);
    return { success: false, message: err.response?.data?.message || 'Error occurred while changing password.' };
  }
};



export default authSlice.reducer;
