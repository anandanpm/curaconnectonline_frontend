
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { Socket } from "socket.io-client";
import io from "socket.io-client";
import axios from "axios";
import { chatApi } from '../../api/chatApi';
import "./Chat.scss";

interface Doctor {
  _id: string;
  username: string;
  email: string;
  phone: number;
  age: string;
  profile_pic: string;
  gender: string;
  address: string;
  department: string;
  clinic_name: string;
  about: string;
  experience: string;
}

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  doctor: Doctor[];
}

interface RootState {
  user: User;
}

interface Message {
  _id: string;
  sender: string;
  text: string;
  timestamp: Date;
  seen: boolean;
}

interface Conversation {
  _id: string;
  sender: string;
  receiver: string;
  messages: Message[];
}

const ChatPage = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const user = useSelector((state: RootState) => state.user);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const currentDoctor = user.doctor.find(doc => doc._id === appointmentId);

  // Socket Connection
  useEffect(() => {
    if (!user._id) {
      setError("User ID not found");
      setIsLoading(false);
      return;
    }

    try {
      const newSocket = io(import.meta.env.VITE_WEBSOCKET_URL|| "http://localhost:3000", {
        withCredentials: true
      });

      newSocket.on("connect", () => {
        console.log("Connected to socket server");
        setIsConnected(true);
        newSocket.emit("joinChat", user._id);
      });

      newSocket.on("disconnect", () => {
        setIsConnected(false);
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setIsConnected(false);
        setError("Failed to connect to chat server");
      });

      newSocket.on("receiveMessage", (data) => {
        setConversation((prevConversation) => {
          if (!prevConversation) return null;
          return {
            ...prevConversation,
            messages: [...prevConversation.messages, data.message],
          };
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } catch (error) {
      console.error("Socket initialization error:", error);
      setError("Failed to initialize chat connection");
      setIsLoading(false);
    }
  }, [user._id]);

  // Auto-scroll
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation?.messages]);

  // Fetch Messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user._id || !appointmentId) {
        setError("Missing required information");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await chatApi.get('/messages', {
          params: {
            sender: user._id,
            receiver: appointmentId
          }
        });

        if (response.data) {
          if (response.data._id && Array.isArray(response.data.messages)) {
            setConversation(response.data);
            setError(null);
          } else {
            const newConversation: Conversation = {
              _id: '',
              sender: user._id,
              receiver: appointmentId,
              messages: []
            };
            setConversation(newConversation);
            setError(null);
          }
        } else {
          throw new Error("Invalid conversation data received");
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          const newConversation: Conversation = {
            _id: '',
            sender: user._id,
            receiver: appointmentId,
            messages: []
          };
          setConversation(newConversation);
          setError(null);
        } else {
          console.error("Failed to fetch messages:", error);
          setError("Failed to load conversation history");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [user._id, appointmentId]);

  // Send Message Handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim()) {
      return;
    }

    if (!socket || !user._id || !appointmentId) {
      setError("Cannot send message - connection not established");
      return;
    }

    try {
      const response = await chatApi.post('/send', {
        sender: user._id,
        receiver: appointmentId,
        text: inputMessage,
      });

      if (!response.data || !Array.isArray(response.data.messages)) {
        throw new Error("Invalid response data");
      }

      const newMessage = response.data.messages[response.data.messages.length - 1];

      socket.emit("sendMessage", {
        message: newMessage,
        receiverId: appointmentId
      });

      setConversation(response.data);
      setInputMessage("");
      setError(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Failed to send message:", error.response?.data || error.message);
        if (error.response?.status === 401) {
          setError("Authentication error. Please login again.");
        } else if (error.response?.status === 404) {
          setError("Conversation not found.");
        } else if (error.response?.status === 500) {
          setError("Server error. Please try again later.");
        } else {
          setError(`Failed to send message: ${error.response?.data?.message || 'Unknown error'}`);
        }
      } else {
        setError("Failed to send message. Please try again.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="chat-container">
        <div className="chat-loading">
          <div className="chat-loading__spinner"></div>
          <span>Loading conversation...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-container">
        <div className="chat-error">
          <div className="chat-error__message">
            <p>{error}</p>
            <button
              className="chat-error__retry-button"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentDoctor) {
    return (
      <div className="chat-container">
        <div className="chat-error">
          <div className="chat-error__message">
            <p>Doctor is not in online please check after some time</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-header__doctor-info">
          {currentDoctor.profile_pic && (
            <img
              src={currentDoctor.profile_pic}
              alt={currentDoctor.username}
              className="chat-header__doctor-avatar"
            />
          )}
          <div className="chat-header__doctor-details">
            <h3 className="chat-header__doctor-name">Dr. {currentDoctor.username}</h3>
            <p className="chat-header__doctor-specialization">
              {currentDoctor.department} | {currentDoctor.clinic_name}
            </p>
          </div>
        </div>
        <div className={`connection-status ${isConnected ? 'connection-status--connected' : 'connection-status--disconnected'}`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      <div className="chat-messages">
        <div className="chat-messages__wrapper" ref={chatContainerRef}>
          {conversation?.messages.length === 0 ? (
            <div className="chat-message chat-message--system">
              <div className="chat-message__bubble">
                <p className="chat-message__text">
                  Welcome! Start your conversation with Dr. {currentDoctor.username}
                </p>
                <p className="chat-message__subtext">
                  You can ask about your appointment, medical concerns, or any questions you may have.
                </p>
              </div>
            </div>
          ) : (
            conversation?.messages.map((message) => (
              <div
                key={message._id}
                className={`chat-message ${message.sender === user._id ? 'chat-message--sent' : 'chat-message--received'}`}
              >
                <div className="chat-message__bubble">
                  <p className="chat-message__text">{message.text}</p>
                  <span className="chat-message__time">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {message.seen && message.sender === user._id && (
                    <span className="chat-message__status">Seen</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="chat-footer">
        <form className="chat-footer__input-container" onSubmit={handleSendMessage}>
          <input
            type="text"
            className="chat-footer__input"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message here..."
            disabled={!isConnected}
          />
          <button
            type="submit"
            className="chat-footer__send-button"
            disabled={!isConnected || !inputMessage.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;