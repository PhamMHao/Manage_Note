import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import noteService from './noteService';

const initialState = {
    notes: [],
    note: null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
    viewMode: 'list' // 'list' or 'grid'
};

// Create new note
export const createNote = createAsyncThunk(
    'notes/create',
    async (note, thunkAPI) => {
        try {
            return await noteService.createNote(note);
        } catch (error) {
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Get user notes
export const getNotes = createAsyncThunk('notes/getAll', async (_, thunkAPI) => {
    try {
        return await noteService.getNotes();
    } catch (error) {
        const message =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

// Get single note
export const getNote = createAsyncThunk('notes/getOne', async (id, thunkAPI) => {
    try {
        return await noteService.getNote(id);
    } catch (error) {
        const message =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

// Update note
export const updateNote = createAsyncThunk(
    'notes/update',
    async ({ id, noteData }, thunkAPI) => {
        try {
            return await noteService.updateNote(id, noteData);
        } catch (error) {
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Delete note
export const deleteNote = createAsyncThunk('notes/delete', async (id, thunkAPI) => {
    try {
        return await noteService.deleteNote(id);
    } catch (error) {
        const message =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

// Search notes
export const searchNotes = createAsyncThunk(
    'notes/search',
    async (query, thunkAPI) => {
        try {
            return await noteService.searchNotes(query);
        } catch (error) {
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const notesSlice = createSlice({
    name: 'notes',
    initialState,
    reducers: {
        reset: (state) => initialState,
        setViewMode: (state, action) => {
            state.viewMode = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(createNote.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createNote.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.notes.push(action.payload);
            })
            .addCase(createNote.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(getNotes.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getNotes.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.notes = action.payload;
            })
            .addCase(getNotes.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(getNote.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getNote.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.note = action.payload;
            })
            .addCase(getNote.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(updateNote.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateNote.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.notes = state.notes.map((note) =>
                    note._id === action.payload._id ? action.payload : note
                );
            })
            .addCase(updateNote.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(deleteNote.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteNote.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.notes = state.notes.filter((note) => note._id !== action.payload.id);
            })
            .addCase(deleteNote.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(searchNotes.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(searchNotes.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.notes = action.payload;
            })
            .addCase(searchNotes.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    }
});

export const { reset, setViewMode } = notesSlice.actions;
export default notesSlice.reducer; 