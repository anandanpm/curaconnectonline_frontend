import { adminApi } from "./axiosInstance";
interface DashboardMetrics {
  totalDoctors: number;
  totalUsers: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  pendingAppointments: number;
  revenueGenerated: number;
}

interface ChartData {
  daily: { name: string; appointments: number }[];
  weekly: { name: string; appointments: number }[];
  yearly: { name: string; appointments: number }[];
}

export const sendAdminLoginData = async (adminData: { email: string; password: string }) => {
  try {
    const response = await adminApi.post(`/login`, adminData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const sendAdminLogoutData = async () => {
  try {
    const response = await adminApi.post(`/logout`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchPatientData = async () => {
  try {
    const response = await adminApi.get(`/patients`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const togglePatientStatusApi = async (patientId: string, newStatus: boolean) => {
  try {
    const response = await adminApi.patch(`/patients/${patientId}/toggle-status`, { is_active: newStatus });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchDoctorData = async () => {
  try {
    const response = await adminApi.get(`/doctors`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchVerifyDoctorData = async () => {
  try {
    const response = await adminApi.get(`/verifydoctors`);
    console.log(response.data, 'the details of the doctor is comming')
    return response.data;

  } catch (error) {
    throw error;
  }
};

export const toggleDoctorStatusApi = async (doctorId: string) => {
  try {
    const response = await adminApi.patch(`/doctors/${doctorId}/toggle-status`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyDoctorApi = async (doctorId: string) => {
  try {
    const response = await adminApi.patch(`/doctors/${doctorId}/verify`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const rejectDoctorApi = async (doctorId: string, reason: string) => {
  try {
    const response = await adminApi.post(`/doctors/${doctorId}/reject`, { reason })
    return response.data
  } catch (error) {
    throw error
  }
}

export const fetchDashboardMetrics = async (): Promise<DashboardMetrics> => {
  try {
    const response = await adminApi.get(`/dashboard-metrics`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchAppointmentStats = async (timeRange: string): Promise<ChartData> => {
  try {
    const response = await adminApi.get(`/appointment-stats`, {
      params: { timeRange },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchReviewdetails = async () => {
  try {
    const response = await adminApi.get(`/review`);
    return response.data;
  } catch (error) {
    throw error;
  }
}
