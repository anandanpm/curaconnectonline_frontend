import { io, type Socket } from "socket.io-client"

interface CallNotification {
  appointmentId: string
  doctorId: string
  doctorName: string
  patientId: string
  timestamp: number
}

class SocketService {
  private socket: Socket | null = null
  private userId: string | null = null
  private userRole: "doctor" | "patient" | null = null
  private callListeners: ((notification: CallNotification) => void)[] = []
  private callAcceptedListeners: ((appointmentId: string) => void)[] = []
  private callRejectedListeners: ((appointmentId: string) => void)[] = []

  initialize(userId: string, userRole: "doctor" | "patient") {
    if (this.socket) {
      return this // If socket already exists, just return the instance
    }

    this.userId = userId
    this.userRole = userRole

    // Use the same WebSocket server as your chat
    this.socket = io("http://localhost:3000", {
      withCredentials: true,
    })

    this.setupListeners()
    return this
  }

  private setupListeners() {
    if (!this.socket) return

    this.socket.on("connect", () => {
      console.log("Socket connected for video calls")
      // Join a room for this user to receive call notifications
      this.socket?.emit("joinVideoCall", this.userId)
    })

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected")
    })

    this.socket.on("call:incoming", (notification: CallNotification) => {
      if (this.userRole === "patient") {
        this.callListeners.forEach((listener) => listener(notification))
      }
    })

    this.socket.on("call:accepted", (appointmentId: string) => {
      if (this.userRole === "doctor") {
        this.callAcceptedListeners.forEach((listener) => listener(appointmentId))
      }
    })

    this.socket.on("call:rejected", (appointmentId: string) => {
      if (this.userRole === "doctor") {
        this.callRejectedListeners.forEach((listener) => listener(appointmentId))
      }
    })
  }

  initiateCall(appointmentId: string, patientId: string, doctorName: string) {
    if (!this.socket || this.userRole !== "doctor") return

    const notification: Omit<CallNotification, "timestamp"> = {
      appointmentId,
      doctorId: this.userId!,
      doctorName,
      patientId,
    }

    this.socket.emit("call:initiate", notification)
  }

  acceptCall(appointmentId: string, doctorId: string) {
    if (!this.socket || this.userRole !== "patient") return
    this.socket.emit("call:accept", { appointmentId, doctorId })
  }

  rejectCall(appointmentId: string, doctorId: string) {
    if (!this.socket || this.userRole !== "patient") return
    this.socket.emit("call:reject", { appointmentId, doctorId })
  }

  onIncomingCall(callback: (notification: CallNotification) => void) {
    this.callListeners.push(callback)
    return () => {
      this.callListeners = this.callListeners.filter((listener) => listener !== callback)
    }
  }

  onCallAccepted(callback: (appointmentId: string) => void) {
    this.callAcceptedListeners.push(callback)
    return () => {
      this.callAcceptedListeners = this.callAcceptedListeners.filter((listener) => listener !== callback)
    }
  }

  onCallRejected(callback: (appointmentId: string) => void) {
    this.callRejectedListeners.push(callback)
    return () => {
      this.callRejectedListeners = this.callRejectedListeners.filter((listener) => listener !== callback)
    }
  }

  // This method can be used to get the existing socket instance
  getSocket(): Socket | null {
    return this.socket
  }

  disconnect() {
    // Don't actually disconnect the socket since it's shared with chat
    // Just remove our listeners
    if (this.socket) {
      this.socket.off("call:incoming")
      this.socket.off("call:accepted")
      this.socket.off("call:rejected")
      this.socket = null
    }
  }
}

// Create a singleton instance
const socketService = new SocketService()
export default socketService

