
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getVerifiedDoctors } from "../../redux/userSlice";
import type { AppDispatch, RootState } from "../../redux/store";
import { Search, Filter, ChevronDown, ChevronUp, Circle } from "lucide-react";
import Pagination from "../../components/Pagination/Pagination";
import io from "socket.io-client";
import "./DoctorPage.scss";

// Create a singleton socket instance that persists across the entire application
const globalSocket = io(import.meta.env.VITE_WEBSOCKET_URL || "http://localhost:3000", {
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000
});

// Store online status in an object that persists across component mounts
const onlineDoctorStatuses: Record<string, boolean> = {};

// Setup global listeners for doctor status changes
globalSocket.on("doctorStatusChanged", (data: { doctorId: string; isOnline: boolean }) => {
  onlineDoctorStatuses[data.doctorId] = data.isOnline;
});

globalSocket.on("doctorsOnlineStatusResponse", (statusData: Record<string, boolean>) => {
  Object.assign(onlineDoctorStatuses, statusData);
});

const DoctorList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const {
    doctor: doctors,
    totalPages,
    departments = [],
    loading
  } = useSelector((state: RootState) => state.user);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [expandedAbouts, setExpandedAbouts] = useState<Record<string, boolean>>({});
  const [onlineDoctors, setOnlineDoctors] = useState<Record<string, boolean>>({...onlineDoctorStatuses});

  // Ensure UI is updated when global online statuses change
  useEffect(() => {
    const updateOnlineDoctors = () => {
      setOnlineDoctors({...onlineDoctorStatuses});
    };

    // Listen for custom event to trigger UI updates
    globalSocket.on("doctorStatusChanged", updateOnlineDoctors);
    globalSocket.on("doctorsOnlineStatusResponse", updateOnlineDoctors);

    // Cleanup listeners when component unmounts
    return () => {
      globalSocket.off("doctorStatusChanged", updateOnlineDoctors);
      globalSocket.off("doctorsOnlineStatusResponse", updateOnlineDoctors);
    };
  }, []);

  // Debounce search to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch doctors whenever filters change
  useEffect(() => {
    dispatch(getVerifiedDoctors({
      page: currentPage,
      search: debouncedSearchTerm,
      department: selectedDepartment
    }));
  }, [dispatch, currentPage, debouncedSearchTerm, selectedDepartment]);

  // When doctors list changes, request online status for doctors not in cache
  useEffect(() => {
    if (doctors.length > 0) {
      // Get list of doctor IDs we need to check
      const doctorIdsToCheck = doctors
        .filter(doc => onlineDoctorStatuses[doc._id] === undefined)
        .map(doc => doc._id);
      
      // Only request status for doctors we don't have data for
      if (doctorIdsToCheck.length > 0) {
        globalSocket.emit("getDoctorsOnlineStatus", doctorIdsToCheck);
      }
    }
  }, [doctors]);

  const handleAppointment = (doctorId: string) => {
    navigate(`/appointment/${doctorId}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDepartment(e.target.value);
    setCurrentPage(1); // Reset to first page on new filter
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleAbout = (doctorId: string) => {
    setExpandedAbouts(prev => ({
      ...prev,
      [doctorId]: !prev[doctorId]
    }));
  };

  return (
    <div className="doctor-list-container">
      <div className="search-filter-container">
        <div className="search-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search doctors or departments"
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        <div className="select-wrapper">
          <Filter className="filter-icon" />
          <select
            value={selectedDepartment}
            onChange={handleDepartmentChange}
            className="department-select"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">Loading doctors...</div>
      ) : (
        <>
          <div className="doctors-grid">
            {doctors.length > 0 ? (
              doctors.map((doctor) => (
                <div key={doctor._id} className="doctor-card">
                  <div className="doctor-header">
                    <img
                      src={doctor.profile_pic || "/placeholder.svg"}
                      alt={doctor.username}
                      className="doctor-image"
                    />
                    {/* Online indicator */}
                    <div className="online-status-indicator">
                      <Circle 
                        size={12} 
                        fill={onlineDoctors[doctor._id] ? "#10b981" : "#d1d5db"} 
                        stroke={onlineDoctors[doctor._id] ? "#10b981" : "#d1d5db"} 
                      />
                      <span>{onlineDoctors[doctor._id] ? "Online" : "Offline"}</span>
                    </div>
                  </div>
                  
                  <h3 className="doctor-name">{doctor.username}</h3>
                  <p className="doctor-department">{doctor.department}</p>
                  <div className="doctor-about">
                    <h4>About</h4>
                    <p className={expandedAbouts[doctor._id] ? "expanded" : ""}>
                      {doctor.about}
                    </p>
                    <button 
                      className="read-more-btn"
                      onClick={() => toggleAbout(doctor._id)}
                    >
                      {expandedAbouts[doctor._id] ? (
                        <>
                          Read Less <ChevronUp size={16} />
                        </>
                      ) : (
                        <>
                          Read More <ChevronDown size={16} />
                        </>
                      )}
                    </button>
                  </div>
                  <div className="doctor-details">
                    <p>
                      <strong>Experience:</strong> {doctor.experience}
                    </p>
                    <p>
                      <strong>Education:</strong> {doctor.education}
                    </p>
                    <p>
                      <strong>Clinic:</strong> {doctor.clinic_name}
                    </p>
                    <p>
                      <strong>Gender:</strong> {doctor.gender}
                    </p>
                    <p>
                      <strong>Age:</strong> {doctor.age}
                    </p>
                  </div>
                  <button
                    className="appointment-button"
                    onClick={() => handleAppointment(doctor._id)}
                  >
                    Book Appointment
                  </button>
                </div>
              ))
            ) : (
              <div className="no-results">No doctors found matching your criteria</div>
            )}
          </div>

          {doctors.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default DoctorList;