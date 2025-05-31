import { configureStore } from '@reduxjs/toolkit';
import inventoryReducer from './slices/inventorySlice';
import billingReducer from './slices/billingSlice';
import customerReducer from './slices/customerSlice';
import supplierReducer from './slices/supplierSlice';

export const store = configureStore({
  reducer: {
    inventory: inventoryReducer,
    billing: billingReducer,
    customers: customerReducer,
    suppliers: supplierReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 