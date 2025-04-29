import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sendAdminLoginData, sendAdminLogoutData, fetchVerifyDoctorData, toggleDoctorStatusApi, verifyDoctorApi, fetchPatientData, togglePatientStatusApi, fetchDoctorData, rejectDoctorApi, fetchReviewdetails } from '../api/adminApi';

interface AdminState {
  username: string;
  email: string;
  isActive: boolean;
  loading: boolean;
  role: string;
  doctors: any[];
  patients: any[];
  error: string | null;
}

const initialState: AdminState = {
  username: '',
  email: '',
  isActive: false,
  loading: false,
  role: '',
  doctors: [],
  patients: [],
  error: null,
};

export const loginAdmin = createAsyncThunk(
  'admin/login',
  async (adminData: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await sendAdminLoginData(adminData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Admin login failed');
    }
  }
);

export const logoutAdmin = createAsyncThunk(
  'admin/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await sendAdminLogoutData();
      console.log(response, 'the response is comming')
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Admin logout failed');
    }
  }
);

export const fetchVerifyDoctors = createAsyncThunk(
  'admin/VerifyfetchDoctors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchVerifyDoctorData();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch doctor data');
    }
  }
);

export const fetchDoctors = createAsyncThunk(
  'admin/fetchDoctors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchDoctorData();
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch doctor data');
    }
  }
)

export const toggleDoctorStatus = createAsyncThunk(
  'admin/toggleDoctorStatus',
  async (doctorId: string, { rejectWithValue }) => {
    try {
      const response = await toggleDoctorStatusApi(doctorId);
      console.log(response)
      return response;

    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to toggle doctor status');
    }
  }
);

export const verifyDoctor = createAsyncThunk(
  'admin/verifyDoctor',
  async (doctorId: string, { rejectWithValue }) => {
    try {
      const response = await verifyDoctorApi(doctorId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to verify doctor');
    }
  }
);

export const rejectDoctor = createAsyncThunk(
  "admin/rejectDoctor",
  async ({ doctorId, reason }: { doctorId: string; reason: string }, { rejectWithValue }) => {
    try {
      const response = await rejectDoctorApi(doctorId, reason)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to reject doctor")
    }
  },
)

export const fetchPatients = createAsyncThunk(
  'admin/fetchPatients',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchPatientData();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch patient data');
    }
  }
);

export const togglePatientStatus = createAsyncThunk(
  'admin/togglePatientStatus',
  async ({ patientId, newStatus }: { patientId: string; newStatus: boolean }, { rejectWithValue }) => {
    try {
      const response = await togglePatientStatusApi(patientId, newStatus);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to toggle patient status');
    }
  }
);

export const fetchReviews = createAsyncThunk(
  'admin/fetchReviews',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchReviewdetails();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch reviews');
    }
  }
)

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.username = action.payload.username;
        state.email = action.payload.email;
        state.role = action.payload.role;
        state.isActive = true;
        state.error = null;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.loading = false;
        state.username = '';
        state.email = '';
        state.role = '';
        state.isActive = false;
        state.error = null;
      })
      .addCase(logoutAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchVerifyDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVerifyDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload;
        state.error = null;
      })
      .addCase(fetchVerifyDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = action.payload;
        state.error = null;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;

