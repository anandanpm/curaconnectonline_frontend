
import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "../../redux/store"
import { toggleDoctorStatus, fetchVerifyDoctors } from "../../redux/adminSlice"
import { ChevronDown, ChevronUp, X, ChevronLeft, ChevronRight } from "lucide-react"
import "./AdminDoctor.scss"

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

const DoctorList: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const { loading, error } = useSelector((state: RootState) => state.admin)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [expandedAbout, setExpandedAbout] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [doctorsPerPage] = useState(10)

  const handleVerifyDoctorClick = () => {
    navigate("/admin/verify-doctor")
  }

  useEffect(() => {
    const fetchData = async () => {
      const data = await dispatch(fetchVerifyDoctors())
      setDoctors(data.payload)
    }
    fetchData()
  }, [dispatch])

  const handleToggleStatus = (doctorId: string) => {
    dispatch(toggleDoctorStatus(doctorId))
    setDoctors((prevDoctors) =>
      prevDoctors.map((doctor) => (doctor._id === doctorId ? { ...doctor, is_active: !doctor.is_active } : doctor)),
    )
  }

  const toggleAbout = (doctorId: string) => {
    setExpandedAbout(expandedAbout === doctorId ? null : doctorId)
  }

  // Get current doctors
  const indexOfLastDoctor = currentPage * doctorsPerPage
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage
  const currentDoctors = doctors.slice(indexOfFirstDoctor, indexOfLastDoctor)

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  if (loading) {
    return <div className="doctor-list__loading">Loading...</div>
  }

  if (error) {
    return <div className="doctor-list__error">{error}</div>
  }

  return (
    <div className="doctor-list">
      <h2 className="doctor-list__title">DOCTOR LIST</h2>
      <button className="verify-doctor-btn" onClick={handleVerifyDoctorClick}>
        Verify Doctor
      </button>
      <div className="doctor-list__container">
        {currentDoctors.map((doctor: Doctor) => (
          <div key={doctor._id} className="doctor-card">
            <div className="doctor-card__left">
              <div className="doctor-card__profile-pic-container">
                <img
                  src={doctor.profile_pic || "/placeholder.svg?height=150&width=150"}
                  alt={`${doctor.username}'s profile`}
                  className="doctor-card__profile-pic"
                />
              </div>
              <h3 className="doctor-card__name">{doctor.username}</h3>
              <div className="doctor-card__actions">
                <button
                  className={`doctor-card__toggle-btn ${doctor.is_active ? "active" : "blocked"}`}
                  onClick={() => handleToggleStatus(doctor._id)}
                >
                  {doctor.is_active ? "Block" : "Unblock"}
                </button>
              </div>
            </div>
            <div className="doctor-card__right">
              <div className="doctor-card__details">
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
                <div className="doctor-card__about">
                  <strong>About:</strong>
                  <p className={expandedAbout === doctor._id ? "expanded" : ""}>{doctor.about}</p>
                  <button className="doctor-card__about-toggle" onClick={() => toggleAbout(doctor._id)}>
                    {expandedAbout === doctor._id ? <ChevronUp /> : <ChevronDown />}
                  </button>
                </div>
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
      {selectedImage && (
        <div className="doctor-list__modal" onClick={() => setSelectedImage(null)}>
          <div className="doctor-list__modal-content">
            <img src={selectedImage || "/placeholder.svg"} alt="Doctor's Certificate" />
            <button className="doctor-list__modal-close" onClick={() => setSelectedImage(null)}>
              <X />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorList

