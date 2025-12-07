import { configureStore } from '@reduxjs/toolkit';
import profileReducer from './slices/profileSlice';
import eventReducer from './slices/eventSlice';

const store = configureStore({
  reducer: {
    profiles: profileReducer,
    events: eventReducer
  }
});

export default store;

