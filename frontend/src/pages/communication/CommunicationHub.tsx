import React, { useEffect, useState } from "react";
import { getDatabase, ref, push, onChildAdded } from "firebase/database";
import { db } from "../../services/firebase"; // Ensure firebase.ts exports the initialized db
import {
  MessageSquare,
  Send,
  Search,
  Plus,
} from "lucide-react";

type Message = {
  user: string;
  content: string;
  timestamp: string;
  isRead?: boolean;
  avatar?: string;
};

const CommunicationHub: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [username] = useState("Guest" + Math.floor(Math.random() * 10000));
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  
  useEffect(() => {
    const chatRef = ref(db, "messages");
    onChildAdded(chatRef, (snapshot) => {
      const msg = snapshot.val() as Message;
      const msgWithTimestamp = {
        ...msg,
        timestamp: msg.timestamp || new Date().toISOString(),
      };
      setMessages((prev) => [...prev, msgWithTimestamp]);
    });
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredMessages([]);
    } else {
      const filtered = messages.filter((msg) => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.user.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMessages(filtered);
    }
  }, [searchQuery, messages]);

  const sendMessage = () => {
    if (input.trim()) {
      const chatRef = ref(db, "messages");
      push(chatRef, { 
        user: username, 
        content: input,
        timestamp: new Date().toISOString(),
        isRead: false,
        avatar: `https://api.dicebear.com/6.x/initials/svg?seed=${username}`
      });
      setInput("");
    }
  };
  
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
        return 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
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

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex mb-6">
          <div className="mr-4">
            <h1 className="text-2xl font-bold text-gray-900">Communication Hub</h1>
            <p className="text-gray-600">Connect and chat with team members</p>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="flex h-[calc(100vh-200px)]">
            {/* Left sidebar */}
            <div className="w-80 border-r border-gray-200 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-medium text-gray-900 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Group Chat
                </h2>
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
                    Found {filteredMessages.length} {filteredMessages.length === 1 ? 'message' : 'messages'}
                  </div>
                )}
              </div>
              
              {/* Participant list */}
              <div className="flex-1 overflow-y-auto p-3">
                <div className="text-xs font-medium text-gray-500 mb-2">ONLINE • {messages.length > 0 ? [...new Set(messages.map(m => m.user))].length : 0} PARTICIPANTS</div>
                <div className="space-y-2">
                  {messages.length > 0 && 
                    [...new Set(messages.map(m => m.user))].map((user, idx) => (
                      <div key={idx} className="flex items-center p-2 hover:bg-gray-50 rounded-md">
                        <div className="relative mr-3">
                          <img 
                            src={`https://api.dicebear.com/6.x/initials/svg?seed=${user}`}
                            alt={user} 
                            className="h-8 w-8 rounded-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/32?text=U';
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
              
              {/* Create new chat button */}
              <div className="p-3 border-t border-gray-200">
                <button className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Plus className="h-4 w-4 mr-2" />
                  New Conversation
                </button>
              </div>
            </div>
            
            {/* Chat area */}
            <div className="flex-1 flex flex-col">
              {/* Chat header */}
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-medium text-gray-900">Group Discussion</h2>
                <p className="text-sm text-gray-500">
                  {messages.length > 0 ? [...new Set(messages.map(m => m.user))].length : 0} participants
                </p>
              </div>
              
              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {searchQuery.trim() !== "" && filteredMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-gray-500">No messages found for "{searchQuery}"</p>
                    </div>
                  </div>
                ) : (
                  Object.entries(messagesByDate).map(([date, dateMessages]) => (
                    <div key={date} className="mb-6">
                      <div className="flex justify-center mb-4">
                        <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">{date}</span>
                      </div>
                      
                      <div className="space-y-3">
                        {dateMessages.map((msg, idx) => (
                          <div 
                            key={idx} 
                            className={`flex ${msg.user === username ? 'justify-end' : 'justify-start'}`}
                          >
                            {msg.user !== username && (
                              <img 
                                src={`https://api.dicebear.com/6.x/initials/svg?seed=${msg.user}`}
                                alt={msg.user} 
                                className="h-10 w-10 rounded-full mr-3 flex-shrink-0"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://via.placeholder.com/40?text=U';
                                }}
                              />
                            )}
                            
                            <div 
                              className={`max-w-[70%] ${
                                msg.user === username 
                                  ? 'bg-blue-100 text-blue-900 rounded-l-lg rounded-br-lg' 
                                  : 'bg-white border border-gray-200 rounded-r-lg rounded-bl-lg'
                              } p-3 shadow-sm`}
                            >
                              {msg.user !== username && (
                                <div className="font-medium text-sm text-gray-900 mb-1">{msg.user}</div>
                              )}
                              <p className="text-sm">{msg.content}</p>
                              
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
                                  target.src = 'https://via.placeholder.com/40?text=U';
                                }}
                              />
                            )}
                          </div>
                        ))}
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
                      placeholder="Type a message..."
                      className="w-full border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 p-2 min-h-[80px]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    ></textarea>
                  </div>
                  <button 
                    onClick={sendMessage}
                    disabled={!input.trim()}
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
    </div>
  );
};

export default CommunicationHub;