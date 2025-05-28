import React, { useEffect, useState, useRef } from "react";
import { getDatabase, ref, push, get, onChildAdded } from "firebase/database";
import { db } from "../../services/firebase";
import {
  MessageSquare,
  Send,
  Search,
  AlertTriangle,
  Menu,
  X,
  LocateFixed, Loader2
} from "lucide-react";
import { authService } from "../../services/auth";
import { Navigate, useLocation } from "react-router";

import NavigationBar from "../../components/layout/Navigationbar";
import Footer from "../../components/layout/Footer";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);


  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, filteredMessages]);

  // Extract reportId from URL and fetch disaster details
  useEffect(() => {
    console.log("useEffect triggered. location.search:", location.search);

    const queryParams = new URLSearchParams(location.search);
    const reportIdParam = queryParams.get("reportId");
    console.log("Parsed reportIdParam:", reportIdParam);

    setReportId(reportIdParam);

    if (reportIdParam) {
      setReportTitle(`Report Discussion: ${reportIdParam}`);

      const fetchDisasterDetails = async () => {
        console.log("Fetching disaster details from RTDB...");
        setDisasterLoading(true);
        setDisasterError(null);

        try {
          const db = getDatabase();
          const disasterRef = ref(db, `disasters/${reportIdParam}`);
          console.log("Created RTDB ref:", disasterRef);

          const snapshot = await get(disasterRef);
          console.log("Snapshot fetched:", snapshot);

          if (snapshot.exists()) {
            const disasterData = snapshot.val();
            console.log("Disaster data found:", disasterData);

            //setDisaster(disasterData);
            setReportTitle(`${disasterData.emergency_type.toUpperCase()} Chat Room`);
          } else {
            console.warn("Disaster not found with reportId:", reportIdParam);
            setDisasterError("Disaster information not found");
          }
        } catch (error) {
          console.error("Error fetching disaster details from RTDB:", error);
          setDisasterError("Failed to load disaster information");
        } finally {
          setDisasterLoading(false);
          console.log("Finished fetching disaster details.");
        }
      };

      fetchDisasterDetails();
    } else {
      console.warn("No reportId provided in query parameters.");
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
        timestamp: msg.timestamp || new Date().toISOString(),
      };
      setMessages((prev) => [...prev, msgWithTimestamp]);
    });

    return () => {
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
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <NavigationBar />
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 to-indigo-100 p-4 font-sans antialiased">

        <div className="max-w-7xl mx-auto">
          {/* Header (visible on mobile) */}
          <div className="flex justify-between items-center mb-6 lg:hidden">
            <div className="flex items-center">
              <button
                className="p-2 mr-3 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md bg-white/70 backdrop-blur-sm shadow-md"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                aria-label="Toggle sidebar"
              >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">Communication Hub</h1>
                <p className="text-sm text-gray-600">
                  {reportId
                    ? `Discussing report: ${reportId}`
                    : "Connect and chat with team members"}
                </p>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden flex flex-col lg:flex-row h-[calc(100vh-160px)] border border-white/50">
            {/* Left sidebar */}
            <div
              className={`fixed inset-y-0 left-0 w-72 bg-white/90 backdrop-blur-lg transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                } lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out flex-shrink-0 flex flex-col z-20 shadow-xl lg:shadow-none lg:border-r lg:border-blue-100`}
            >
              {/* Header */}
              <div className="p-4 border-b border-blue-100 flex items-center justify-between">
                <h2 className="font-medium text-gray-800 flex items-center text-lg">
                  <MessageSquare className="h-5 w-5 mr-2 text-blue-500" />
                  Chat Rooms
                </h2>
                <button
                  className="lg:hidden p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
                  onClick={() => setIsSidebarOpen(false)}
                  aria-label="Close sidebar"
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
                    className="w-full pl-9 pr-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm bg-white/70"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {searchQuery.trim() !== "" && (
                  <div className="mt-2 text-xs text-gray-500 pl-1">
                    Found {filteredMessages.length}{" "}
                    {filteredMessages.length === 1 ? "message" : "messages"}
                  </div>
                )}
              </div>

              {/* Chat rooms list */}
              <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">

                <div className="space-y-1">

                  {/* Current report room (if applicable) */}
                  {reportId && (
                    <div
                      className="flex items-center p-2 bg-blue-100 rounded-lg cursor-pointer shadow-sm"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <div className="relative mr-3 flex-shrink-0">
                        <div className="h-9 w-9 rounded-full bg-blue-200 flex items-center justify-center">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-800">Report: {reportId}</p>
                        <p className="text-xs text-gray-500">Report-specific discussion</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Participants section */}
                <div className="pt-4 mt-4 border-t border-blue-100">
                  <div className="text-xs font-semibold text-blue-600 uppercase mb-2 px-1">
                    Online •{" "}
                    {messages.length > 0
                      ? [...new Set(messages.map((m) => m.user))].length
                      : 0}{" "}
                    Participants
                  </div>
                  <div className="space-y-1">
                    {messages.length > 0 &&
                      [...new Set(messages.map((m) => m.user))].map((user, idx) => (
                        <div key={idx} className="flex items-center p-2 rounded-lg hover:bg-blue-50">
                          <div className="relative mr-3 flex-shrink-0">
                            <img
                              src={`https://api.dicebear.com/6.x/initials/svg?seed=${user}`}
                              alt={user}
                              className="h-8 w-8 rounded-full border border-blue-200"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXVzZXItc3RhbmRhcmQiPjxwYXRoIGQ9Ik0xOSAxOVY1YTIgMiAwIDAgMC0yLTJIMDdhMiAyIDAgMCAwLTIgMi41TDggMTIuNXpNMTYgMThhMSAxIDAgMCAxLTEgMUgxMWEyIDIgMCAwIDEtMi0yVjExYTMgMyAwIDAgMSAzLTNoMkE3IDcgMCAwIDEgMTYgMTZWMThaIiBmaWxsPSJjdXJyZW50Q29sb3IiLz48cGF0aCBkPSJNOCAxMmg0Yy0xLjUgMC0yLjUgMS0yLjUgMi41TDEwIDExIi8+PC9zdmc+"
                              }}
                            />
                            <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-1 ring-white"></span>
                          </div>
                          <div>
                            <p className="text-sm text-gray-800">{user}</p>
                            <p className="text-xs text-gray-500">Online</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col bg-blue-50/20 relative custom-scrollbar">
              {/* Chat header */}
              <div className="p-4 bg-white/80 backdrop-blur-md border-b border-blue-100 shadow-md sticky top-0 z-10">
                <h2 className="font-semibold text-gray-800 text-xl">{reportTitle}</h2>
                <p className="text-sm text-gray-600">
                  {messages.length > 0 ? [...new Set(messages.map((m) => m.user))].length : 0}{" "}
                  participants
                </p>

                {/* Disaster details */}
                {reportId && disasterLoading && (
                  <div className="mt-3 text-sm text-gray-500 animate-pulse">
                    Loading disaster information...
                  </div>
                )}

                {reportId && disasterError && (
                  <div className="mt-3 flex items-center text-sm text-red-600 bg-red-100 p-2 rounded-md border border-red-300">
                    <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{disasterError}</span>
                  </div>
                )}

                {reportId && disaster && !disasterLoading && !disasterError && (
                  <div className="mt-4 bg-white/70 rounded-lg p-4 border border-blue-200 shadow-sm text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      
                      <div>
                        <span className="text-gray-600 font-medium">Location:</span>{" "}
                        <span className="text-gray-800">{`${disaster.latitude}, ${disaster.longitude}`}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium">People affected:</span>{" "}
                        <span className="text-gray-800">{disaster.people_count}</span>
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <span className="text-gray-600 font-medium">Situation:</span>{" "}
                        <span className="text-gray-800">{disaster.situation}</span>
                      </div>
                      {disaster.citizen_survival_guide && (
                        <div className="col-span-1 md:col-span-2">
                          <span className="text-gray-600 font-medium">Survival guide:</span>{" "}
                          <span className="text-gray-800">
                            {disaster.citizen_survival_guide}
                          </span>
                        </div>
                      )}
                      {disaster.government_report && (
                        <div className="col-span-1 md:col-span-2">
                          <span className="text-gray-600 font-medium">Government report:</span>{" "}
                          <span className="text-gray-800">
                            {disaster.government_report}
                          </span>
                        </div>
                      )}
                      {disaster.image_url && (
                        <div className="col-span-1 md:col-span-2 mt-2">
                          <img
                            src={disaster.image_url}
                            alt="Disaster scene"
                            className="w-full h-40 object-cover rounded-md border border-blue-200"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "https://via.placeholder.com/400x160?text=Image+Unavailable";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-center">
                    <p className="text-gray-500 italic">
                      {reportId
                        ? `No messages yet in this report discussion. Be the first to send one!`
                        : `No general messages yet. Start the conversation!`}
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
                          <div
                            key={idx}
                            className={`flex ${msg.user === username ? "justify-end" : "justify-start"
                              }`}
                          >
                            {msg.user !== username && (
                              <img
                                src={`https://api.dicebear.com/6.x/initials/svg?seed=${msg.user}`}
                                alt={msg.user}
                                className="h-9 w-9 rounded-full mr-3 flex-shrink-0 border border-blue-200 shadow-sm"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xOSAxOVY1YTIgMiAwIDAg0S0yLTJIMDdhMiAyIDAgMCAwLTIgMi41TDggMTIuNXpNMTYgMThhMSAxIDAgMCAxLTEgMUgxMWEyIDIgMCAwIDEtMi0yVjExYTMgMyAwIDAgMSAzLTNoMkE3IDcgMCAwIDEgMTYgMTZWMThaIiBmaWxsPSJjdXJyZW50Q29sb3IiLz48cGF0aCBkPSJNOCAxMmg0Yy0xLjUgMC0yLjUgMS0yLjUgMi41TDEwIDExIi8+PC9zdmc+"
                                }}
                              />
                            )}

                            <div
                              className={`max-w-[75%] px-4 py-2 rounded-xl shadow-md ${msg.user === username
                                ? "bg-blue-500 text-white rounded-br-none"
                                : "bg-white/80 backdrop-blur-sm text-gray-800 rounded-bl-none border border-blue-100"
                                }`}
                            >
                              {msg.user !== username && (
                                <div className="font-semibold text-sm text-blue-700 mb-1">
                                  {msg.user}
                                </div>
                              )}
                              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                {msg.content}
                              </p>

                              <div
                                className={`text-xs mt-1 ${msg.user === username ? "text-blue-200" : "text-gray-500"
                                  } text-right`}
                              >
                                {msg.timestamp && formatTime(msg.timestamp)}
                              </div>
                            </div>

                            {msg.user === username && (
                              <img
                                src={`https://api.dicebear.com/6.x/initials/svg?seed=${msg.user}`}
                                alt="You"
                                className="h-9 w-9 rounded-full ml-3 flex-shrink-0 border border-blue-200 shadow-sm"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xOSAxOVY1YTIgMiAwIDAg0S0yLTJIMDdhMiAyIDAgMCAwLTIgMi41TDggMTIuNXpNMTYgMThhMSAxIDAgMCAxLTEgMUgxMWEyIDIgMCAwIDEtMi0yVjExYTMgMyAwIDAgMSAzLTNoMkE3IDcgMCAwIDEgMTYgMTZWMThaIiBmaWxsPSJjdXJyZW50Q29sb3IiLz48cGF0aCBkPSJNOCAxMmg0Yy0xLjUgMC0yLjUgMS0yLjUgMi41TDEwIDExIi8+PC9zdmc+"
                                }}
                              />
                            )}
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message input */}
              <div className="p-4 bg-white/80 backdrop-blur-md border-t border-blue-100 shadow-lg sticky bottom-0 z-10">
                <div className="flex items-end space-x-3">
                  <div className="flex-1">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={`Type a message in ${reportId ? "this report" : "general"} chat...`}
                      className="w-full border border-blue-200 rounded-xl focus:border-blue-400 focus:ring-blue-400 p-3 min-h-[56px] max-h-[150px] resize-y text-base text-gray-800 placeholder-gray-400 focus:outline-none bg-white/70"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    ></textarea>
                  </div>
                  <button
                    onClick={() => {
                      if (!navigator.geolocation) {
                        alert("Geolocation is not supported by your browser.");
                        return;
                      }

                      setFetchingLocation(true);

                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          const { latitude, longitude } = position.coords;
                          const locationMessage = `📍 Location: https://maps.google.com/?q=${latitude},${longitude}`;
                          setInput(locationMessage);          // <-- update textarea
                          sendMessage();       // <-- send location
                          setFetchingLocation(false);
                        },
                        (error) => {
                          alert("Unable to retrieve your location.");
                          console.error(error);
                          setFetchingLocation(false);
                        }
                      );
                    }}
                    disabled={fetchingLocation}
                    className="h-12 w-12 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 active:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 shadow-lg flex-shrink-0"
                    aria-label="Share location"
                  >
                    {fetchingLocation ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <LocateFixed className="h-5 w-5" />
                    )}
                  </button>



                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || !username}
                    className="h-12 w-12 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 shadow-lg flex-shrink-0"
                    aria-label="Send message"
                  >
                    <Send className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-10 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default CommunicationHub;