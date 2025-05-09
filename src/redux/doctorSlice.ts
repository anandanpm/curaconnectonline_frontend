import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sendDoctorSignupData, sendDoctorLoginData, sendDoctorLogoutData, sendDoctorOtpData, resendDoctorOtpData, sendDoctorGoogleAuthData, updateDoctorProfileData, fetchDoctorAppointments } from '../api/doctorApi';
import { fetchSlotsApi, createDoctorSlotsApi } from '../api/slotApi';

interface DoctorState {
  username: string;
  email: string;
  isActive: boolean;
  verified: boolean;
  role: string;
  age: string;
  phone: string;
  gender: string;
  address: string;
  profile_pic: string;
  loading: boolean;
  error: string | null;
  clinic_name: string;
  about: string;
  education: string;
  experience: string;
  medical_license: string;
  department: string;
  certification?: string;
  _id: string;
  appointment: any[];
}

const initialState: DoctorState = {
  username: '',
  email: '',
  isActive: false,
  verified: false,
  role: '',
  age: '',
  profile_pic: '',
  phone: '',
  loading: false,
  error: null,
  clinic_name: '',
  about: '',
  education: '',
  experience: '',
  medical_license: '',
  department: '',
  certification: '',
  gender: '',
  address: '',
  _id: '',
  appointment: []
};

export const signupDoctor = createAsyncThunk(
  'doctor/signup',
  async (doctorData: { username: string; email: string; password: string; }, { rejectWithValue }) => {
    try {
      const response = await sendDoctorSignupData(doctorData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Doctor signup failed');
    }
  }
);

export const verifyDoctorOtp = createAsyncThunk(
  'doctor/verifyOtp',
  async (otpData: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await sendDoctorOtpData(otpData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'OTP verification failed');
    }
  }
);

export const resendDoctorOtp = createAsyncThunk(
  'doctor/resendOtp',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await resendDoctorOtpData(email);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'OTP resend failed');
    }
  }
);

export const loginDoctor = createAsyncThunk(
  'doctor/login',
  async (doctorData: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await sendDoctorLoginData(doctorData);
      console.log(response, 'the response from the backend is comming')
      return response;

    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Doctor login failed');
    }
  }
);

export const logoutDoctor = createAsyncThunk(
  'doctor/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await sendDoctorLogoutData();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Doctor logout failed');
    }
  }
);

export const updateDoctorProfile = createAsyncThunk(
  'doctor/updateProfile',
  async (profileData: Partial<Omit<DoctorState, '_id'>> & { _id: string }, { rejectWithValue }) => {
    try {
      const response = await updateDoctorProfileData(profileData);
      console.log(response, 'the response from the backend is comming');
      return response.updatedDoc;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update doctor profile');
    }
  }
);


export const googleAuthDoctor = createAsyncThunk(
  'doctor/googleAuth',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await sendDoctorGoogleAuthData(token);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Doctor Google authentication failed');
    }
  }
);

export const createDoctorSlots = createAsyncThunk(
  'doctor/createSlots',
  async (slots: { doctor_id: string; day: string; start_time: string; end_time: string; status: "available" | "booked"; created_at?: Date; updated_at?: Date; }, { rejectWithValue }): Promise<any> => {
    try {
      const response = await createDoctorSlotsApi(slots);
      console.log(response, 'the message from the response create slot')
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create doctor slots');
    }
  }
);

