import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { SupplierState, Supplier, SupplierStatus } from '@/types';
import { supplierApi } from '@/api/supplierApi';

const initialState: SupplierState = {
  suppliers: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchSuppliers = createAsyncThunk(
  'suppliers/fetchSuppliers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await supplierApi.getAllSuppliers();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch suppliers');
    }
  }
);

export const fetchSuppliersByCategory = createAsyncThunk(
  'suppliers/fetchSuppliersByCategory',
  async (category: string, { rejectWithValue }) => {
    try {
      const response = await supplierApi.getSuppliersByCategory(category);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch suppliers by category');
    }
  }
);

export const addSupplier = createAsyncThunk(
  'suppliers/addSupplier',
  async (supplier: Omit<Supplier, '_id' | 'inventoryItems' | 'totalItems'>, { rejectWithValue }) => {
    try {
      const response = await supplierApi.createSupplier(supplier);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add supplier');
    }
  }
);

export const updateSupplier = createAsyncThunk(
  'suppliers/updateSupplier',
  async ({ id, supplier }: { id: string; supplier: Partial<Omit<Supplier, '_id' | 'inventoryItems' | 'totalItems'>> }, { rejectWithValue }) => {
    try {
      const response = await supplierApi.updateSupplier(id, supplier);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update supplier');
    }
  }
);

export const updateSupplierStatus = createAsyncThunk(
  'suppliers/updateSupplierStatus',
  async ({ id, status }: { id: string; status: SupplierStatus }, { rejectWithValue }) => {
    try {
      const response = await supplierApi.updateSupplierStatus(id, status);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update supplier status');
    }
  }
);

export const deleteSupplier = createAsyncThunk(
  'suppliers/deleteSupplier',
  async (id: string, { rejectWithValue }) => {
    try {
      await supplierApi.deleteSupplier(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete supplier');
    }
  }
);

const supplierSlice = createSlice({
  name: 'suppliers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch suppliers
      .addCase(fetchSuppliers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers = action.payload;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch suppliers by category
      .addCase(fetchSuppliersByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuppliersByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers = action.payload;
      })
      .addCase(fetchSuppliersByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add supplier
      .addCase(addSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers.push(action.payload);
      })
      .addCase(addSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update supplier
      .addCase(updateSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.suppliers.findIndex((supplier) => supplier._id === action.payload._id);
        if (index !== -1) {
          state.suppliers[index] = action.payload;
        }
      })
      .addCase(updateSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update supplier status
      .addCase(updateSupplierStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSupplierStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.suppliers.findIndex((supplier) => supplier._id === action.payload._id);
        if (index !== -1) {
          state.suppliers[index] = action.payload;
        }
      })
      .addCase(updateSupplierStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete supplier
      .addCase(deleteSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers = state.suppliers.filter((supplier) => supplier._id !== action.payload);
      })
      .addCase(deleteSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default supplierSlice.reducer; 