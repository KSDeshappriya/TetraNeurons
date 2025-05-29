import React, { useEffect, useState, useRef } from "react";
import { ref, push, onChildAdded } from "firebase/database";
import { db } from "../../services/firebase";
import {
  MessageSquare,
  Send,
  Search,
  AlertTriangle,
  Menu,
  X,
  LocateFixed,
  Loader2
} from "lucide-react";
import { authService } from "../../services/auth";
import { Navigate, useLocation } from "react-router";
import NavigationBar from "../../components/layout/Navigationbar";
import Footer from "../../components/layout/Footer";

interface Disaster {
  emergency_type: string;
  latitude: number;
  longitude: number;
  people_count: string;
  urgency_level: string;
}

type Message = {
  user: string;
  content: string;
  timestamp: string;
  avatar?: string;
};

const CommunicationHub: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportId, setReportId] = useState<string | null>(null);
  const [reportTitle, setReportTitle] = useState<string>("General Discussion");
  const [disaster, setDisaster] = useState<Disaster | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, filteredMessages]);

  // Get user info from token and setup
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      setLoading(false);
      return;
    }

    const tokenPayload = authService.getTokenPayload();
    if (tokenPayload) {
      const displayName = `${tokenPayload.name} (${tokenPayload.role.replace('_', ' ')})`;
      setUsername(displayName);
    }
    setLoading(false);
  }, []);

  // Extract reportId and setup chat
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const reportIdParam = queryParams.get("reportId");
    
    setReportId(reportIdParam);
    setMessages([]); // Clear messages when switching rooms

    if (reportIdParam) {
      setReportTitle(`Emergency Chat: ${reportIdParam}`);
      // Mock disaster data - replace with actual API call if needed
      setDisaster({
        emergency_type: "Fire",
        latitude: 6.9271,
        longitude: 79.8612,
        people_count: "50+",
        urgency_level: "High"
      });
    } else {
      setReportTitle("General Discussion");
      setDisaster(null);
    }

    // Setup message listener
    const chatPath = reportIdParam ? `messages/${reportIdParam}` : "messages/general";
    const chatRef = ref(db, chatPath);

    const unsubscribe = onChildAdded(chatRef, (snapshot) => {
      const msg = snapshot.val() as Message;
      const msgWithTimestamp = {
        ...msg,
        timestamp: msg.timestamp || new Date().toISOString(),
      };
      setMessages((prev) => [...prev, msgWithTimestamp]);
    });

    return () => unsubscribe();
  }, [location.search]);

  // Filter messages based on search
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

  // Redirect if not authenticated
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
        avatar: `https://api.dicebear.com/6.x/initials/svg?seed=${username}`,
      });
      setInput("");
    }
  };

  const shareLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationMessage = `📍 Location: https://maps.google.com/?q=${latitude},${longitude}`;
        setInput(locationMessage);
        setFetchingLocation(false);
      },
      (error) => {
        alert("Unable to retrieve your location.");
        console.error(error);
        setFetchingLocation(false);
      }
    );
  };

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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

      if (date.toDateString() === today.toDateString()) return "Today";
      if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
      return date.toLocaleDateString();
    } catch (e) {
      return "Unknown date";
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  const messagesToDisplay = searchQuery.trim() !== "" ? filteredMessages : messages;
  const messagesByDate: Record<string, Message[]> = {};
  
  messagesToDisplay.forEach((message) => {
    if (!message.timestamp) return;
    const date = formatDate(message.timestamp);
    if (!messagesByDate[date]) messagesByDate[date] = [];
    messagesByDate[date].push(message);
  });

  const uniqueUsers = [...new Set(messages.map((m) => m.user))];

  return (
    <>
      <NavigationBar />
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Header */}
          <div className="flex justify-between items-center mb-6 lg:hidden">
            <div className="flex items-center">
              <button
                className="p-2 mr-3 text-gray-600 hover:text-gray-900 bg-white/70 backdrop-blur-sm rounded-md shadow-md"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">Communication Hub</h1>
                <p className="text-sm text-gray-600">{reportTitle}</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden flex flex-col lg:flex-row h-[calc(100vh-160px)] border border-white/50">
            
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 w-72 bg-white/90 backdrop-blur-lg transform ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            } lg:relative lg:translate-x-0 transition-transform duration-300 flex-shrink-0 flex flex-col z-20 shadow-xl lg:shadow-none lg:border-r lg:border-blue-100`}>
              
              {/* Sidebar Header */}
              <div className="p-4 border-b border-blue-100 flex items-center justify-between">
                <h2 className="font-medium text-gray-800 flex items-center text-lg">
                  <MessageSquare className="h-5 w-5 mr-2 text-blue-500" />
                  Chat Rooms
                </h2>
                <button
                  className="lg:hidden p-1 text-gray-500 hover:text-gray-700"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search */}
              <div className="p-3 border-b border-blue-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    placeholder="Search messages..."
                    className="w-full pl-9 pr-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm bg-white/70"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {searchQuery.trim() !== "" && (
                  <div className="mt-2 text-xs text-gray-500 pl-1">
                    Found {filteredMessages.length} message{filteredMessages.length !== 1 ? "s" : ""}
                  </div>
                )}
              </div>

              {/* Current Room */}
              <div className="p-3">
                {reportId && (
                  <div className="flex items-center p-2 bg-blue-100 rounded-lg">
                    <div className="h-9 w-9 rounded-full bg-blue-200 flex items-center justify-center mr-3">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-800">Report: {reportId}</p>
                      <p className="text-xs text-gray-500">Emergency discussion</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Participants */}
              <div className="flex-1 overflow-y-auto p-3">
                <div className="text-xs font-semibold text-blue-600 uppercase mb-2">
                  Online • {uniqueUsers.length} Participant{uniqueUsers.length !== 1 ? "s" : ""}
                </div>
                <div className="space-y-1">
                  {uniqueUsers.map((user, idx) => (
                    <div key={idx} className="flex items-center p-2 rounded-lg hover:bg-blue-50">
                      <img
                        src={`https://api.dicebear.com/6.x/initials/svg?seed=${user}`}
                        alt={user}
                        className="h-8 w-8 rounded-full border border-blue-200 mr-3"
                      />
                      <div>
                        <p className="text-sm text-gray-800">{user}</p>
                        <p className="text-xs text-gray-500">Online</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-blue-50/20">
              
              {/* Chat Header */}
              <div className="p-4 bg-white/80 backdrop-blur-md border-b border-blue-100 shadow-md sticky top-0 z-10">
                <h2 className="font-semibold text-gray-800 text-xl">{reportTitle}</h2>
                <p className="text-sm text-gray-600">{uniqueUsers.length} participant{uniqueUsers.length !== 1 ? "s" : ""}</p>

                {/* Disaster Location Info */}
                {disaster && (
                  <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                      <span className="font-medium text-red-800">{disaster.emergency_type.toUpperCase()} - {disaster.urgency_level} Priority</span>
                    </div>
                    <div className="text-sm text-gray-700 space-y-1">
                      <div><strong>Location:</strong> {disaster.latitude}, {disaster.longitude}</div>
                      <div><strong>People Affected:</strong> {disaster.people_count}</div>
                      
                    </div>
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-center">
                    <p className="text-gray-500 italic">
                      {reportId ? "No messages yet in this emergency discussion." : "No messages yet. Start the conversation!"}
                    </p>
                  </div>
                ) : searchQuery.trim() !== "" && filteredMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-center">
                    <p className="text-gray-500 italic">No messages found for "{searchQuery}"</p>
                  </div>
                ) : (
                  Object.entries(messagesByDate).map(([date, dateMessages]) => (
                    <div key={date} className="mb-6">
                      <div className="flex justify-center mb-4">
                        <span className="bg-white/70 backdrop-blur-sm text-gray-700 text-xs px-3 py-1 rounded-full shadow-sm border border-blue-100">
                          {date}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {dateMessages.map((msg, idx) => (
                          <div key={idx} className={`flex ${msg.user === username ? "justify-end" : "justify-start"}`}>
                            {msg.user !== username && (
                              <img
                                src={`https://api.dicebear.com/6.x/initials/svg?seed=${msg.user}`}
                                alt={msg.user}
                                className="h-9 w-9 rounded-full mr-3 flex-shrink-0 border border-blue-200 shadow-sm"
                              />
                            )}

                            <div className={`max-w-[75%] px-4 py-2 rounded-xl shadow-md ${
                              msg.user === username
                                ? "bg-blue-500 text-white rounded-br-none"
                                : "bg-white/80 backdrop-blur-sm text-gray-800 rounded-bl-none border border-blue-100"
                            }`}>
                              {msg.user !== username && (
                                <div className="font-semibold text-sm text-blue-700 mb-1">{msg.user}</div>
                              )}
                              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                              <div className={`text-xs mt-1 text-right ${
                                msg.user === username ? "text-blue-200" : "text-gray-500"
                              }`}>
                                {formatTime(msg.timestamp)}
                              </div>
                            </div>

                            {msg.user === username && (
                              <img
                                src={`https://api.dicebear.com/6.x/initials/svg?seed=${msg.user}`}
                                alt="You"
                                className="h-9 w-9 rounded-full ml-3 flex-shrink-0 border border-blue-200 shadow-sm"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white/80 backdrop-blur-md border-t border-blue-100 shadow-lg sticky bottom-0 z-10">
                <div className="flex items-end space-x-3">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Type a message in ${reportId ? "emergency" : "general"} chat...`}
                    className="flex-1 border border-blue-200 rounded-xl focus:border-blue-400 focus:ring-blue-400 p-3 min-h-[56px] max-h-[150px] resize-y text-base text-gray-800 placeholder-gray-400 focus:outline-none bg-white/70"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  
                  <button
                    onClick={shareLocation}
                    disabled={fetchingLocation}
                    className="h-12 w-12 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg flex-shrink-0"
                  >
                    {fetchingLocation ? <Loader2 className="h-5 w-5 animate-spin" /> : <LocateFixed className="h-5 w-5" />}
                  </button>

                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || !username}
                    className="h-12 w-12 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg flex-shrink-0"
                  >
                    <Send className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-10 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
      <Footer />
    </>
  );
};

export default CommunicationHub;