export const fetchSlots = createAsyncThunk(
  'doctor/fetchSlots',
  async (doctorId: string, { rejectWithValue }) => {
    try {
      const response = await fetchSlotsApi(doctorId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch verified doctors');
    }
  }
)

export const fetchAppointment = createAsyncThunk(
  'doctor/AppointmentSlots',
  async (doctorId: string, { rejectWithValue }) => {
    try {
      const response = await fetchDoctorAppointments(doctorId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch verified doctors');
    }
  }
)

const doctorSlice = createSlice({
  name: 'doctor',
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
      state.verified = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signupDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupDoctor.fulfilled, (state, action) => {
        state.loading = false;
        state.username = action.payload.username;
        state.email = action.payload.email;
        state.isActive = action.payload.isActive;
        state.verified = action.payload.verified;
        state.role = action.payload.role;
        state.error = null;
      })
      .addCase(signupDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(verifyDoctorOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyDoctorOtp.fulfilled, (state) => {
        state.loading = false;
        state.verified = true;
        state.error = null;
      })
      .addCase(verifyDoctorOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(resendDoctorOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendDoctorOtp.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resendDoctorOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(loginDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginDoctor.fulfilled, (state, action) => {
        state.loading = false;
        state.username = action.payload.username;
        state.email = action.payload.email;
        state.isActive = action.payload.isActive;
        state.verified = action.payload.verified;
        state.profile_pic = action.payload.profile_pic;
        state.role = action.payload.role;
        state.certification = action.payload.certification;
        state.experience = action.payload.experience;
        state.education = action.payload.education;
        state.clinic_name = action.payload.clinic_name;
        state.about = action.payload.about;
        state.medical_license = action.payload.medical_license;
        state.department = action.payload.department;
        state.age = action.payload.age;
        state.gender = action.payload.gender;
        state.address = action.payload.address;
        state.phone = action.payload.phone;
        state._id = action.payload._id;
        state.error = null;
      })
      .addCase(loginDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(logoutDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutDoctor.fulfilled, (state) => {
        state.loading = false;
        state.username = '';
        state.email = '';
        state.role = '';
        state.profile_pic = '';
        state.about = '';
        state.address = '';
        state.age = '';
        state.certification = '';
        state.department = '';
        state.education = '';
        state.experience = '';
        state.medical_license = '';
        state.phone = '';
        state.clinic_name = '';
        state.isActive = false;
        state.verified = false;
        state._id = '';
      })
      .addCase(logoutDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(googleAuthDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleAuthDoctor.fulfilled, (state, action) => {
        state.loading = false;
        state.username = action.payload.username;
        state._id = action.payload._id;
        state.email = action.payload.email;
        state.isActive = action.payload.isActive;
        state.verified = action.payload.verified;
        state.profile_pic = action.payload.profile_pic;
        state.role = action.payload.role;
        state.about = action.payload.about;
        state.address = action.payload.address;
        state.age = action.payload.age;
        state.certification = action.payload.certification;
        state.department = action.payload.department;
        state.education = action.payload.education;
        state.experience = action.payload.experience;
        state.medical_license = action.payload.medical_license;
        state.phone = action.payload.phone;
        state.clinic_name = action.payload.clinic_name;
        state.error = null;
      })
      .addCase(googleAuthDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateDoctorProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDoctorProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.username = action.payload.username || state.username;
          state.email = action.payload.email || state.email;
          state.phone = action.payload.phone || state.phone;
          state.age = action.payload.age || state.age;
          state.gender = action.payload.gender || state.gender;
          state.address = action.payload.address || state.address;
          state.profile_pic = action.payload.profile_pic || state.profile_pic;
          state.clinic_name = action.payload.clinic_name || state.clinic_name;
          state.about = action.payload.about || state.about;
          state.education = action.payload.education || state.education;
          state.experience = action.payload.experience || state.experience;
          state.medical_license = action.payload.medical_license || state.medical_license;
          state.department = action.payload.department || state.department;
          state.certification = action.payload.certification || state.certification;
        }
        state.error = null;
      })
      .addCase(updateDoctorProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'An unexpected error occurred';
      })
      .addCase(fetchAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.appointment = action.payload;
        state.error = null;
      })
      .addCase(fetchAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'An unexpected error occurred';
      })
  },
});

export const { clearError, logout } = doctorSlice.actions;
export default doctorSlice.reducer;

