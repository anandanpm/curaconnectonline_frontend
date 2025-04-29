import { userApi } from "./axiosInstance";
import { doctorApi } from "./axiosInstance";


export const checkAppointmentTime = async (appointmentId: string, userRole: 'doctor' | 'patient') => {
  try {
    const apiInstance = userRole === "doctor" ? doctorApi : userApi;
    const response = await apiInstance.get(`/check-appointment-time/${appointmentId}`);
    return response.data;
  } catch (error) {
    console.error("Error checking appointment time:", error);
    throw error;
  }
};
