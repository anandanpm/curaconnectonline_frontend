
import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { fetchcancelcompleteAppointmentdetails } from "../../api/userApi"
import type { RootState } from "../../redux/store"
import "./PreviousAppointment.scss"
import { Button } from "@mui/material"
import { Info } from "@mui/icons-material"
import Pagination from "../../components/Pagination/Pagination"

interface AppointmentHistory {
  refund: string
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
  amount?: number | string
  cancellationReason?: string
  completionNotes?: string
}

interface PaginatedResponse {
  appointments: AppointmentHistory[]
  totalCount: number
  totalPages: number
}

const convertTo12HourFormat = (time: string) => {
  if (!time) return ""
  const [hours, minutes] = time.split(":")
  const hourNum = Number.parseInt(hours)
  const period = hourNum >= 12 ? "PM" : "AM"
  const convertedHours = hourNum % 12 || 12
  return `${convertedHours}:${minutes} ${period}`
}

const formatAmount = (amount?: number | string): string => {
  if (amount === undefined || amount === null) return "N/A"

  // If it's a string, try to convert to number
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  // Check if conversion was successful
  return !isNaN(numAmount) ? `$${numAmount.toFixed(2)}` : "N/A"
}

const BookingHistory: React.FC = () => {
  const [appointmentHistory, setAppointmentHistory] = useState<AppointmentHistory[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false)
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentHistory | null>(null)
  const navigate = useNavigate()

  const PAGE_SIZE = 3
  const userId = useSelector((state: RootState) => state.user._id)

  useEffect(() => {
    if (userId) {
      loadAppointmentHistory()
    }
  }, [userId, currentPage, selectedFilter])

  const loadAppointmentHistory = async () => {
    try {
      setLoading(true)
      const response: PaginatedResponse = await fetchcancelcompleteAppointmentdetails(
        userId,
        currentPage,
        PAGE_SIZE,
        selectedFilter !== "all" ? selectedFilter : undefined
      )

      setAppointmentHistory(response.appointments || [])
      setTotalPages(response.totalPages)
      setError(null)
    } catch (err: any) {
      if (err.message === "No appointment history found") {
        setAppointmentHistory([])
        setError(null)
      } else {
        setError("Failed to fetch appointment history")
        setAppointmentHistory([])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (appointment: AppointmentHistory) => {
    setSelectedAppointment(appointment)
    setIsDetailsModalOpen(true)
  }

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false)
    setSelectedAppointment(null)
  }

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleChat = (appointmentId: string): void => {
    navigate(`/chathistory/${appointmentId}`)
  }

  const handlePrescription = (appointmentId: string) => {
    console.log(appointmentId, 'the appointment id is coming or not')
    navigate(`/prescriptions/${appointmentId}`)
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="no-appointments">
          <p>Loading appointment history...</p>
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

    if (!appointmentHistory || appointmentHistory.length === 0) {
      return (
        <div className="no-appointments">
          <p>You have no {selectedFilter !== "all" ? selectedFilter.toLowerCase() : ""} appointments in your history.</p>
        </div>
      )
    }

    return (
      <>
        <div className="appointments-container">
          {appointmentHistory.map((appointment) => (
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
                <Button
                  variant="contained"
                  startIcon={<Info />}
                  onClick={() => handleViewDetails(appointment)}
                  className="action-button details"
                >
                  View Details
                </Button>
              </div>
              <div className="action-buttons">
                <Button
                  variant="contained"
                  startIcon={<Info />}
                  onClick={() => handlePrescription(appointment.appointmentId)}
                  className="action-button details"
                >
                  Prescription
                </Button>
              </div>
              <div className="action-buttons">
                <Button
                  variant="contained"
                  startIcon={<Info />}
                  onClick={() => handleChat(appointment.doctorId)}
                  className="action-button details"
                >
                  Chat
                </Button>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            siblingCount={1}
          />
        )}
      </>
    )
  }

  return (
    <div className="booking-history">
      <h1>Appointment History</h1>

      <div className="filter-options">
        <Button
          variant={selectedFilter === "all" ? "contained" : "outlined"}
          onClick={() => handleFilterChange("all")}
          className="filter-button"
        >
          All
        </Button>
        <Button
          variant={selectedFilter === "cancelled" ? "contained" : "outlined"}
          onClick={() => handleFilterChange("cancelled")}
          className="filter-button"
        >
          Cancelled
        </Button>
        <Button
          variant={selectedFilter === "completed" ? "contained" : "outlined"}
          onClick={() => handleFilterChange("completed")}
          className="filter-button"
        >
          Completed
        </Button>
      </div>

      {renderContent()}

      {isDetailsModalOpen && selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Appointment Details</h2>
            <div className="modal-body">
              <div className="appointment-details-grid">
                <div className="detail-section">
                  <h3>Patient Information</h3>
                  <p><strong>Name:</strong> {selectedAppointment.patientName}</p>
                </div>

                <div className="detail-section">
                  <h3>Doctor Information</h3>
                  <p><strong>Name:</strong> {selectedAppointment.doctorName}</p>
                  <p><strong>Department:</strong> {selectedAppointment.doctorDepartment}</p>
                </div>

                <div className="detail-section">
                  <h3>Appointment Information</h3>
                  <p><strong>Date:</strong> {selectedAppointment.appointmentDate}</p>
                  <p><strong>Time:</strong> {convertTo12HourFormat(selectedAppointment.startTime)} - {convertTo12HourFormat(selectedAppointment.endTime)}</p>
                  <p><strong>Status:</strong> <span className={`status ${selectedAppointment.status.toLowerCase()}`}>{selectedAppointment.status}</span></p>
                </div>

                <div className="detail-section">
                  <h3>Payment Information</h3>
                  <p><strong>Original Amount:</strong> {formatAmount(selectedAppointment.amount)}</p>
                  <p><strong>Payment Refund Amount:</strong> {selectedAppointment.refund || "N/A"}</p>
                </div>
              </div>

              {selectedAppointment.status === "Cancelled" && (
                <div className="detail-section full-width">
                  <h3>Cancellation Information</h3>
                  <p><strong>Reason:</strong> {selectedAppointment.cancellationReason || "No reason provided"}</p>
                </div>
              )}

              {selectedAppointment.status === "Completed" && (
                <div className="detail-section full-width">
                  <h3>Completion Notes</h3>
                  <p>{selectedAppointment.completionNotes || "No notes available"}</p>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <Button variant="contained" onClick={handleCloseDetailsModal}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookingHistory