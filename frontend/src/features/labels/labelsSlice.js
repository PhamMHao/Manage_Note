import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import labelService from './labelService';

const initialState = {
    labels: [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: ''
};

// Get user labels
export const getLabels = createAsyncThunk('labels/getAll', async (_, thunkAPI) => {
    try {
        return await labelService.getLabels();
    } catch (error) {
        const message =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

// Create new label
export const createLabel = createAsyncThunk(
    'labels/create',
    async (label, thunkAPI) => {
        try {
            return await labelService.createLabel(label);
        } catch (error) {
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Update label
export const updateLabel = createAsyncThunk(
    'labels/update',
    async ({ id, labelData }, thunkAPI) => {
        try {
            return await labelService.updateLabel(id, labelData);
        } catch (error) {
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Delete label
export const deleteLabel = createAsyncThunk('labels/delete', async (id, thunkAPI) => {
    try {
        return await labelService.deleteLabel(id);
    } catch (error) {
        const message =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const labelsSlice = createSlice({
    name: 'labels',
    initialState,
    reducers: {
        reset: (state) => initialState
    },
    extraReducers: (builder) => {
        builder
            .addCase(getLabels.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getLabels.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.labels = action.payload;
            })
            .addCase(getLabels.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(createLabel.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createLabel.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.labels.push(action.payload);
            })
            .addCase(createLabel.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(updateLabel.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateLabel.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.labels = state.labels.map((label) =>
                    label._id === action.payload._id ? action.payload : label
                );
            })
            .addCase(updateLabel.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(deleteLabel.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteLabel.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.labels = state.labels.filter((label) => label._id !== action.payload.id);
            })
            .addCase(deleteLabel.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    }
});

export const { reset } = labelsSlice.actions;
export default labelsSlice.reducer; 