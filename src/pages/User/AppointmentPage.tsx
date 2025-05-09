
import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "../../redux/store"
import { fetchDoctorSlots, bookAppointment } from "../../api/userApi"
import StripePayment from "../../components/Stripe/StripePayment"
import "./AppointmentPage.scss"

interface Slot {
  _id?: string
  doctor_id: string
  day: string
  start_time: string
  end_time: string
  status: "available" | "booked"
  created_at?: Date
  updated_at?: Date
}


const AppointmentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [appointmentCost, setAppointmentCost] = useState(50)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [showBookingErrorModal, setShowBookingErrorModal] = useState(false)
  const doctor = useSelector((state: RootState) => state.user.doctor.find((d) => d._id === id))
  const user = useSelector((state: RootState) => state.user)

  useEffect(() => {
    // Update appointment cost if doctor has consultation_fee
    if (doctor && doctor.consultation_fee) {
      setAppointmentCost(doctor.consultation_fee)
    }
  }, [doctor])

  const fetchSlots = useCallback(async () => {
    if (id) {
      try {
        setLoading(true)
        const fetchedSlots = await fetchDoctorSlots(id)
        setSlots(fetchedSlots)
        setLoading(false)
      } catch (err) {
        setError("Failed to fetch doctor slots")
        setLoading(false)
      }
    }
  }, [id])

  useEffect(() => {
    fetchSlots()
  }, [fetchSlots])

  const convertTo12HourFormat = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hourNum = Number.parseInt(hours)
    const period = hourNum >= 12 ? "PM" : "AM"
    const displayHour = hourNum % 12 || 12
    return `${displayHour}:${minutes} ${period}`
  }

  const availableDates = [...new Set(slots.map((slot) => slot.day))].sort()

  const filteredSlots = selectedDate ? slots.filter((slot) => slot.day === selectedDate) : slots

  const handleSlotSelection = (slot: Slot) => {
    setSelectedSlot(slot)
    setShowModal(true)
  }

  const handleConfirmBooking = () => {
    setShowModal(false)
    setShowPayment(true)
  }

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (selectedSlot && selectedSlot._id) {
      try {
        // Attempt to book the appointment
        const response = await bookAppointment(selectedSlot._id, user._id, appointmentCost, paymentIntentId)
        
        // Refresh slots to get updated status
        await fetchSlots()
        
        // Close payment modal
        setShowPayment(false)
        
        // Make sure we have a valid response before navigating to success
        if (response && response.success) {
          console.log(response,'this is the response come from the backend thorught the book appointment')
          // Navigate to success page since booking was successful
          navigate('/appointment/success', { 
            state: { 
              appointmentDetails: response.appointment,
              doctorName: doctor?.username,
              appointmentDate: selectedSlot.day,
              appointmentTime: `${convertTo12HourFormat(selectedSlot.start_time)} - ${convertTo12HourFormat(selectedSlot.end_time)}`,
              appointmentCost
            } 
          })
        } else {
          // Handle case where response exists but success is false
          throw new Error(response?.message || "Failed to book appointment");
        }
        
        // Reset selected slot
        setSelectedSlot(null)
      } catch (err: any) {
        console.error("Booking error:", err)
        
        // Extract error message from Axios error response if available
        let errorMessage = "This slot is no longer available. It may have been booked by someone else."
        
        if (err.response && err.response.data && err.response.data.message) {
          // Get error message from Axios response
          errorMessage = err.response.data.message
        } else if (err.message) {
          // Use error message directly if available
          errorMessage = err.message
        }
        
        // Show error modal with the error message from the backend
        setBookingError(errorMessage)
        setShowPayment(false)
        setShowBookingErrorModal(true)
        
        // DO NOT navigate to success page on error
      }
    }
  }

  const handlePaymentCancel = () => {
    setShowPayment(false)
    setSelectedSlot(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const closeBookingErrorModal = () => {
    setShowBookingErrorModal(false)
    setBookingError(null)
    // Refresh slots after error to get the latest status
    fetchSlots()
  }

  if (loading) return <div className="loading">Loading...</div>
  if (error) return <div className="error">Error: {error}</div>

  return (
    <div className="appointment-page">
      <h1>Book Appointment</h1>
      {doctor && (
        <div className="doctor-info">
          <img 
            src={doctor.profile_pic || "/placeholder.svg"} 
            alt={doctor.username} 
            className="doctor-image" 
          />
          <div className="doctor-name-container">
            <h2>{doctor.username}</h2>
            <p className="doctor-specialty">{doctor.department}</p>
            <p className="consultation-fee"><strong>Consultation Fee:</strong> ${appointmentCost}</p>
          </div>
        </div>
      )}

      <div className="date-selector">
        <h3>Select a Date</h3>
        <div className="date-buttons">
          {availableDates.map((date) => (
            <button
              key={date}
              className={`date-button ${selectedDate === date ? "selected" : ""}`}
              onClick={() => setSelectedDate(date)}
            >
              {formatDate(date)}
            </button>
          ))}
        </div>
      </div>

      {filteredSlots.length === 0 ? (
        <div className="no-slots-message">
          <p>There are no available slots for the selected date.</p>
          {!selectedDate && availableDates.length > 0 && <p>Please select a date to view available slots.</p>}
        </div>
      ) : (
        <div className="slots-grid">
          {filteredSlots.map((slot) => (
            <button
              key={slot._id}
              className={`slot-button ${slot.status === "booked" ? "booked" : ""}`}
              onClick={() => handleSlotSelection(slot)}
              disabled={slot.status === "booked"}
            >
              <span className="slot-time">
                {convertTo12HourFormat(slot.start_time)} - {convertTo12HourFormat(slot.end_time)}
              </span>
              {slot.status === "booked" && <span className="slot-status">Booked</span>}
            </button>
          ))}
        </div>
      )}

      {showModal && selectedSlot && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Appointment</h3>
            <p>Do you want to book an appointment for:</p>
            <p><strong>Doctor:</strong> {doctor?.username}</p>
            <p><strong>Date:</strong> {formatDate(selectedSlot.day)}</p>
            <p>
              <strong>Time:</strong> {convertTo12HourFormat(selectedSlot.start_time)} - {convertTo12HourFormat(selectedSlot.end_time)}
            </p>
            <p><strong>Consultation Fee:</strong> ${appointmentCost}</p>
            <div className="modal-buttons">
              <button onClick={handleConfirmBooking}>Proceed to Payment</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showPayment && selectedSlot && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Payment</h3>
            <p><strong>Amount:</strong> ${appointmentCost}</p>
            <StripePayment
              amount={appointmentCost}
              userId={user._id}
              slotId={selectedSlot._id || ""}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          </div>
        </div>
      )}

      {showBookingErrorModal && (
        <div className="modal-overlay">
          <div className="modal error-modal">
            <h3>Booking Failed</h3>
            <div className="error-icon">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <p className="error-message">{bookingError}</p>
            <p>Your appointment could not be booked. The selected time slot may have been booked by another patient.</p>
            <p>Your payment has been processed but will be refunded automatically.</p>
            <p>Please select another available time slot to continue.</p>
            <div className="modal-buttons">
              <button onClick={closeBookingErrorModal}>Choose Another Slot</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AppointmentPage