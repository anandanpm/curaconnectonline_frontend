
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutDoctor } from '../../redux/doctorSlice';
import './Doc-header.scss';
import companyLogo from '../../assets/company logo.png';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { io, Socket } from 'socket.io-client';
import { Menu, X, Bell, MessageSquare, Calendar, User, Home, LogOut, Activity } from 'lucide-react';

interface RootState {
  doctor: {
    isActive: boolean;
    error: string | null;
    _id?: string;
    doctorId?: string;
    username?: string;
  };
}

interface MessageNotification {
  userId: string;
  count: number;
  timestamp?: number;
}

interface AppointmentNotification {
  appointmentId: string;
  patientId: string;
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  timestamp: number;
  viewed: boolean;
}

const DocHeader: React.FC = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const location = useLocation();
  const socketRef = useRef<Socket | null>(null);
  const [messageNotifications, setMessageNotifications] = useState<Record<string, MessageNotification>>({});
  const [appointmentNotifications, setAppointmentNotifications] = useState<AppointmentNotification[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadAppointments, setUnreadAppointments] = useState(0);
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { isActive, doctorId } = useSelector((state: RootState) => ({
    isActive: state.doctor.isActive,
    doctorId: state.doctor._id || state.doctor.doctorId,
    username: state.doctor.username
  }));

  // Check if current route is active
  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    // Close notification dropdown when mobile menu is toggled
    setNotificationDropdownOpen(false);
  };

  // Toggle notification dropdown
  const toggleNotificationDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotificationDropdownOpen(!notificationDropdownOpen);
  };

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setNotificationDropdownOpen(false);
  }, [location.pathname]);

  // Calculate total unread messages
  useEffect(() => {
    const total = Object.values(messageNotifications).reduce((total, notification) => {
      return total + notification.count;
    }, 0);
    setTotalUnreadMessages(total);
  }, [messageNotifications]);

  // Function to update message notification
  const updateMessageNotification = (userId: string) => {
    setMessageNotifications((prev) => {
      const currentNotification = prev[userId] || { userId, count: 0 };
      return {
        ...prev,
        [userId]: {
          userId,
          count: currentNotification.count + 1,
          timestamp: Date.now(),
        },
      };
    });

    // Show toast notification
    showMessageNotification(userId);
  };

  // Function to show message notification
  const showMessageNotification = (senderId: string, message?: string) => {
    // Get current count from state
    const currentCount = messageNotifications[senderId]?.count || 1;

    toast.info(
      <div className="toast-content">
        <div className="toast-header">
          <MessageSquare size={18} className="toast-icon" />
          <span>New message from Patient</span>
        </div>
        <p className="toast-message">{message || `You have new message${currentCount > 1 ? 's' : ''}`}</p>
        <button
          onClick={() => {
            clearMessageNotification(senderId);
            navigate(`/doctor/chat/${senderId}`);
          }}
          className="toast-btn"
        >
          View Messages
        </button>
      </div>,
      {
        position: "top-right",
        autoClose: 5000,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        className: "custom-toast message-toast"
      }
    );
  };

  // Function to show appointment notification
  const showAppointmentNotification = (appointment: AppointmentNotification) => {
    toast.success(
      <div className="toast-content">
        <div className="toast-header">
          <Calendar size={18} className="toast-icon" />
          <span>New Appointment Booked</span>
        </div>
        <div className="toast-details">
          <p><strong>Date:</strong> {new Date(appointment.appointmentDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> {appointment.appointmentTime}</p>
        </div>
        <button
          onClick={() => {
            markAppointmentAsViewed(appointment.appointmentId);
            navigate('/doctor/patient');
          }}
          className="toast-btn"
        >
          View Appointment
        </button>
      </div>,
      {
        position: "top-right",
        autoClose: 8000,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        className: "custom-toast appointment-toast"
      }
    );
  };

  const clearMessageNotification = (userId: string) => {
    setMessageNotifications((prev) => {
      const newNotifications = { ...prev };
      delete newNotifications[userId];
      return newNotifications;
    });
  };

  const markAppointmentAsViewed = (appointmentId: string) => {
    setAppointmentNotifications(prev => 
      prev.map(notification => 
        notification.appointmentId === appointmentId 
          ? { ...notification, viewed: true } 
          : notification
      )
    );
    
    // Update unread count
    updateUnreadAppointmentsCount();
  };

  const updateUnreadAppointmentsCount = () => {
    setUnreadAppointments(
      appointmentNotifications.filter(notification => !notification.viewed).length
    );
  };

  // Set up heartbeat to maintain online status
  const setupHeartbeat = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    
    heartbeatIntervalRef.current = setInterval(() => {
      if (socketRef.current?.connected && doctorId) {
        socketRef.current.emit("heartbeat", doctorId, "doctor");
      }
    }, 30000); // Send heartbeat every 30 seconds
  };

  // Initialize WebSocket connection
  useEffect(() => {
    if (doctorId && isActive) {
      console.log("Initializing socket with doctor ID:", doctorId);

      // Initialize socket connection
      socketRef.current = io(import.meta.env.VITE_WEBSOCKET_URL, {
        withCredentials: true,
      });

      socketRef.current.on("connect", () => {
        console.log("Socket connected with ID from header:", socketRef.current?.id);
        // Join doctor's room for receiving messages
        socketRef.current?.emit("joinChat", doctorId);
        
        // Send doctor online status
        socketRef.current?.emit("doctorOnline", doctorId);
        
        // Set up heartbeat to maintain online status
        setupHeartbeat();
      });

      socketRef.current.on("reconnect", () => {
        console.log("Socket reconnected, re-establishing doctor online status");
        socketRef.current?.emit("doctorOnline", doctorId);
        setupHeartbeat();
      });

      socketRef.current.on("callNotificationSent", (data) => {
        console.log("Call notification sent status:", data);
        if (!data.success) {
          console.warn("Patient may not be online to receive the call");
          toast.warning("Patient may not be online to receive the call");
        }
      });

      // Listen for incoming messages
      socketRef.current.on("receiveMessage", (data) => {
        console.log("Raw message received from header:", data);
        // Extract the sender ID from the message object
        const senderId = data.message?.sender || data.senderId;
        console.log("Sender ID from header:", senderId);

        if (senderId && senderId !== doctorId) {
          console.log("Processing message from patient in header:", senderId);
          updateMessageNotification(senderId);
        }
      });

      // Listen for new appointment notifications
      socketRef.current.on("newAppointment", (data) => {
        console.log("New appointment notification received:", data);
        
        const newAppointment: AppointmentNotification = {
          appointmentId: data.appointmentId,
          appointmentDate: data.appointmentDate,
          appointmentTime: data.appointmentTime || "Scheduled time",
          timestamp: Date.now(),
          viewed: false,
          patientId: data.patientId || '',
          patientName: data.patientName || 'Patient'
        };
        
        // Add to appointment notifications
        setAppointmentNotifications(prev => [...prev, newAppointment]);
        
        // Update unread count
        setUnreadAppointments(prev => prev + 1);
        
        // Show toast notification
        showAppointmentNotification(newAppointment);
      });

      // Clean up function
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          console.log("Disconnected socket on cleanup from header");
        }
        
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }
      };
    }
  }, [doctorId, isActive]); // Depend on both doctorId and isActive

  useEffect(() => {
    // Update unread count whenever appointment notifications change
    updateUnreadAppointmentsCount();
  }, [appointmentNotifications]);

  const handleLogout = async () => {
    try {
      const resultAction = await dispatch(logoutDoctor());
      if (logoutDoctor.fulfilled.match(resultAction)) {
        // Disconnect socket before logout
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
        
        // Clear heartbeat interval
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }
        
        navigate('/doctor');
      } else {
        console.error("Logout failed:", resultAction.payload);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getTotalNotifications = () => {
    return totalUnreadMessages + unreadAppointments;
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <header className="doc-header">
        <div className="doc-header__container">
          <div className="doc-header__logo">
            <img src={companyLogo} alt="Curaconnect" />
            <h1>Curaconnect</h1>
          </div>

          <button
            className="doc-header__mobile-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className={`doc-header__mobile-nav ${mobileMenuOpen ? 'doc-header__mobile-nav--active' : ''}`}>
            <nav className="doc-header__nav">
              <ul>
                <li>
                  <Link
                    to="/doctor"
                    className={isActiveLink('/doctor') ? 'active' : ''}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Home size={18} className="nav-icon" />
                    <span>Home</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/doctor/appointment"
                    className={`${isActiveLink('/doctor/appointment') ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Calendar size={18} className="nav-icon" />
                    <span>Appointment</span>
                    {unreadAppointments > 0 && (
                      <span className="notification-badge">{unreadAppointments}</span>
                    )}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/doctor/patient"
                    className={isActiveLink('/doctor/patient') ? 'active' : ''}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User size={18} className="nav-icon" />
                    <span>Patient</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/doctor/profile"
                    className={isActiveLink('/doctor/profile') ? 'active' : ''}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User size={18} className="nav-icon" />
                    <span>Profile</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/doctor/dashboard"
                    className={isActiveLink('/doctor/dashboard') ? 'active' : ''}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Calendar size={18} className="nav-icon" />
                    <span>Dashboard</span>
                  </Link>
                </li>
                {isActive && (
                  <li className="online-status">
                    <div className="status-indicator">
                      <Activity size={18} className="nav-icon" />
                      <span>Online</span>
                      <span className="status-dot online"></span>
                    </div>
                  </li>
                )}
              </ul>
            </nav>

            <div className="doc-header__actions">
              {isActive && (
                <div className="notification-center" ref={notificationRef}>
                  <button 
                    className="notification-button"
                    onClick={toggleNotificationDropdown}
                    aria-label="Notifications"
                  >
                    <Bell size={20} />
                    {getTotalNotifications() > 0 && (
                      <span className="notification-count">{getTotalNotifications()}</span>
                    )}
                  </button>
                  
                  {notificationDropdownOpen && (
                    <div className="notification-dropdown">
                      <div className="notification-header">
                        <h3>Notifications</h3>
                      </div>
                      
                      <div className="notification-content">
                        {unreadAppointments > 0 && (
                          <div className="notification-section">
                            <h4>
                              <Calendar size={16} />
                              <span>Appointments</span>
                              <span className="notification-section-count">{unreadAppointments}</span>
                            </h4>
                            <div className="notification-items">
                              {appointmentNotifications
                                .filter(notification => !notification.viewed)
                                .sort((a, b) => b.timestamp - a.timestamp)
                                .slice(0, 3)
                                .map((appointment, index) => (
                                  <div className="notification-item" key={index}>
                                    <div className="notification-item-content">
                                      <div className="notification-item-title">New appointment</div>
                                      <div className="notification-item-detail">
                                        <span className="date">{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                                        <span className="time">{appointment.appointmentTime}</span>
                                      </div>
                                    </div>
                                    <button 
                                      className="notification-action-btn"
                                      onClick={() => {
                                        markAppointmentAsViewed(appointment.appointmentId);
                                        navigate('/doctor/appointment');
                                        setNotificationDropdownOpen(false);
                                      }}
                                    >
                                      View
                                    </button>
                                  </div>
                                ))}
                              
                              {appointmentNotifications.filter(notification => !notification.viewed).length > 3 && (
                                <div className="see-all-link">
                                  <Link to="/doctor/appointment" onClick={() => setNotificationDropdownOpen(false)}>
                                    See all appointments
                                  </Link>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {totalUnreadMessages > 0 && (
                          <div className="notification-section">
                            <h4>
                              <MessageSquare size={16} />
                              <span>Messages</span>
                              <span className="notification-section-count">{totalUnreadMessages}</span>
                            </h4>
                            <div className="notification-items">
                              {Object.entries(messageNotifications)
                                .sort(([, a], [, b]) => (b.timestamp || 0) - (a.timestamp || 0))
                                .slice(0, 3)
                                .map(([userId, notification], index) => (
                                  <div className="notification-item" key={index}>
                                    <div className="notification-item-content">
                                      <div className="notification-item-title">New messages</div>
                                      <div className="notification-item-detail">
                                        <span className="count">{notification.count} unread message{notification.count > 1 ? 's' : ''}</span>
                                      </div>
                                    </div>
                                    <button 
                                      className="notification-action-btn"
                                      onClick={() => {
                                        clearMessageNotification(userId);
                                        navigate(`/doctor/chat/${userId}`);
                                        setNotificationDropdownOpen(false);
                                      }}
                                    >
                                      Chat
                                    </button>
                                  </div>
                                ))}
                                
                              {Object.keys(messageNotifications).length > 3 && (
                                <div className="see-all-link">
                                  <Link to="/doctor/patient" onClick={() => setNotificationDropdownOpen(false)}>
                                    See all messages
                                  </Link>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {getTotalNotifications() === 0 && (
                          <div className="empty-notifications">
                            <p>No new notifications</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="doc-header__auth">
                {!isActive && (
                  <Link
                    to="/doctor/signup"
                    className="doc-header__btn signup-btn"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    SignUp
                  </Link>
                )}
                {isActive ? (
                  <button onClick={handleLogout} className="doc-header__btn logout-btn">
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                ) : (
                  <Link
                    to="/doctor/login"
                    className="doc-header__btn login-btn"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    LogIn
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu overlay */}
        <div
          className={`doc-header__overlay ${mobileMenuOpen ? 'doc-header__overlay--active' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        />
      </header>
    </>
  );
};

export default DocHeader;