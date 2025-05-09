
import { io } from 'socket.io-client';
import { ReviewSubmission } from '../pages/User/Review';
import { userApi } from './axiosInstance';

export const sendSignupData = async (userData: { username: string; email: string, password: string }) => {
  try {
    const response = await userApi.post(`/getOtp`, userData)
    console.log(response.data, 'console.log form the axios userApi page')
    return response
  } catch (error) {
    throw error
  }
}

export const sendOtpData = async (userData: { email: string, otpString: string }) => {
  try {
    const response = await userApi.post(`/verifyOtp`, userData)
    console.log(response, 'this is from the otp page')
    return response
  } catch (error) {
    throw error
  }
}

export const resendOtpData = async (email: string) => {
  try {
    console.log(email, 'the email is comming')
    const response = await userApi.post(`/resendOtp`, { email })
    console.log(response, 'the resend otp is comming')
    return response
  } catch (error) {
    throw error
  }
}

export const sendLoginData = async (userData: { email: string; password: string }) => {
  try {
    const UserData = {
      Email: userData.email,
      password: userData.password,
    };

    console.log(UserData, "Modified userData before sending");


    const response = await userApi.post(`/login`, UserData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const sendLogoutData = async () => {
  try {
    const response = await userApi.post(`/logout`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const sendGoogleAuthData = async (token: string) => {
  try {
    const response = await userApi.post(`/google-auth`, { token });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserProfile = async (userData: {
  username: string;
  email: string;
  phone: string;
  age: string;
  gender: string;
  address: string;
  profile_pic?: string;
  _id: string;
}) => {
  try {
    const response = await userApi.put(`/update-profile`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchVerifiedDoctors = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
}) => {
  try {
    const { page = 1, limit = 3, search = "", department = "" } = params;
    const queryParams = new URLSearchParams();

    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    if (search) {
      queryParams.append('search', search);
    }

    if (department) {
      queryParams.append('department', department);
    }

    // const response = await import.meta.env.VITE_USER_API_URL.get(`/verified-doctors?${queryParams.toString()}`);

    const response = await userApi.get(`/verified-doctors?${queryParams.toString()}`);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchDoctorSlots = async (doctorId: string) => {
  try {
    const response = await userApi.get(`/doctor-slots/${doctorId}`)
    return response.data
  } catch (error) {
    throw error
  }
}


export const bookAppointment = async (slotId: string, userId: string, amount: number, paymentId: string) => {
  try {
    // First, attempt to lock the slot
    const lockResponse = await userApi.post(`/lock-slot`, { 
      slotId, 
      userId,
      lockExpiration: new Date(Date.now() + 5 * 60 * 1000) 
    });
    
    // If lock wasn't successful, throw an error with the message from the server
    if (!lockResponse.data.success) {
      throw new Error(lockResponse.data.message || "This slot is no longer available");
    }
    
    // If the lock was successful, proceed with booking
    const response = await userApi.post(`/book-appointment`, { 
      slotId, 
      userId, 
      amount, 
      paymentId,
      lockId: lockResponse.data.lockId 
    });
    
    // If the booking response indicates a problem, throw an error
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to book appointment");
    }
    
    console.log(response, 'the response from the book appointment is coming');
    
    // Connect to websocket to emit notification
    const socket = io(import.meta.env.VITE_WEBSOCKET_URL || "http://localhost:3000", {
      withCredentials: true,
    });
    
    const appointment = response.data.appointment;
    const slot = response.data.updatedSlot;
    
    // Emit the event to notify the doctor
    socket.emit("newAppointmentBooked", {
      doctorId: slot._doc.doctor_id,
      patientId: appointment._doc.user_id, 
      appointmentDate: slot._doc.day, 
      appointmentTime: `${slot._doc.start_time} - ${slot._doc.end_time}`, 
      appointmentId: appointment._doc._id, 
    });
    
    return response.data;
  } catch (error: any) {
    console.error("Error in bookAppointment:", error);
    
    // Handle Axios errors specifically to extract proper error messages
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Response error data:", error.response.data);
      console.error("Response error status:", error.response.status);
      
      // Create a more informative error by including the server's error message
      const serverMessage = error.response.data && error.response.data.message 
        ? error.response.data.message 
        : "Unknown server error";
        
      // For 409 Conflict errors, provide a specific message
      if (error.response.status === 409) {
        throw new Error("This slot is no longer available. It may have been booked by someone else.");
      }
      
      throw new Error(serverMessage);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Request error:", error.request);
      throw new Error("No response received from server. Please try again later.");
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error message:", error.message);
      // Re-throw the original error
      throw error;
    }
  }
};

export const checkUserActive = async (userId: string) => {
  try {
    const response = await userApi.get(`/users/status/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error checking user status:", error);
    
    if (error.response) {
      const serverMessage = error.response.data && error.response.data.message 
        ? error.response.data.message 
        : "Failed to verify user status";
      
      throw new Error(serverMessage);
    } else if (error.request) {
      throw new Error("No response received from server. Please try again later.");
    } else {
      throw error;
    }
  }
};

export const createPaymentIntent = async (userId: string, amount: number) => {
  try {
    const response = await userApi.post(`/create-payment-intent`, { userId, amount });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const fetchAppointmentDetails = async (
  userId: string,
  page: number = 1,
  pageSize: number = 3
) => {
  try {
    console.log(userId, 'the answer is coming the user Id')
    const response = await userApi.get(`/appointment-details/${userId}`, {
      params: { page, pageSize }
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const fetchcancelcompleteAppointmentdetails = async (
  userId: string,
  page: number = 1,
  limit: number = 3,
  status?: string
) => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    if (status) {
      queryParams.append('status', status)
    }

    const response = await userApi.get(
      `/cancelandcompleteappointment-details/${userId}?${queryParams.toString()}`
    )
    return response.data
  } catch (error) {
    throw error
  }
}

export const requestRefund = async (appointmentId: string) => {
  try {
    const response = await userApi.post(`/refund-appointment`, { appointmentId });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (data: { userId: string, oldPassword: string, newPassword: string }) => {
  try {
    const response = await userApi.post(`/reset-password`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const sendOtp = async (email: string) => {
  try {
    console.log(email, 'the email is comming or not')
    const response = await userApi.post('/send-forgottenpassword', { email })
    return response.data

  } catch (error) {
    throw error
  }
}

export const verifyOtp = async (email: string, otpString: string) => {
  try {
    const response = await userApi.post('/verify-forgottenpassword', { email, otpString })
    return response.data
  } catch (error) {
    throw error
  }
}

export const resetforgottenPassword = async (email: string, password: string) => {
  try {
    const response = await userApi.post('/reset-forgottenpassword', { email, password })
    return response.data
  } catch (error) {
    throw error
  }
}

export const getPrescriptionByAppointmentId = async (appointmentId: string): Promise<any> => {
  try {
    console.log(`${appointmentId}is the userApi for the get prescription is working`)
    const response = await userApi.get(`/prescriptions/${appointmentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const submitAppointmentReview = async (reviewData: ReviewSubmission): Promise<any> => {
  try {
    console.log(`Submitting review for appointment: ${reviewData.appointmentid}`);
    const response = await userApi.post('/reviews', reviewData);
    return response.data;
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
}