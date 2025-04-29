
import type React from "react"
import { useEffect, useState, useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import { fetchDoctorAppointments } from "../../api/doctorApi"
import { fetchAppointment } from "../../redux/doctorSlice"
import { Button, IconButton, Paper, Typography, Badge, Modal, Box } from "@mui/material"
import { NavigateBefore, NavigateNext, Chat, VideoCall, MedicalServices } from "@mui/icons-material"
import "./DoctorPatient.scss"
import type { AppDispatch, RootState } from "../../redux/store"
import { useNavigate } from "react-router-dom"
import io, { type Socket } from "socket.io-client"
import { getPrescriptionByAppointmentId } from "../../api/userApi" // Import the prescription API

export interface AppointmentDetail {
  doctorDepartment: string
  doctorName: string
  userId: string
  username: string
  startTime: string
  endTime: string
  date: string
  status: string
  appointmentId: string
  payment_id?: string
  amount?: number
}

interface Medicine {
  name: string;
  dosage: string;
  frequency: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    night: boolean;
  };
  duration: number;
  instructions?: string;
}

interface Prescription {
  _id?: string;
  appointment_id: string;
  medicines: Medicine[];
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface MessageNotification {
  userId: string
  count: number
  timestamp?: number
}

const DoctorAppointments: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const doctorId = useSelector((state: RootState) => state.doctor._id)
  const doctorName = useSelector((state: RootState) => state.doctor.username)
  const [appointments, setAppointments] = useState<AppointmentDetail[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [filter, setFilter] = useState<"all" | "upcoming" | "past" | "cancelled">("all")
  const socketRef = useRef<Socket | null>(null)
  const [messageNotifications, setMessageNotifications] = useState<Record<string, MessageNotification>>({})

  // New state for prescription modal
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState<boolean>(false)
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
  const [loadingPrescription, setLoadingPrescription] = useState<boolean>(false)
  const [prescriptionError, setPrescriptionError] = useState<string | null>(null)

  const PAGE_SIZE = 3

  useEffect(() => {
    if (doctorId) {
      loadDoctorAppointments()

      // Initialize socket connection
      socketRef.current = io(import.meta.env.VITE_WEBSOCKET_URL || "http://localhost:3000", {
        withCredentials: true,
      })

      socketRef.current.on("connect", () => {
        console.log("Socket connected with ID:", socketRef.current?.id)
        // Join doctor's room for receiving messages
        socketRef.current?.emit("joinChat", doctorId)
      })

      socketRef.current.on("callNotificationSent", (data) => {
        console.log("Call notification sent status:", data)
        if (!data.success) {
          console.warn("Patient may not be online to receive the call")
        }
      })

      // Listen for incoming messages - handle the specific format from the backend
      socketRef.current.on("receiveMessage", (data) => {
        console.log("Raw message received:", data)
        // Extract the sender ID from the message object
        const senderId = data.message?.sender || data.senderId
        console.log("Sender ID:", senderId)

        if (senderId && senderId !== doctorId) {
          console.log("Processing message from patient:", senderId)
          updateMessageNotification(senderId)
        }
      })
    }

    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        console.log("Disconnected socket on cleanup")
      }
    }
  }, [doctorId])

  const updateMessageNotification = (userId: string) => {
    setMessageNotifications((prev) => {
      const currentNotification = prev[userId] || { userId, count: 0 }
      return {
        ...prev,
        [userId]: {
          userId,
          count: currentNotification.count + 1,
          timestamp: Date.now(),
        },
      }
    })
  }

  const clearMessageNotification = (userId: string) => {
    setMessageNotifications((prev) => {
      const newNotifications = { ...prev }
      delete newNotifications[userId]
      return newNotifications
    })
  }

  const loadDoctorAppointments = async () => {
    try {
      setLoading(true)
      dispatch(fetchAppointment(doctorId))
      const data = await fetchDoctorAppointments(doctorId)
      console.log(data)
      setAppointments(data)
    } catch (err) {
      setError("Failed to fetch appointments")
    } finally {
      setLoading(false)
    }
  }

  // New function to fetch prescription by appointment ID
  const fetchPrescriptionDetails = async (appointmentId: string) => {
    setLoadingPrescription(true)
    setPrescriptionError(null)

    try {
      const prescriptionData = await getPrescriptionByAppointmentId(appointmentId)
      const firstPrescription = Array.isArray(prescriptionData) ? prescriptionData[0] : prescriptionData

      if (!firstPrescription) {
        setPrescriptionError("No prescription found for this appointment")
        setSelectedPrescription(null)
      } else {
        const safePrescription: Prescription = {
          _id: firstPrescription?._id || '',
          appointment_id: firstPrescription?.appointment_id || '',
          medicines: firstPrescription?.medicines || [],
          notes: firstPrescription?.notes || '',
          created_at: firstPrescription?.created_at,
          updated_at: firstPrescription?.updated_at
        }

        setSelectedPrescription(safePrescription)
      }
    } catch (err) {
      console.error("Error fetching prescription:", err)
      setPrescriptionError("Failed to load prescription details")
      setSelectedPrescription(null)
    } finally {
      setLoadingPrescription(false)
    }
  }

  const handleViewPrescription = async (appointmentId: string) => {
    await fetchPrescriptionDetails(appointmentId)
    setPrescriptionModalOpen(true)
  }

  const handleClosePrescriptionModal = () => {
    setPrescriptionModalOpen(false)
    setSelectedPrescription(null)
    setPrescriptionError(null)
  }

  const convertTo12HourFormat = (time: string) => {
    if (!time) return ""
    const [hours, minutes] = time.split(":")
    const hourNum = Number.parseInt(hours)
    const period = hourNum >= 12 ? "PM" : "AM"
    const convertedHours = hourNum % 12 || 12
    return `${convertedHours}:${minutes} ${period}`
  }

  const parseTimeString = (timeString: string): { hours: number; minutes: number } => {
    const [hours, minutes] = timeString.split(":").map((num) => Number.parseInt(num, 10))
    return { hours, minutes }
  }

  const handleVideoCall = (appointment: AppointmentDetail) => {
    // Generate a unique room ID combining appointmentId and timestamp
    const roomId = `${appointment.appointmentId}_${Date.now()}`
    console.log("Doctor generated new room ID:", roomId)

    // Send notification to patient with the roomId
    if (socketRef.current && socketRef.current.connected) {
      console.log("Doctor sending call notification for patient:", appointment.userId)
      socketRef.current.emit("callNotification", {
        appointmentId: appointment.appointmentId,
        userId: appointment.userId,
        doctorName: doctorName,
        doctorId: doctorId,
        roomId: roomId, // Send the unique roomId to the patient
      })
    }

    // Navigate directly to the video call component with roomId as a URL parameter
    // This ensures the roomId is always available and not lost in navigation state
    navigate(`/doctor/video-call/${appointment.appointmentId}/${roomId}`, {
      state: {
        roomId: roomId, // Also include in state as backup
        userRole: "doctor",
        userId: doctorId,
        userName: doctorName,
        doctorId: doctorId,
        appointmentId: appointment.appointmentId,
      },
    })
  }

  const handleChat = (userId: string) => {
    // Clear notification when entering chat
    clearMessageNotification(userId)
    navigate(`/doctor/chat/${userId}`)
  }

  // Helper function to check if appointment is in the past based on date AND time
  const isAppointmentPast = (appointment: AppointmentDetail): boolean => {
    const now = new Date()
    const appointmentDate = new Date(appointment.date)

    // Parse the end time (24-hour format)
    const { hours, minutes } = parseTimeString(appointment.endTime)

    // Set appointment end time
    appointmentDate.setHours(hours, minutes, 0, 0)

    // Check if the appointment end time is in the past
    return appointmentDate < now
  }

  // Helper function to check if appointment is current (between start and end time)
  const isAppointmentCurrent = (appointment: AppointmentDetail): boolean => {
    const now = new Date()
    const appointmentDate = new Date(appointment.date)

    // Parse start and end times
    const startTime = parseTimeString(appointment.startTime)
    const endTime = parseTimeString(appointment.endTime)

    // Create Date objects for start and end times
    const startDateTime = new Date(appointmentDate)
    startDateTime.setHours(startTime.hours, startTime.minutes, 0, 0)

    const endDateTime = new Date(appointmentDate)
    endDateTime.setHours(endTime.hours, endTime.minutes, 0, 0)

    // Return true if now is between start and end time
    return now >= startDateTime && now <= endDateTime
  }

  const getAppointmentStatus = (appointment: AppointmentDetail): string => {
    if (appointment.status === "cancelled") return "Cancelled"
    if (isAppointmentCurrent(appointment)) return "In Progress"
    if (isAppointmentPast(appointment)) return "Completed"
    return appointment.status
  }

  const filterAppointments = (appointments: AppointmentDetail[]) => {
    switch (filter) {
      case "upcoming":
        return appointments.filter((app) => !isAppointmentPast(app) && app.status !== "cancelled")
      case "past":
        return appointments.filter((app) => isAppointmentPast(app) && app.status !== "cancelled")
      case "cancelled":
        return appointments.filter((app) => app.status === "cancelled")
      default:
        return appointments
    }
  }

  const formatFrequency = (frequency: Medicine['frequency']): string => {
    if (!frequency) return 'Not specified';

    const times: string[] = [];
    if (frequency.morning) times.push('Morning');
    if (frequency.afternoon) times.push('Afternoon');
    if (frequency.evening) times.push('Evening');
    if (frequency.night) times.push('Night');

    return times.length > 0 ? times.join(', ') : 'Not specified';
  };

  const filteredAppointments = filterAppointments(appointments)
  const totalPages = Math.ceil(filteredAppointments.length / PAGE_SIZE)
  const currentAppointments = filteredAppointments.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const renderNoAppointmentsMessage = () => {
    let message = "There are no appointments to show."
    switch (filter) {
      case "upcoming":
        message = "You have no upcoming appointments."
        break
      case "past":
        message = "You have no past appointments."
        break
      case "cancelled":
        message = "You have no cancelled appointments."
        break
    }
    return (
      <Paper elevation={3} className="no-appointments">
        <Typography variant="h6" component="h2">
          {message}
        </Typography>
        <Typography variant="body1">Check back later or try a different filter.</Typography>
      </Paper>
    )
  }

  // Rendering prescription modal content
  const renderPrescriptionModal = () => {
    const modalStyle = {
      position: 'absolute' as 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '80%',
      maxWidth: 800,
      bgcolor: 'background.paper',
      borderRadius: 2,
      boxShadow: 24,
      p: 4,
      maxHeight: '90vh',
      overflow: 'auto'
    };

    return (
      <Modal
        open={prescriptionModalOpen}
        onClose={handleClosePrescriptionModal}
        aria-labelledby="prescription-modal-title"
      >
        <Box sx={modalStyle}>
          <Typography id="prescription-modal-title" variant="h5" component="h2" sx={{ mb: 2 }}>
            Prescription Details
          </Typography>

          {loadingPrescription && (
            <div className="prescription-loading">
              <div className="loading-spinner"></div>
              <Typography>Loading prescription details...</Typography>
            </div>
          )}

          {prescriptionError && (
            <div className="prescription-error">
              <Typography color="error">{prescriptionError}</Typography>
            </div>
          )}

          {!loadingPrescription && !prescriptionError && selectedPrescription && (
            <div className="prescription-content">
              {selectedPrescription.notes && (
                <div className="prescription-notes">
                  <Typography variant="body1"><strong>Notes:</strong> {selectedPrescription.notes}</Typography>
                </div>
              )}

              <div className="prescription-info">
                <Typography variant="body1">
                  <strong>Prescription Date:</strong>{' '}
                  {selectedPrescription.created_at
                    ? new Date(selectedPrescription.created_at).toLocaleDateString()
                    : 'Date not available'}
                </Typography>
              </div>

              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Medications</Typography>

              {selectedPrescription.medicines.length > 0 ? (
                <table className="medications-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left' }}>
                      <th style={{ padding: '10px', border: '1px solid #ddd' }}>Medication</th>
                      <th style={{ padding: '10px', border: '1px solid #ddd' }}>Dosage</th>
                      <th style={{ padding: '10px', border: '1px solid #ddd' }}>Frequency</th>
                      <th style={{ padding: '10px', border: '1px solid #ddd' }}>Duration</th>
                      <th style={{ padding: '10px', border: '1px solid #ddd' }}>Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPrescription.medicines.map((medicine, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{medicine.name || 'N/A'}</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{medicine.dosage || 'N/A'}</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{formatFrequency(medicine.frequency)}</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{medicine.duration ? `${medicine.duration} days` : 'N/A'}</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{medicine.instructions || 'No specific instructions'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <Typography variant="body1">No medications found in this prescription.</Typography>
              )}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Button
              variant="contained"
              onClick={handleClosePrescriptionModal}
              style={{ marginRight: '10px' }}
            >
              Close
            </Button>
          </div>
        </Box>
      </Modal>
    );
  };

  return (
    <div className="doctor-appointments">
      <h1>Doctor Appointments</h1>

      <div className="filter-buttons">
        <Button variant={filter === "all" ? "contained" : "outlined"} onClick={() => setFilter("all")}>
          All
        </Button>
        <Button variant={filter === "upcoming" ? "contained" : "outlined"} onClick={() => setFilter("upcoming")}>
          Upcoming
        </Button>
        <Button variant={filter === "past" ? "contained" : "outlined"} onClick={() => setFilter("past")}>
          Past
        </Button>
        <Button variant={filter === "cancelled" ? "contained" : "outlined"} onClick={() => setFilter("cancelled")}>
          Cancelled
        </Button>
      </div>

      {loading ? (
        <div className="loading">Loading appointments...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : filteredAppointments.length === 0 ? (
        renderNoAppointmentsMessage()
      ) : (
        <div className="appointments-list">
          {currentAppointments.map((appointment) => {
            const displayStatus = getAppointmentStatus(appointment)
            const isCurrent = isAppointmentCurrent(appointment)
            const hasNewMessages = messageNotifications[appointment.userId]
            const isCancelled = appointment.status === "cancelled"

            return (
              <Paper
                key={appointment.appointmentId}
                className={`appointment-item ${appointment.status.toLowerCase()}`}
                elevation={3}
              >
                <div className="patient-info">
                  <h3>Patient Information</h3>
                  <p>
                    <strong>Name:</strong> {appointment.username}
                  </p>
                </div>

                <div className="appointment-time">
                  <h3>Appointment Time</h3>
                  <p>
                    <strong>Date:</strong> {appointment.date}
                  </p>
                  <p>
                    <strong>Time:</strong> {convertTo12HourFormat(appointment.startTime)} -{" "}
                    {convertTo12HourFormat(appointment.endTime)}
                  </p>
                  <p>
                    <strong>Status:</strong>
                    <span className={`status ${displayStatus.toLowerCase().replace(/\s+/g, "-")}`}>
                      {displayStatus}
                    </span>
                  </p>
                </div>

                <div className="action-buttons">
                  {/* For completed appointments or appointments with status "COMPLETED" - only show View Prescription button */}
                  {(displayStatus === "Completed" || appointment.status.toUpperCase() === "COMPLETED") && !isCancelled ? (
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<MedicalServices />}
                      onClick={() => handleViewPrescription(appointment.appointmentId)}
                      className="action-button view-prescription"
                    >
                      View Prescription
                    </Button>
                  ) : !isCancelled ? (
                    /* For active appointments (not completed, not cancelled) - show Video Call and Chat */
                    <>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<VideoCall />}
                        onClick={() => handleVideoCall(appointment)}
                        className="action-button video-call"
                      >
                        {isCurrent ? "Join Video Call" : "Video Call"}
                      </Button>
                      <Badge
                        color="error"
                        badgeContent={hasNewMessages?.count || 0}
                        invisible={!hasNewMessages || hasNewMessages.count === 0}
                      >
                        <Button
                          variant="contained"
                          color="info"
                          startIcon={<Chat />}
                          onClick={() => handleChat(appointment.userId)}
                          className={`action-button chat ${hasNewMessages ? 'has-notifications' : ''}`}
                        >
                          Chat {hasNewMessages?.count ? `(${hasNewMessages.count})` : ""}
                        </Button>
                      </Badge>
                    </>
                  ) : (
                    /* For cancelled appointments - only show Chat */
                    <Badge
                      color="error"
                      badgeContent={hasNewMessages?.count || 0}
                      invisible={!hasNewMessages || hasNewMessages.count === 0}
                    >
                    </Badge>
                  )}
                </div>
              </Paper>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <IconButton onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1}>
            <NavigateBefore />
          </IconButton>
          <span>
            {currentPage} of {totalPages}
          </span>
          <IconButton
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            <NavigateNext />
          </IconButton>
        </div>
      )}

      {/* Render Prescription Modal */}
      {renderPrescriptionModal()}
    </div>
  )
}

export default DoctorAppointments