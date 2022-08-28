import { configureStore } from '@reduxjs/toolkit';
import PrivateReducer from '../features/Private/PrivateSlice';

export const store = configureStore({
  reducer: {
    Private: PrivateReducer,
  },
});
