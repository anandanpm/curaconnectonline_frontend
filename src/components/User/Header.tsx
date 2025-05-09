
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { logoutUser } from "../../redux/userSlice"
import "./Header.scss"
import companyLogo from "../../assets/company logo.png"
import type { AppDispatch } from "../../redux/store"
import { Avatar, Menu, MenuItem, Divider, IconButton, Typography } from "@mui/material"
import { User, Calendar, LogOut, Menu as MenuIcon, X } from "lucide-react"
import io, { type Socket } from "socket.io-client"
import Swal from "sweetalert2"

// Import ToastContainer and toast from react-toastify
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

// Import the user status API function
import { checkUserActive } from "../../api/userApi" // Adjust the import path as needed

interface RootState {
  user: {
    isActive: boolean
    error: string | null
    profile_pic?: string
    username?: string
    _id?: string
    role?: string
  }
}

interface CallNotificationData {
  appointmentId: string
  userId: string
  doctorName: string
  doctorId: string
  roomId: string
}

interface MessageNotification {
  userId: string
  count: number
  timestamp?: number
}

const Header: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const location = useLocation()
  const { isActive, profile_pic, username, _id: id, role } = useSelector((state: RootState) => state.user)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const socketRef = useRef<Socket | null>(null)
  const [socketConnected, setSocketConnected] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [messageNotifications, setMessageNotifications] = useState<Record<string, MessageNotification>>({})

  // Check if link is active
  const isActiveLink = (path: string) => {
    return location.pathname === path
  }

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_WEBSOCKET_URL|| "http://localhost:3000", {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketRef.current.on("connect", () => {
      console.log("Socket connected with ID:", socketRef.current?.id)
      setSocketConnected(true)
      // Join chat with user ID
      socketRef.current?.emit("joinChat", id)
      console.log("Emitted joinChat with user ID:", id)
    })

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
      setSocketConnected(false)
    })

    // Listen specifically for callNotificationemit event
    socketRef.current.on("callNotificationemit", (data: CallNotificationData) => {
      console.log("Received call notification emit:", data)

      // Check if the notification is for the current user
      if (data.userId === id) {
        console.log("Call notification matches current user")
        showCallAlert(data)
      }
    })

    // Add this socket listener for message notifications
    socketRef.current.on("receiveMessage", (data) => {
      console.log("Raw message received:", data)
      // Extract the sender ID from the message object
      const senderId = data.message?.sender || data.senderId
      console.log("Sender ID:", senderId)

      if (senderId && senderId !== id) {
        console.log("Processing message from doctor:", senderId)
        updateMessageNotification(senderId)
      }
    })

    socketRef.current.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason)
      setSocketConnected(false)
    })

    return () => {
      console.log("Cleaning up socket connection")
      if (socketRef.current) {
        socketRef.current.off("connect")
        socketRef.current.off("connect_error")
        socketRef.current.off("callNotificationemit")
        socketRef.current.off("receiveMessage")
        socketRef.current.off("disconnect")
        socketRef.current.disconnect()
      }
    }
  }, [isActive, id, role])

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.emit("joinChat", id)
      console.log("Re-joined chat with user ID:", id)
    }
  }, [id, socketConnected])

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const header = document.querySelector('.header')
      if (header && !header.contains(event.target as Node) && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [mobileMenuOpen])

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

    // Show toast notification
    showMessageNotification(userId)
  }

  const showMessageNotification = (senderId: string, message?: string) => {
    // Get current count from state
    const currentCount = messageNotifications[senderId]?.count || 1

    toast.info(
      <div>
        <p>
          <strong>New message from Doctor</strong>
        </p>
        <p>{message || `You have new message${currentCount > 1 ? "s" : ""}`}</p>
        <button
          onClick={() => {
            clearMessageNotification(senderId)
            navigate(`/chat/${senderId}`)
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
      },
    )
  }

  const clearMessageNotification = (userId: string) => {
    setMessageNotifications((prev) => {
      const newNotifications = { ...prev }
      delete newNotifications[userId]
      return newNotifications
    })
  }

  // const showCallAlert = (data: CallNotificationData) => {
  //   const { appointmentId, doctorName, doctorId, roomId } = data

  //   Swal.fire({
  //     title: '<div style="font-size: 1.5rem; font-weight: 600; color: #333;">Incoming Video Call</div>',
  //     html: `
  //       <div style="display: flex; flex-direction: column; align-items: center; margin: 1rem 0;">
  //         <div style="width: 80px; height: 80px; background-color: #e9f5e9; border-radius: 50%; display: flex; justify-content: center; align-items: center; margin-bottom: 1rem;">
  //           <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  //             <polygon points="23 7 16 12 23 17 23 7"></polygon>
  //             <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
  //           </svg>
  //         </div>
  //         <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">Dr. ${doctorName} is calling you</p>
  //         <p style="color: #666; font-size: 0.9rem;">for your scheduled appointment</p>
  //       </div>
  //     `,
  //     showCancelButton: true,
  //     confirmButtonText:
  //       '<span style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>Join Call</span>',
  //     cancelButtonText:
  //       '<span style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>Decline</span>',
  //     confirmButtonColor: "#4caf50",
  //     cancelButtonColor: "#f8f9fa",
  //     allowOutsideClick: false,
  //     allowEscapeKey: false,
  //     timer: 60000,
  //     timerProgressBar: true,
  //     customClass: {
  //       popup: "curaconnect-call-popup",
  //       title: "curaconnect-call-title",
  //       confirmButton: "curaconnect-confirm-btn",
  //       cancelButton: "curaconnect-cancel-btn",
  //     },
  //     backdrop: `
  //       rgba(0,0,0,0.4)
  //       url("/call-ring.gif")
  //       left top
  //       no-repeat
  //     `,
  //   }).then(async (result) => {
  //     if (result.isConfirmed) {
  //       try {
  //         // Check if the user is still active
  //         if (!id) {
  //           throw new Error("User ID is undefined");
  //         }
  //         const statusResponse = await checkUserActive(id);
  //         console.log(statusResponse,'the status response is comming or not')
  //         // If user is not active, log them out
  //         if (statusResponse === false) {
  //           // Show message to the user
  //           Swal.fire({
  //             title: 'Session Expired',
  //             text: 'Your session has expired. Please log in again.',
  //             icon: 'warning',
  //             confirmButtonColor: '#4caf50',
  //             confirmButtonText: 'OK'
  //           }).then(() => {
  //             // Log out the user
  //             handleLogout();
  //             return;
  //           });
  //         } else {
  //           // User is active, inform the server that call was accepted
  //           if (socketRef.current) {
  //             socketRef.current.emit("callAccepted", {
  //               appointmentId,
  //               roomId: roomId,
  //               userId: id,
  //               doctorId: doctorId,
  //             });
  //           }

  //           // Pass the roomId to the video call component via URL parameter for reliability
  //           navigate(`/video-call/${appointmentId}/${roomId}`, {
  //             state: {
  //               roomId: roomId, // Also include in state as backup
  //               appointmentId,
  //               userId: id,
  //               userRole: "patient",
  //               userName: username || "Patient",
  //               doctorId: doctorId,
  //             },
  //           });
  //         }
  //       } catch (error) {
  //         console.error("Error checking user status:", error);
          
  //         // Show error message
  //         Swal.fire({
  //           title: 'Error',
  //           text: 'Failed to connect to the call. Please try again.',
  //           icon: 'error',
  //           confirmButtonColor: '#4caf50',
  //           confirmButtonText: 'OK'
  //         });
  //       }
  //     } else {
  //       console.log("Call declined");
  //       if (socketRef.current) {
  //         socketRef.current.emit("callDeclined", {
  //           appointmentId,
  //           userId: id,
  //           doctorId: doctorId,
  //         });
  //       }
  //     }
  //   });
  // };


  // Fix for user status check in showCallAlert function

const showCallAlert = (data: CallNotificationData) => {
  const { appointmentId, doctorName, doctorId, roomId } = data

  Swal.fire({
    title: '<div style="font-size: 1.5rem; font-weight: 600; color: #333;">Incoming Video Call</div>',
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; margin: 1rem 0;">
        <div style="width: 80px; height: 80px; background-color: #e9f5e9; border-radius: 50%; display: flex; justify-content: center; align-items: center; margin-bottom: 1rem;">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
        </div>
        <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">Dr. ${doctorName} is calling you</p>
        <p style="color: #666; font-size: 0.9rem;">for your scheduled appointment</p>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText:
      '<span style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>Join Call</span>',
    cancelButtonText:
      '<span style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>Decline</span>',
    confirmButtonColor: "#4caf50",
    cancelButtonColor: "#f8f9fa",
    allowOutsideClick: false,
    allowEscapeKey: false,
    timer: 60000,
    timerProgressBar: true,
    customClass: {
      popup: "curaconnect-call-popup",
      title: "curaconnect-call-title",
      confirmButton: "curaconnect-confirm-btn",
      cancelButton: "curaconnect-cancel-btn",
    },
    backdrop: `
      rgba(0,0,0,0.4)
      url("/call-ring.gif")
      left top
      no-repeat
    `,
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        // Check if the user is still active
        if (!id) {
          throw new Error("User ID is undefined");
        }
        
        const statusResponse = await checkUserActive(id);
        console.log('User active status response:', statusResponse);
        
        // If user is not active (statusResponse is explicitly false), log them out
        if (statusResponse === false) {
          // Show message to the user
          Swal.fire({
            title: 'Session Expired',
            text: 'Your session has expired. Please log in again.',
            icon: 'warning',
            confirmButtonColor: '#4caf50',
            confirmButtonText: 'OK'
          }).then(() => {
            // Log out the user
            handleLogout();
          });
        } else {
          // User is active, inform the server that call was accepted
          if (socketRef.current) {
            socketRef.current.emit("callAccepted", {
              appointmentId,
              roomId: roomId,
              userId: id,
              doctorId: doctorId,
            });
          }

          // Pass the roomId to the video call component via URL parameter for reliability
          navigate(`/video-call/${appointmentId}/${roomId}`, {
            state: {
              roomId: roomId, // Also include in state as backup
              appointmentId,
              userId: id,
              userRole: "patient",
              userName: username || "Patient",
              doctorId: doctorId,
            },
          });
        }
      } catch (error) {
        console.error("Error checking user status:", error);
        
        // Show error message
        Swal.fire({
          title: 'Error',
          text: 'you are blocked by admin contact the admin.',
          icon: 'error',
          confirmButtonColor: '#4caf50',
          confirmButtonText: 'OK'
        });
      }
    } else {
      console.log("Call declined");
      if (socketRef.current) {
        socketRef.current.emit("callDeclined", {
          appointmentId,
          userId: id,
          doctorId: doctorId,
        });
      }
    }
  });
};
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleMenuItemClick = (path: string) => {
    navigate(path)
    handleClose()
  }

  const handleLogout = async () => {
    try {
      if (socketRef.current) {
        socketRef.current.disconnect()
        setSocketConnected(false)
      }

      const resultAction = await dispatch(logoutUser())
      if (logoutUser.fulfilled.match(resultAction)) {
        navigate("/")
      } else {
        console.error("Logout failed:", resultAction.payload)
      }
    } catch (error) {
      console.error("Logout error:", error)
    }
    handleClose()
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

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
      <header className="header">
        <div className="header__container">
          <Link to="/" className="header__logo">
            <img src={companyLogo || "/placeholder.svg"} alt="Curaconnect" />
            <div className="header__brand">
              <span className="cura">Cura</span>
              <span className="connect">connect</span>
            </div>
          </Link>

          <button
            className="header__mobile-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>

          <div className={`header__right-section ${mobileMenuOpen ? "header__right-section--active" : ""}`}>
            <nav className="header__nav">
              <Link to="/" className={`header__nav-link ${isActiveLink('/') ? 'active' : ''}`}>
                Home
              </Link>
              <Link to="/doctordetails" className={`header__nav-link ${isActiveLink('/doctordetails') ? 'active' : ''}`}>
                Doctor
              </Link>
              <Link to="/about" className={`header__nav-link ${isActiveLink('/about') ? 'active' : ''}`}>
                About
              </Link>
              <Link to="/contact" className={`header__nav-link ${isActiveLink('/contact') ? 'active' : ''}`}>
                Contact
              </Link>
            </nav>

            <div className="header__actions">
              {!isActive && (
                <>
                  <Link to="/signup" className="header__signup">
                    SignUp
                  </Link>
                  <Link to="/login" className="header__login">
                    LogIn
                  </Link>
                </>
              )}
              {isActive && (
                <div className="header__user-info">
                  <IconButton
                    onClick={handleClick}
                    size="small"
                    aria-controls={open ? "account-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? "true" : undefined}
                  >
                    <Avatar sx={{ width: 40, height: 40 }} src={profile_pic} alt={username || "User"} />
                  </IconButton>
                  <Typography variant="subtitle1" className="header__user-name">
                    {username || "User"}
                  </Typography>
                  <Menu
                    anchorEl={anchorEl}
                    id="account-menu"
                    open={open}
                    onClose={handleClose}
                    onClick={handleClose}
                    PaperProps={{
                      elevation: 0,
                      sx: {
                        overflow: "visible",
                        filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                        mt: 1.5,
                        width: 220,
                        "& .MuiMenuItem-root": {
                          px: 2,
                          py: 1,
                          gap: 1.5,
                        },
                      },
                    }}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  >
                    <MenuItem onClick={() => handleMenuItemClick("/profile")}>
                      <User size={18} />
                      Profile
                    </MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick("/appointment")}>
                      <Calendar size={18} />
                      Appointments
                    </MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick("/historyappointment")}>
                      <Calendar size={18} />
                      AppointmentsHistory
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                      <LogOut size={18} />
                      Logout
                    </MenuItem>
                  </Menu>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu overlay */}
        <div
          className={`header__mobile-overlay ${mobileMenuOpen ? "header__mobile-overlay--active" : ""}`}
          onClick={() => setMobileMenuOpen(false)}
        />
      </header>
    </>
  )
}

export default Header