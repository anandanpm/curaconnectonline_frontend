
import type React from "react"
import { useEffect, useState, useRef } from "react"
import { useSelector } from "react-redux"
import { fetchAppointmentDetails, requestRefund } from "../../api/userApi"
import type { RootState } from "../../redux/store"
import "./BookAppointment.scss"
import { Button, Snackbar, Alert, Badge } from "@mui/material"
import { Chat } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import Pagination from "../../components/Pagination/Pagination"
import io, { type Socket } from "socket.io-client"

interface AppointmentDetails {
  doctorDepartment: string
  doctorName: string
  doctorId: string
  patientName: string
  startTime: string
  endTime: string
  appointmentDate: string
  status: string
  appointmentId: string
  payment_id?: string
  amount?: number
}

interface PaginatedResponse {
  appointments: AppointmentDetails[]
  totalCount: number
  totalPages: number
  currentPage: number
}

interface MessageNotification {
  doctorId: string
  count: number
  timestamp?: number
}

const convertTo12HourFormat = (time: string) => {
  if (!time) return ""
  const [hours, minutes] = time.split(":")
  const hourNum = Number.parseInt(hours)
  const period = hourNum >= 12 ? "PM" : "AM"
  const convertedHours = hourNum % 12 || 12
  return `${convertedHours}:${minutes} ${period}`
}

