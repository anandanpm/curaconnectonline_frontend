import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sendSignupData, sendLoginData, sendLogoutData, sendGoogleAuthData, updateUserProfile, fetchVerifiedDoctors } from '../api/userApi';

interface UserState {
  username: string;
  email: string;
  role: string;
  phone: string;
  age: string | null;
  profile_pic: string;
  gender: string;
  address: string;
  isActive: boolean;
  loading: boolean;
  _id: string;
  doctor: any[];
  error: string | null;
  totalDoctors: number;
  totalPages: number;
  currentPage: number;
  departments: string[];

}

const initialState: UserState = {
  username: '',
  email: '',
  role: '',
  phone: '',
  age: '',
  profile_pic: '',
  gender: '',
  address: '',
  _id: '',
  doctor: [],
  totalDoctors: 0,
  totalPages: 0,
  currentPage: 1,
  departments: [],

  isActive: false,
  loading: false,
  error: null,
};

export const signupUser = createAsyncThunk(
  'user/signup',
  async (userData: { username: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await sendSignupData(userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Signup failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'user/login',
  async (userData: { email: string; password: string }, { rejectWithValue }) => {
    try {
      console.log(userData, 'userData is comming ')
      const response = await sendLoginData(userData);
      console.log(response, 'the response form the backend is comming')
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Login failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await sendLogoutData();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Logout failed');
    }
  }
);

export const googleAuth = createAsyncThunk(
  'user/googleAuth',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await sendGoogleAuthData(token);
      console.log(response, 'from the backend is comming')
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Google authentication failed');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (userData: {
    username: string;
    email: string;
    phone: string;
    age: string;
    gender: string;
    address: string;
    profile_pic?: string;
    _id: string;
  }, { rejectWithValue }) => {
    try {
      const response = await updateUserProfile(userData);
      console.log(response, 'the response is comming')
      if (response.user) {
        return response.user;

      } else {
        return rejectWithValue('Invalid response data');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Profile update failed');
    }
  }
);

export const getVerifiedDoctors = createAsyncThunk(
  'user/getVerifiedDoctors',
  async (params: {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const response = await fetchVerifiedDoctors(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch verified doctors');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.username = '';
      state.email = '';
      state.role = '';
      state.isActive = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.username = action.payload.username;
        state.email = action.payload.email;
        state.role = action.payload.role;
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'An unexpected error occurred';
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.username = action.payload.username;
        state.email = action.payload.email;
        state.role = action.payload.role;
        state._id = action.payload._id;
        state.address = action.payload.address;
        state.age = action.payload.age;
        state.phone = action.payload.phone;
        state.gender = action.payload.gender;
        state.profile_pic = action.payload.profile_pic;
        state.isActive = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'An unexpected error occurred';
      })
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.username = '';
        state.email = '';
        state.role = '';
        state._id = '';
        state.profile_pic = '';
        state.gender = '';
        state.age = '';
        state.phone = '';
        state.isActive = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'An unexpected error occurred';
      })
      .addCase(googleAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.username = action.payload.username;
        state.email = action.payload.email;
        state.role = action.payload.role;
        state._id = action.payload._id;
        state.address = action.payload.address;
        state.age = action.payload.age;
        state.phone = action.payload.phone;
        state.gender = action.payload.gender;
        state.profile_pic = action.payload.profile_pic;
        state.isActive = true;
        state.error = null;
      })
      .addCase(googleAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'An unexpected error occurred';
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        console.log(action.payload, 'action have some problem ')
        if (action.payload) {
          console.log(action.payload, 'the action payload is comming')
          state.username = action.payload.username || state.username;
          state.email = action.payload.email || state.email;
          state.phone = action.payload.phone || state.phone;
          state.age = action.payload.age || state.age;
          state.gender = action.payload.gender || state.gender;
          state.address = action.payload.address || state.address;
          state.profile_pic = action.payload.profile_pic || state.profile_pic;
          state._id = action.payload._id || state._id;
        }
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'An unexpected error occurred';
      })
      .addCase(getVerifiedDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVerifiedDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctor = action.payload.doctors;
        state.totalDoctors = action.payload.totalDoctors;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.departments = action.payload.departments;
      })
      .addCase(getVerifiedDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, logout } = userSlice.actions;
export default userSlice.reducer;

