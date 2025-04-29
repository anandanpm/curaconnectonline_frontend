import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { chatApi } from '../../api/chatApi';
import "./Chathistory.scss";

interface User {
  _id: string;
  username: string;
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

const ChatHistory = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const user = useSelector((state: RootState) => state.user);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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

  if (isLoading) {
    return (
      <div className="chat-container">
        <div className="chat-loading">
          <div className="chat-loading__spinner"></div>
          <span>Loading messages...</span>
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

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-history-title">Chat History</div>
      </div>
      
      <div className="chat-messages">
        <div className="chat-messages__wrapper" ref={chatContainerRef}>
          {!conversation || conversation.messages.length === 0 ? (
            <div className="chat-message chat-message--system">
              <div className="chat-message__bubble">
                <p className="chat-message__text">
                  No previous messages in this conversation.
                </p>
                <p className="chat-message__subtext">
                  Messages will appear here when they are sent or received.
                </p>
              </div>
            </div>
          ) : (
            conversation.messages.map((message) => (
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
    </div>
  );
};

export default ChatHistory;