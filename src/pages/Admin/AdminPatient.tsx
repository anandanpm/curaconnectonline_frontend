import type React from "react"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchPatients, togglePatientStatus } from "../../redux/adminSlice"
import type { AppDispatch, RootState } from "../../redux/store"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import "./AdminPatient.scss"

interface Patients {
  _id: string
  profile_pic: string
  username: string
  email: string
  phone: string | number
  gender: string
  age: number
  is_active: boolean
}

const PatientList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [patients, setPatients] = useState<Patients[]>([])
  const { loading, error } = useSelector((state: RootState) => state.admin)
  const [currentPage, setCurrentPage] = useState(1)
  const [patientsPerPage] = useState(4) 
  const [searchTerm, setSearchTerm] = useState("") 

  useEffect(() => {
    const fetchData = async () => {
      const data = await dispatch(fetchPatients())
      setPatients(data.payload)
    }
    fetchData()
  }, [dispatch])

  const handleToggleStatus = (patientId: string, currentStatus: boolean) => {
    dispatch(togglePatientStatus({ patientId, newStatus: !currentStatus }))
    setPatients((prevPatients) =>
      prevPatients.map((patient) =>
        patient._id === patientId ? { ...patient, is_active: !patient.is_active } : patient,
      ),
    )
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  // Convert value to string for safe comparison
  const safeStringValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    return String(value).toLowerCase();
  }

  // Filter patients based on search term
  const filteredPatients = patients.filter((patient) => {
    const searchLower = searchTerm.toLowerCase();
    
    return (
      safeStringValue(patient.username).includes(searchLower) ||
      safeStringValue(patient.email).includes(searchLower) ||
      safeStringValue(patient.phone).includes(searchLower) ||
      safeStringValue(patient.gender).includes(searchLower) ||
      safeStringValue(patient.age).includes(searchLower)
    );
  });

  // Get current patients
  const indexOfLastPatient = currentPage * patientsPerPage
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient)

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  if (loading) return <div className="patient-list__loading">Loading...</div>
  if (error) return <div className="patient-list__error">{error}</div>

  return (
    <div className="patient-list">
      <h2 className="patient-list__title">Patient List</h2>
      
      {/* Search Bar */}
      <div className="patient-list__search-container">
        <div className="patient-list__search-wrapper">
          <Search className="patient-list__search-icon" />
          <input
            type="text"
            className="patient-list__search-input"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <table className="patient-list__table">
        <thead>
          <tr>
            <th>Profile</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Gender</th>
            <th>Age</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentPatients.length > 0 ? (
            currentPatients.map((patient) => (
              <tr key={patient._id}>
                <td>
                  <img
                    src={patient.profile_pic || "/placeholder.svg?height=50&width=50"}
                    alt={`${patient.username}'s profile`}
                    className="patient-list__profile-pic"
                  />
                </td>
                <td>{patient.username}</td>
                <td>{patient.email}</td>
                <td>{patient.phone}</td>
                <td>{patient.gender}</td>
                <td>{patient.age}</td>
                <td>{patient.is_active ? "Active" : "Blocked"}</td>
                <td>
                  <button
                    className={`patient-list__toggle-btn ${patient.is_active ? "active" : "blocked"}`}
                    onClick={() => handleToggleStatus(patient._id, patient.is_active)}
                  >
                    {patient.is_active ? "Block" : "Unblock"}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="patient-list__no-results">
                No patients found matching your search criteria
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      {filteredPatients.length > 0 && (
        <div className="pagination">
          <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="pagination__btn">
            <ChevronLeft />
          </button>
          {Array.from({ length: Math.ceil(filteredPatients.length / patientsPerPage) }, (_, i) => (
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
            disabled={currentPage === Math.ceil(filteredPatients.length / patientsPerPage)}
            className="pagination__btn"
          >
            <ChevronRight />
          </button>
        </div>
      )}
    </div>
  )
}

export default PatientList