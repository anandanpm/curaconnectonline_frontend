import { doctorApi } from "./axiosInstance";


export const fetchSlotsApi = async (doctorId: string) => {
  try {
    const response = await doctorApi.get(`/getslots/${doctorId}`);
    return response
  } catch (error) {
    throw error;
  }
}

export const createDoctorSlotsApi = async (slots: {
  doctor_id: string;
  day: string;
  start_time: string;
  end_time: string;
  status: 'available' | 'booked';
  created_at?: Date;
  updated_at?: Date;
}) => {
  try {
    console.log(slots, 'the slots is comming or not')
    const response = await doctorApi.post(`/slots`, { slots });
    console.log(response, 'the response from creating doctor slots is coming');
    return response.data;
  } catch (error) {
    throw error;
  }
};

