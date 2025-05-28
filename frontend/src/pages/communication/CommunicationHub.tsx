import React, { useEffect, useState, useRef } from "react";
import { getDatabase, ref, push, onChildAdded } from "firebase/database";
import { db, firestore } from "../../services/firebase";
import {
  MessageSquare,
  Send,
  Search,
  AlertTriangle,
  Menu, // Added for mobile menu
  X, // Added for mobile menu close
} from "lucide-react";
import { authService } from "../../services/auth";
import { Navigate, useLocation, useNavigate } from "react-router";
import { doc, getDoc } from "firebase/firestore";

// Disaster interface based on the image
interface Disaster {
  ai_processing_time?: number;
  citizen_survival_guide?: string;
  created_at: number;
  disaster_id: string;
  emergency_type: string;
  geohash: string;
  government_report?: string;
  image_url?: string;
  latitude: number;
  longitude: number;
  people_count: string;
  situation: string;
  status: string;
  submitted_time: number;
  urgency_level: string;
  user_id: string;
}

type Message = {
  user: string;
  content: string;
  timestamp: string;
  isRead?: boolean;
  avatar?: string;
  reportId?: string;
};

const CommunicationHub: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportId, setReportId] = useState<string | null>(null);
  const [reportTitle, setReportTitle] = useState<string>("Group Discussion");
  const [disaster, setDisaster] = useState<Disaster | null>(null);
  const [disasterLoading, setDisasterLoading] = useState(false);
  const [disasterError, setDisasterError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar

  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling

  // Scroll to bottom of messages whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, filteredMessages]);

  // Extract reportId from URL and fetch disaster details
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const reportIdParam = queryParams.get("reportId");
    setReportId(reportIdParam);

    if (reportIdParam) {
      setReportTitle(`Report Discussion: ${reportIdParam}`);

      const fetchDisasterDetails = async () => {
        setDisasterLoading(true);
        setDisasterError(null);
        try {
          const disasterRef = doc(firestore, "disasters", reportIdParam);
          const disasterSnap = await getDoc(disasterRef);

          if (disasterSnap.exists()) {
            const disasterData = disasterSnap.data() as Disaster;
            setDisaster(disasterData);
            setReportTitle(`${disasterData.emergency_type.toUpperCase()} Report`);
          } else {
            setDisasterError("Disaster information not found");
          }
        } catch (error) {
          console.error("Error fetching disaster details:", error);
          setDisasterError("Failed to load disaster information");
        } finally {
          setDisasterLoading(false);
        }
      };

      fetchDisasterDetails();
    } else {
      setReportTitle("General Discussion");
      setDisaster(null);
    }
  }, [location.search]);

  // Fetch authenticated user's name
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userProfile = await authService.getUserProfile();
          setUsername(userProfile.name);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Listen for new messages
  useEffect(() => {
    setMessages([]); // Clear messages when reportId changes

    const chatPath = reportId ? `messages/${reportId}` : "messages/general";
    const chatRef = ref(db, chatPath);

    const unsubscribe = onChildAdded(chatRef, (snapshot) => {
      const msg = snapshot.val() as Message;
      const msgWithTimestamp = {
        ...msg,
        timestamp: msg.timestamp || new Date().toISOString(), // Ensure timestamp exists
      };
      setMessages((prev) => [...prev, msgWithTimestamp]);
    });

    return () => {
      // Clean up listener when component unmounts or reportId changes
      unsubscribe();
    };
  }, [reportId]);

  // Filter messages based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredMessages([]);
    } else {
      const filtered = messages.filter(
        (msg) =>
          msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          msg.user.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMessages(filtered);
    }
  }, [searchQuery, messages]);

  // Redirect to login if not authenticated
  if (!loading && !authService.isAuthenticated()) {
    return <Navigate to="/auth/signin" />;
  }

  const sendMessage = () => {
    if (input.trim() && username) {
      const chatPath = reportId ? `messages/${reportId}` : "messages/general";
      const chatRef = ref(db, chatPath);

      push(chatRef, {
        user: username,
        content: input,
        timestamp: new Date().toISOString(),
        isRead: false,
        avatar: `https://api.dicebear.com/6.x/initials/svg?seed=${username}`,
      });
      setInput("");
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return "";
    }
  };

  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
      } else {
        return date.toLocaleDateString();
      }
    } catch (e) {
      return "Unknown date";
    }
  };

  // Group messages by date - use filtered messages when search is active
  const messagesByDate: Record<string, Message[]> = {};
  const messagesToDisplay = searchQuery.trim() !== "" ? filteredMessages : messages;

  messagesToDisplay.forEach((message) => {
    if (!message.timestamp) return;

    const date = formatDate(message.timestamp);
    if (!messagesByDate[date]) {
      messagesByDate[date] = [];
    }
    messagesByDate[date].push(message);
  });

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 lg:block">
          <div className="flex items-center">
            <button
              className="lg:hidden p-2 mr-3 text-gray-600 hover:text-gray-900"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Communication Hub</h1>
              <p className="text-gray-600">
                {reportId
                  ? `Discussing report: ${reportId}`
                  : "Connect and chat with team members"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col lg:flex-row h-[calc(100vh-200px)]">
          {/* Left sidebar - hidden on mobile by default, shown when isSidebarOpen is true */}
          <div
            className={`absolute inset-y-0 left-0 transform ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            } lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out w-80 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col z-10 lg:z-auto`}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-medium text-gray-900 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Chat Rooms
              </h2>
              <button
                className="lg:hidden text-gray-600 hover:text-gray-900"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  placeholder="Search messages"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {searchQuery.trim() !== "" && (
                <div className="mt-2 text-sm text-gray-500">
                  Found {filteredMessages.length}{" "}
                  {filteredMessages.length === 1 ? "message" : "messages"}
                </div>
              )}
            </div>

            {/* Chat rooms list */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="text-xs font-medium text-gray-500 mb-2">CHAT ROOMS</div>
              <div className="space-y-2">
                {/* General chat room option */}
                <div
                  onClick={() => {
                    navigate("/private/CommunicationHub");
                    setIsSidebarOpen(false); // Close sidebar on selection
                  }}
                  className={`flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer ${
                    !reportId ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="relative mr-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">General Discussion</p>
                    <p className="text-xs text-gray-500">Team-wide chat</p>
                  </div>
                </div>

                {/* Current report room (if applicable) */}
                {reportId && (
                  <div
                    className="flex items-center p-2 bg-blue-50 rounded-md cursor-pointer"
                    onClick={() => setIsSidebarOpen(false)} // Close sidebar if already in report chat
                  >
                    <div className="relative mr-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Report: {reportId}</p>
                      <p className="text-xs text-gray-500">Report-specific discussion</p>
                    </div>
                  </div>
                )}

                {/* Participants section */}
                <div className="pt-4">
                  <div className="text-xs font-medium text-gray-500 mb-2">
                    ONLINE •{" "}
                    {messages.length > 0
                      ? [...new Set(messages.map((m) => m.user))].length
                      : 0}{" "}
                    PARTICIPANTS
                  </div>
                  {messages.length > 0 &&
                    [...new Set(messages.map((m) => m.user))].map((user, idx) => (
                      <div key={idx} className="flex items-center p-2 hover:bg-gray-50 rounded-md">
                        <div className="relative mr-3">
                          <img
                            src={`https://api.dicebear.com/6.x/initials/svg?seed=${user}`}
                            alt={user}
                            className="h-8 w-8 rounded-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "https://via.placeholder.com/32?text=U";
                            }}
                          />
                          <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-400 ring-1 ring-white"></span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user}</p>
                          <p className="text-xs text-gray-500">Online</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col">
            {/* Chat header */}
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-medium text-gray-900">{reportTitle}</h2>
              <p className="text-sm text-gray-500">
                {messages.length > 0 ? [...new Set(messages.map((m) => m.user))].length : 0}{" "}
                participants
              </p>

              {/* Display disaster details when available */}
              {reportId && disasterLoading && (
                <div className="mt-2 text-sm text-gray-500">Loading disaster information...</div>
              )}

              {reportId && disasterError && (
                <div className="mt-2 flex items-center text-sm text-red-600">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {disasterError}
                </div>
              )}

              {reportId && disaster && !disasterLoading && !disasterError && (
                <div className="mt-3 bg-gray-50 rounded-md p-3 border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Emergency:</span>
                      <span className="ml-1 font-medium text-gray-900">
                        {disaster.emergency_type}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span className="ml-1 font-medium text-gray-900">{disaster.status}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Location:</span>
                      <span className="ml-1 font-medium text-gray-900">{`${disaster.latitude}, ${disaster.longitude}`}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">People affected:</span>
                      <span className="ml-1 font-medium text-gray-900">
                        {disaster.people_count}
                      </span>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <span className="text-gray-500">Situation:</span>
                      <span className="ml-1 font-medium text-gray-900">{disaster.situation}</span>
                    </div>
                    {disaster.citizen_survival_guide && (
                      <div className="col-span-1 md:col-span-2">
                        <span className="text-gray-500">Survival guide:</span>
                        <span className="ml-1 font-medium text-gray-900">
                          {disaster.citizen_survival_guide}
                        </span>
                      </div>
                    )}
                    {disaster.government_report && (
                      <div className="col-span-1 md:col-span-2">
                        <span className="text-gray-500">Government report:</span>
                        <span className="ml-1 font-medium text-gray-900">
                          {disaster.government_report}
                        </span>
                      </div>
                    )}
                    {disaster.image_url && (
                      <div className="col-span-1 md:col-span-2 mt-2">
                        <img
                          src={disaster.image_url}
                          alt="Disaster scene"
                          className="h-32 w-full object-cover rounded-md"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://via.placeholder.com/300x200?text=Image+Unavailable";
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-gray-500">
                      {reportId
                        ? `No messages yet in this report discussion. Be the first to send one!`
                        : `No general messages yet. Start the conversation!`}
                    </p>
                  </div>
                </div>
              ) : searchQuery.trim() !== "" && filteredMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-gray-500">No messages found for "{searchQuery}"</p>
                  </div>
                </div>
              ) : (
                Object.entries(messagesByDate).map(([date, dateMessages]) => (
                  <div key={date} className="mb-6">
                    <div className="flex justify-center mb-4">
                      <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                        {date}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {dateMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${
                            msg.user === username ? "justify-end" : "justify-start"
                          }`}
                        >
                          {msg.user !== username && (
                            <img
                              src={`https://api.dicebear.com/6.x/initials/svg?seed=${msg.user}`}
                              alt={msg.user}
                              className="h-10 w-10 rounded-full mr-3 flex-shrink-0"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "https://via.placeholder.com/40?text=U";
                              }}
                            />
                          )}

                          <div
                            className={`max-w-[70%] ${
                              msg.user === username
                                ? "bg-blue-100 text-blue-900 rounded-l-lg rounded-br-lg"
                                : "bg-white border border-gray-200 rounded-r-lg rounded-bl-lg"
                            } p-3 shadow-sm`}
                          >
                            {msg.user !== username && (
                              <div className="font-medium text-sm text-gray-900 mb-1">
                                {msg.user}
                              </div>
                            )}
                            <p className="text-sm break-words">{msg.content}</p> {/* Added break-words */}

                            <div className="text-xs text-gray-500 mt-1 text-right">
                              {msg.timestamp && formatTime(msg.timestamp)}
                            </div>
                          </div>

                          {msg.user === username && (
                            <img
                              src={`https://api.dicebear.com/6.x/initials/svg?seed=${msg.user}`}
                              alt="You"
                              className="h-10 w-10 rounded-full ml-3 flex-shrink-0"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "https://via.placeholder.com/40?text=U";
                              }}
                            />
                          )}
                        </div>
                      ))}
                      <div ref={messagesEndRef} /> {/* Element to scroll into view */}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Type a message in ${reportId ? "report chat" : "general chat"}...`}
                    className="w-full border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 p-2 min-h-[80px] resize-none" // Added resize-none
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  ></textarea>
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || !username}
                  className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:bg-gray-300"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationHub;