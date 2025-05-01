
import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useParams } from "react-router-dom"
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
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [appointmentCost, setAppointmentCost] = useState(50) 
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
        await bookAppointment(selectedSlot._id, user._id, appointmentCost, paymentIntentId)
        setSlots((prevSlots) =>
          prevSlots.map((slot) => (slot._id === selectedSlot._id ? { ...slot, status: "booked" } : slot))
        )
        setShowPayment(false)
        setSelectedSlot(null)
      } catch (err) {
        setError("Failed to book appointment")
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
    </div>
  )
}

export default AppointmentPage