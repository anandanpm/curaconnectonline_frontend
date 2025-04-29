import { PrescriptionData } from "../pages/Doctor/DocPrescription";
import { AppointmentDetail } from "../pages/Doctor/DoctorPatient";
import { doctorApi } from "./axiosInstance";


export const sendDoctorSignupData = async (docData: { username: string; email: string, password: string }) => {
  try {
    const response = await doctorApi.post(`/getOtp`, docData)
    console.log(response.data, 'console.log from the axios doctorApi page')
    return response
  } catch (error) {
    throw error
  }
}

export const sendDoctorOtpData = async (docData: { email: string, otp: string }) => {
  try {
    const response = await doctorApi.post(`/verifyOtp`, docData)
    console.log(response, 'this is from the doctor otp page')
    return response
  } catch (error) {
    throw error
  }
}

export const resendDoctorOtpData = async (email: string) => {
  try {
    const response = await doctorApi.post(`/resendOtp`, { email })
    console.log(response, 'the resend otp for doctor is coming')
    return response
  } catch (error) {
    throw error
  }
}

export const sendDoctorLoginData = async (docData: { email: string, password: string }) => {
  try {
    const DoctorData = {
      Email: docData.email,
      password: docData.password,
    };

    console.log(DoctorData, "Modified DoctorData before sending");

    const response = await doctorApi.post(`/login`, DoctorData);

    return response.data
  } catch (error) {
    throw error
  }
}

export const sendDoctorLogoutData = async () => {
  try {
    const response = await doctorApi.post(`/logout`)
    console.log(response, 'the response from the doctor logout is coming')
    return response
  } catch (error) {
    throw error
  }
}

export const sendDoctorGoogleAuthData = async (token: string) => {
  try {
    const response = await doctorApi.post(`/google-auth`, { token })
    console.log(response, 'the response from the doctor Google auth is coming')
    return response
  } catch (error) {
    throw error
  }
}

export const updateDoctorProfileData = async (profileData: {
  username?: string;
  email?: string;
  phone?: string;
  age?: string;
  gender?: string;
  address?: string;
  clinic_name?: string;
  about?: string;
  education?: string;
  experience?: string;
  medical_license?: string;
  department?: string;
  certification?: string;
  profile_pic?: string;
  _id: string;
}) => {
  try {
    const response = await doctorApi.put(`/profile`, profileData)
    console.log(response, 'the response from updating doctor profile is coming')
    return response.data
  } catch (error) {
    throw error
  }
}

export const fetchDoctorAppointments = async (doctorId: string) => {
  try {
    const response = await doctorApi.get<AppointmentDetail[]>(`/appointments/${doctorId}`)
    console.log(response, 'the response from doctor appointments fetch is coming')
    return response.data
  } catch (error) {
    throw error
  }
}

export const resetDoctorPassword = async (data: { doctorId: string, oldPassword: string, newPassword: string }) => {
  try {
    const response = await doctorApi.post(`/reset-password`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const sendDocOtp = async (email: string) => {
  try {
    console.log(email, 'the email is comming or not')
    const response = await doctorApi.post('/send-forgottenpassword', { email })
    return response.data

  } catch (error) {
    throw error
  }
}

export const verifyDocOtp = async (email: string, otpString: string) => {
  try {
    const response = await doctorApi.post('/verify-forgottenpassword', { email, otpString })
    return response.data
  } catch (error) {
    throw error
  }
}

export const resetDocforgottenPassword = async (email: string, password: string) => {
  try {
    const response = await doctorApi.post('/reset-forgottenpassword', { email, password })
    return response.data
  } catch (error) {
    throw error
  }
}

export const createPrescription = async (prescriptionData: PrescriptionData) => {
  try {
    console.log(prescriptionData, 'is this is comming or not from the doctor api page')
    const response = await doctorApi.post(`/prescription`, prescriptionData)
    return response.data
  } catch (error) {
    throw error
  }
}

export const completeAppointment = async (appointmentId: string) => {
  try {
    console.log(`Marking appointment ${appointmentId} as complete`);
    const response = await doctorApi.patch(`/completeappointment/${appointmentId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to mark appointment as complete:', error);
    throw error;
  }
};

export const getDoctorDashboard = async (doctorId: string) => {
  try {
    const response = await doctorApi.get(`/dashboard/${doctorId}`)
    return response.data
  }
  catch (error) {
    console.error('Failed to fetch details from the doctor dashboard:', error)
  }
}

export const deleteSlot = async (slotId: string) => {
  try {
    const response = await doctorApi.delete(`/deleteSlot/${slotId}`)
    return response.data
  } catch (error) {
    console.error('Failed to delete slot:', error)
    throw error
  }
}



