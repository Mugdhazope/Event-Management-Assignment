import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async ({ profileId, timezone }) => {
    const response = await axios.get(`${API_URL}/events`, {
      params: { profileId, timezone }
    });
    return response.data;
  }
);

export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (eventData) => {
    const response = await axios.post(`${API_URL}/events`, eventData);
    return response.data;
  }
);

export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ id, ...updateData }) => {
    const response = await axios.put(`${API_URL}/events/${id}`, updateData);
    return response.data;
  }
);

export const fetchEventLogs = createAsyncThunk(
  'events/fetchEventLogs',
  async ({ eventId, timezone }) => {
    const response = await axios.get(`${API_URL}/logs/event/${eventId}`, {
      params: { timezone }
    });
    return response.data;
  }
);

const eventSlice = createSlice({
  name: 'events',
  initialState: {
    items: [],
    logs: {},
    loading: false,
    error: null
  },
  reducers: {
    clearEvents: (state) => {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        const index = state.items.findIndex(e => e._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(fetchEventLogs.fulfilled, (state, action) => {
        state.logs[action.meta.arg.eventId] = action.payload;
      });
  }
});

export const { clearEvents } = eventSlice.actions;
export default eventSlice.reducer;

