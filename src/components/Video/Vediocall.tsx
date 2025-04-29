
import type React from "react"
import { useEffect, useRef } from "react"
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt"
import "./Vediocall.scss"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import { completeAppointment } from "../../api/doctorApi"

interface VideoCallProps {
  roomId?: string
  userRole?: "doctor" | "patient"
  userId?: string
  userName?: string
  doctorId?: string
  appointmentId?: string
}

const VideoCallComponent: React.FC<VideoCallProps> = (props) => {
  const location = useLocation()
  const navigate = useNavigate()
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const zpRef = useRef<ZegoUIKitPrebuilt | null>(null)

  // Get roomId from multiple sources with priority:
  // 1. URL params (most reliable)
  // 2. Props
  // 3. Location state
  const params = useParams<{ appointmentId: string; roomId: string }>()

  // Extract all needed values with fallbacks
  const roomId = params.roomId || props.roomId || location.state?.roomId
  const appointmentId = params.appointmentId || props.appointmentId || location.state?.appointmentId
  const userRole = props.userRole || location.state?.userRole || "patient"
  const userId = props.userId || location.state?.userId || ""
  const userName = props.userName || location.state?.userName || "User"
  const doctorId = props.doctorId || location.state?.doctorId || ""

  // Debug log to help troubleshoot
  console.log("VideoCall Component Initialization:", {
    roomId,
    appointmentId,
    userRole,
    userId,
    userName,
    doctorId,
    "URL params": params,
    Props: props,
    "Location state": location.state,
  })

  useEffect(() => {
    if (!roomId) {
      console.error("No roomId available from any source")
      alert("Room ID is required to start a video call")
      return
    }

    if (!videoContainerRef.current) {
      console.error("Video container ref is null")
      alert("Video container not found")
      return
    }

    const initializeCall = async () => {
      try {
        console.log(`Initializing video call with room ID: ${roomId}`)
        const appID = Number(import.meta.env.VITE_ZEGOCLOUD_APP_ID)
        const serverSecret = import.meta.env.VITE_ZEGOCLOUD_SECRETKEY

        if (!appID || !serverSecret) {
          console.error("Missing ZEGOCLOUD credentials")
          alert("Missing ZEGOCLOUD credentials. Check your environment variables.")
          return
        }

        const effectiveUserId = userRole === "doctor" ? doctorId : userId
        console.log("Using effective user ID:", effectiveUserId)

        // Generate token
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          roomId,
          effectiveUserId || `user-${Date.now()}`,
          userName,
        )

        if (!kitToken) {
          console.error("Failed to generate kit token")
          alert("Failed to generate kit token")
          return
        }

        console.log("Kit token generated successfully")

        // Create ZegoUIKitPrebuilt instance
        zpRef.current = ZegoUIKitPrebuilt.create(kitToken)
        console.log("ZegoUIKitPrebuilt instance created")

        // Join room
        zpRef.current.joinRoom({
          container: videoContainerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.OneONoneCall,
          },
          showScreenSharingButton: userRole === "doctor",
          showLeavingView: true,
          turnOnMicrophoneWhenJoining: true,
          turnOnCameraWhenJoining: true,
          showMyCameraToggleButton: true,
          showMyMicrophoneToggleButton: true,
          showUserList: true,
          maxUsers: 2,
          onJoinRoom: () => {
            console.log(`Successfully joined room: ${roomId}`)
          },
          onLeaveRoom: async () => {
            console.log("Left room")
            if (userRole === "doctor" && appointmentId) {
              try {
                await completeAppointment(appointmentId)
                console.log(`Appointment ${appointmentId} marked as complete`)
                navigate(`/doctor/prescription/${appointmentId}`)
              } catch (error) {
                console.error("Error completing appointment:", error)
                navigate(`/doctor/appointment`)
              }
            } else if (userRole === "patient" && appointmentId) {
              navigate(`/review/${appointmentId}`)
            } else {
              navigate(userRole === "doctor" ? "/doctor/appointment" : "/appointment")
            }
          },
        })
      } catch (err) {
        console.error("Failed to initialize video call:", err)
      }
    }

    initializeCall()

    return () => {
      if (zpRef.current) {
        console.log("Cleaning up video call")
        zpRef.current.hangUp()
        zpRef.current.destroy()
      }
    }
  }, [roomId, userRole, userId, userName, doctorId, appointmentId, navigate])

  return (
    <div className="video-call-wrapper">
      <div
        ref={videoContainerRef}
        className="video-container"
        style={{
          width: "100%",
          height: "100vh",
          display: "block",
        }}
      ></div>
    </div>
  )
}

export default VideoCallComponent
