import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

export const fetchProfiles = createAsyncThunk(
  'profiles/fetchProfiles',
  async () => {
    const response = await axios.get(`${API_URL}/profiles`);
    return response.data;
  }
);


export const createProfile = createAsyncThunk(
  'profiles/createProfile',
  async (profileData) => {
    const response = await axios.post(`${API_URL}/profiles`, profileData);
    return response.data;
  }
);

export const updateProfile = createAsyncThunk(
  'profiles/updateProfile',
  async ({ id, timezone }) => {
    const response = await axios.put(`${API_URL}/profiles/${id}`, { timezone });
    return response.data;
  }
);

const profileSlice = createSlice({
  name: 'profiles',
  initialState: {
    items: [],
    currentProfile: null,
    loading: false,
    error: null
  },
  reducers: {
    setCurrentProfile: (state, action) => {
      state.currentProfile = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfiles.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProfiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createProfile.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        const index = state.items.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentProfile && state.currentProfile._id === action.payload._id) {
          state.currentProfile = action.payload;
        }
      });
  }
});

export const { setCurrentProfile } = profileSlice.actions;
export default profileSlice.reducer;

