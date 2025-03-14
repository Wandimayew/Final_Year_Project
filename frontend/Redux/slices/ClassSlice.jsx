import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "http://localhost:8083/api";
const ACADEMIC_URL = "http://localhost:8084/academic/api";

// ✅ Fetch Class Data by ID
export const fetchClassData = createAsyncThunk(
  "class/fetchClassData",
  async (classId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/${classId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch class data");
    }
  }
);

// ✅ Add New Class Data
export const addClassData = createAsyncThunk(
  "class/addClassData",
  async (classData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${ACADEMIC_URL}/new/addNewClass`, classData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to add class");
    }
  }
);

// ✅ Edit Class Data
export const editClassData = createAsyncThunk(
  "class/editClassData",
  async ({ classId, updatedData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${BASE_URL}/${classId}`, updatedData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to update class");
    }
  }
);

// ✅ Fetch Classes by School ID
export const fetchAllClassBySchool = createAsyncThunk(
  "class/fetchAllClassBySchool",
  async (schoolId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/school/${schoolId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch classes by school ID");
    }
  }
);

// ✅ Fetch Classes by Stream ID
export const fetchAllClassByStream = createAsyncThunk(
  "class/fetchAllClassByStream",
  async (streamId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/stream/${streamId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch classes by stream ID");
    }
  }
);

// ✅ Fetch Class Details
export const fetchClassDetails = createAsyncThunk(
  "class/fetchClassDetails",
  async (classId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/details/${classId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch class details");
    }
  }
);

// ✅ Delete Class by ID
export const deleteClassById = createAsyncThunk(
  "class/deleteClassById",
  async (classId, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/${classId}`);
      return classId; // Returning deleted classId for UI updates
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to delete class");
    }
  }
);

// ✅ Assign Subjects to a Class
export const assignSubjects = createAsyncThunk(
  "class/assignSubjects",
  async ({ classId, subjects }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/${classId}/assign-subjects`, { subjects });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to assign subjects");
    }
  }
);

const classSlice = createSlice({
  name: "class",
  initialState: { classData: null, loading: false, error: null },
  reducers: {
    clearClassData: (state) => {
      state.classData = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Fetch Class Data
      .addCase(fetchClassData.pending, (state) => { state.loading = true; })
      .addCase(fetchClassData.fulfilled, (state, action) => {
        state.classData = action.payload;
        state.loading = false;
      })
      .addCase(fetchClassData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Add Class Data
      .addCase(addClassData.pending, (state) => { state.loading = true; })
      .addCase(addClassData.fulfilled, (state, action) => {
        state.classData = action.payload;
        state.loading = false;
      })
      .addCase(addClassData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Edit Class Data
      .addCase(editClassData.pending, (state) => { state.loading = true; })
      .addCase(editClassData.fulfilled, (state, action) => {
        state.classData = action.payload;
        state.loading = false;
      })
      .addCase(editClassData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Fetch Classes by School
      .addCase(fetchAllClassBySchool.pending, (state) => { state.loading = true; })
      .addCase(fetchAllClassBySchool.fulfilled, (state, action) => {
        state.classData = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllClassBySchool.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Fetch Classes by Stream
      .addCase(fetchAllClassByStream.pending, (state) => { state.loading = true; })
      .addCase(fetchAllClassByStream.fulfilled, (state, action) => {
        state.classData = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllClassByStream.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Fetch Class Details
      .addCase(fetchClassDetails.pending, (state) => { state.loading = true; })
      .addCase(fetchClassDetails.fulfilled, (state, action) => {
        state.classData = action.payload;
        state.loading = false;
      })
      .addCase(fetchClassDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Delete Class by ID
      .addCase(deleteClassById.pending, (state) => { state.loading = true; })
      .addCase(deleteClassById.fulfilled, (state, action) => {
        state.loading = false;
        if (state.classData?.classId === action.payload) {
          state.classData = null;
        }
      })
      .addCase(deleteClassById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Assign Subjects
      .addCase(assignSubjects.pending, (state) => { state.loading = true; })
      .addCase(assignSubjects.fulfilled, (state, action) => {
        state.classData = action.payload;
        state.loading = false;
      })
      .addCase(assignSubjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearClassData } = classSlice.actions;
export default classSlice.reducer;
