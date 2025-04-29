
import type React from "react"
import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { fetchDoctors, verifyDoctor, rejectDoctor } from "../../redux/adminSlice"
import type { AppDispatch } from "../../redux/store"
import { ChevronLeft, ChevronRight } from "lucide-react"
import "./AdminVerifyDoctor.scss"

interface Doctor {
  _id: string
  profile_pic: string
  username: string
  email: string
  phone: string
  address: string
  medical_license: string
  certification: string
  department: string
  experience: string
  education: string
  about: string
  is_active: boolean
  verified: boolean
}

const VerifyDoctor: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [doctorsPerPage] = useState(6)

  useEffect(() => {
    const fetchData = async () => {
      const result = await dispatch(fetchDoctors())
      setDoctors(result.payload)
    }
    fetchData()
  }, [dispatch])

  const handleApprove = async (doctorId: string) => {
    await dispatch(verifyDoctor(doctorId))
    setDoctors((prevDoctors) => prevDoctors.filter((doctor) => doctor._id !== doctorId))
  }

  const handleReject = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setShowModal(true)
  }

  const handleRejectSubmit = () => {
    if (selectedDoctor) {
      dispatch(rejectDoctor({ doctorId: selectedDoctor._id, reason: rejectReason }))
        .then(() => {
          setDoctors((prevDoctors) => prevDoctors.filter((doctor) => doctor._id !== selectedDoctor._id))
        })
        .catch((error) => {
          console.error("Error rejecting doctor:", error)
        })
    }
    setShowModal(false)
    setRejectReason("")
    setSelectedDoctor(null)
  }

  // Get current doctors
  const indexOfLastDoctor = currentPage * doctorsPerPage
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage
  const currentDoctors = doctors.slice(indexOfFirstDoctor, indexOfLastDoctor)

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  return (
    <div className="verify-doctor-page">
      <h1>Verify Doctors</h1>
      <div className="doctor-list">
        {currentDoctors.map((doctor: Doctor) => (
          <div key={doctor._id} className="doctor-card">
            <div className="doctor-header">
              <img src={doctor.profile_pic || "/placeholder.svg"} alt={doctor.username} className="doctor-image" />
              <h2>{doctor.username}</h2>
            </div>
            <div className="doctor-info">
              <p>
                <strong>Email:</strong> {doctor.email}
              </p>
              <p>
                <strong>Phone:</strong> {doctor.phone}
              </p>
              <p>
                <strong>Address:</strong> {doctor.address}
              </p>
              <p>
                <strong>Medical License:</strong> {doctor.medical_license}
              </p>
              <p>
                <strong>Department:</strong> {doctor.department}
              </p>
              <p>
                <strong>Experience:</strong> {doctor.experience}
              </p>
              <p>
                <strong>Education:</strong> {doctor.education}
              </p>
              <p>
                <strong>About:</strong> {doctor.about}
              </p>
              <p>
                <strong>Status:</strong> {doctor.is_active ? "Active" : "Inactive"}
              </p>
              <p>
                <strong>Verification:</strong> {doctor.verified ? "Verified" : "Not Verified"}
              </p>
              <p>
                <strong>Certification:</strong>
                {doctor.certification ? (
                  <button className="doctor-card__view-cert" onClick={() => setSelectedImage(doctor.certification)}>
                    View Certificate
                  </button>
                ) : (
                  <span className="doctor-card__no-cert">No certification</span>
                )}
              </p>
            </div>
            <div className="button-group">
              <button className="approve-btn" onClick={() => handleApprove(doctor._id)} disabled={doctor.verified}>
                Approve
              </button>
              <button className="reject-btn" onClick={() => handleReject(doctor)} disabled={doctor.verified}>
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="pagination__btn">
          <ChevronLeft size={20} />
        </button>
        {Array.from({ length: Math.ceil(doctors.length / doctorsPerPage) }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => paginate(i + 1)}
            className={`pagination__btn ${currentPage === i + 1 ? "active" : ""}`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === Math.ceil(doctors.length / doctorsPerPage)}
          className="pagination__btn"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Reject Doctor</h2>
            <p>Please provide a reason for rejecting {selectedDoctor?.username}:</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason"
            />
            <div className="modal-buttons">
              <button onClick={handleRejectSubmit}>Submit</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {selectedImage && (
        <div className="modal image-modal" onClick={() => setSelectedImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="Doctor's Certification"
              className="certification-image"
            />
            <button className="close-btn" onClick={() => setSelectedImage(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default VerifyDoctor