const AppointmentDetails: React.FC = () => {
  const navigate = useNavigate()
  const [appointmentDetails, setAppointmentDetails] = useState<AppointmentDetails[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDetails | null>(null)
  const [processingRefund, setProcessingRefund] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [messageNotifications, setMessageNotifications] = useState<Record<string, MessageNotification>>({})
  const socketRef = useRef<Socket | null>(null)

  const PAGE_SIZE = 3
  const userId = useSelector((state: RootState) => state.user._id)

  useEffect(() => {
    if (userId) {
      loadAppointments(currentPage)

      // Initialize socket connection
      socketRef.current = io(import.meta.env.VITE_WEBSOCKET_URL || "http://localhost:3000", {
        withCredentials: true,
      })

      socketRef.current.on("connect", () => {
        console.log("Socket connected with ID:", socketRef.current?.id)
        // Join user's room for receiving messages
        socketRef.current?.emit("joinChat", userId)
      })

      // Listen for incoming messages - handle the specific format from the backend
      socketRef.current.on("receiveMessage", (data) => {
        console.log("Raw message received:", data)
        // Extract the sender ID (doctor) from the message object
        const senderId = data.message?.sender || data.senderId
        console.log(senderId, 'senderId is comming')

        if (senderId && senderId !== userId) {
          console.log("Processing message from doctor:", senderId)
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
  }, [userId, currentPage])

  const updateMessageNotification = (doctorId: string) => {
    setMessageNotifications((prev) => {
      const currentNotification = prev[doctorId] || { doctorId, count: 0 }
      return {
        ...prev,
        [doctorId]: {
          doctorId,
          count: currentNotification.count + 1,
          timestamp: Date.now(),
        },
      }
    })
  }

  const clearMessageNotification = (doctorId: string) => {
    setMessageNotifications((prev) => {
      const newNotifications = { ...prev }
      delete newNotifications[doctorId]
      return newNotifications
    })
  }

  const loadAppointments = async (page: number) => {
    setLoading(true)
    try {
      const response = await fetchAppointmentDetails(userId, page, PAGE_SIZE) as PaginatedResponse
      setAppointmentDetails(response.appointments || [])
      setTotalPages(response.totalPages || 1)
      setError(null)
    } catch (err: any) {
      if (err.message === "No pending appointments found") {
        setAppointmentDetails([])
        setTotalPages(1)
        setError(null)
      } else {
        setError("Failed to fetch appointment details")
        setAppointmentDetails([])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChat = (doctorId: string) => {
    // Clear notification when entering chat
    clearMessageNotification(doctorId)
    navigate(`/chat/${doctorId}`)
  }

  const handleCancelAppointment = (appointment: AppointmentDetails) => {
    setSelectedAppointment(appointment)
    setIsModalOpen(true)
  }

  const handleConfirmCancel = async () => {
    if (!selectedAppointment || !userId) return

    setProcessingRefund(true)
    try {
      await requestRefund(selectedAppointment.appointmentId)

      await loadAppointments(currentPage)
      setIsModalOpen(false)
      setSelectedAppointment(null)
      setSuccessMessage("Appointment cancelled successfully")
      setShowSuccessModal(true)
    } catch (err) {
      setError("Failed to process refund. Please try again later.")
    } finally {
      setProcessingRefund(false)
    }
  }

  const handleCloseSuccessMessage = () => {
    setSuccessMessage(null)
    setShowSuccessModal(false)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const renderContent = () => {
    if (loading && appointmentDetails.length === 0) {
      return (
        <div className="no-appointments">
          <p>Loading appointments...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="no-appointments">
          <p>{error}</p>
        </div>
      )
    }

    if (!appointmentDetails || appointmentDetails.length === 0) {
      return (
        <div className="no-appointments">
          <p>You have no appointments scheduled at the moment.</p>
        </div>
      )
    }

    return (
      <>
        <div className="appointments-container">
          {appointmentDetails.map((appointment) => {
            const hasNewMessages = messageNotifications[appointment.doctorId];

            return (
              <div key={appointment.appointmentId} className={`appointment-card ${appointment.status.toLowerCase()}`}>
                <div className="details-container">
                  <div className="doctor-info">
                    <h2>Doctor Information</h2>
                    <p>
                      <strong>Name:</strong> {appointment.doctorName}
                    </p>
                    <p>
                      <strong>Department:</strong> {appointment.doctorDepartment}
                    </p>
                  </div>

                  <div className="appointment-info">
                    <h2>Appointment Details</h2>
                    <p>
                      <strong>Date:</strong> {appointment.appointmentDate}
                    </p>
                    <p>
                      <strong>Time:</strong> {convertTo12HourFormat(appointment.startTime)} -{" "}
                      {convertTo12HourFormat(appointment.endTime)}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span className={`status ${appointment.status.toLowerCase()}`}>{appointment.status}</span>
                    </p>
                  </div>
                </div>

                <div className="action-buttons">
                  {appointment.status !== "Cancelled" && (
                    <>
                      <Badge
                        color="error"
                        badgeContent={hasNewMessages?.count || 0}
                        invisible={!hasNewMessages || hasNewMessages.count === 0}
                      >
                        <Button
                          variant="contained"
                          startIcon={<Chat />}
                          onClick={() => handleChat(appointment.doctorId)}
                          className={`action-button chat ${hasNewMessages ? 'has-notifications' : ''}`}
                        >
                          Chat {hasNewMessages?.count ? `(${hasNewMessages.count})` : ""}
                        </Button>
                      </Badge>
                      <Button
                        variant="contained"
                        onClick={() => handleCancelAppointment(appointment)}
                        disabled={processingRefund}
                        className="action-button cancel"
                      >
                        Cancel Appointment
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {totalPages > 1 && (
          <div className="pagination-container">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              siblingCount={1}
            />
          </div>
        )}

        {loading && appointmentDetails.length > 0 && (
          <div className="loading-overlay">
            <p>Loading more appointments...</p>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="appointment-details">
      <h1>Your Appointments</h1>
      {renderContent()}

      {isModalOpen && selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Cancel Appointment</h2>
            <div className="modal-body">
              <p>Are you sure you want to cancel this appointment?</p>
              <div className="refund-details">
                <p>
                  <strong>Doctor:</strong> {selectedAppointment.doctorName}
                </p>
                <p>
                  <strong>Date:</strong> {selectedAppointment.appointmentDate}
                </p>
                <p className="note">Note: You will receive 50% of the original payment as refund.</p>
              </div>
            </div>
            <div className="modal-actions">
              <Button variant="contained" color="secondary" onClick={handleConfirmCancel} disabled={processingRefund}>
                {processingRefund ? "Processing..." : "Yes, Cancel Appointment"}
              </Button>
              <Button variant="outlined" onClick={() => setIsModalOpen(false)} disabled={processingRefund}>
                No, Keep Appointment
              </Button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content success-modal">
            <h2>Success!</h2>
            <div className="modal-body">
              <p>Your appointment has been successfully cancelled.</p>
              <p>A refund of 50% will be processed to your original payment method.</p>
            </div>
            <div className="modal-actions">
              <Button variant="contained" color="primary" onClick={handleCloseSuccessMessage}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <Snackbar open={!!successMessage} autoHideDuration={6000} onClose={handleCloseSuccessMessage}>
        <Alert onClose={handleCloseSuccessMessage} severity="success" sx={{ width: "100%" }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </div>
  )
}

export default AppointmentDetails