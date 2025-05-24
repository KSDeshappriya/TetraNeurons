import React, { useState } from 'react';
import { 
  MessageSquare, 
  Users, 
  User, 
  Send, 
  Search, 
  Bell, 
  Paperclip, 
  Image, 
  Plus, 
  ChevronRight,
  Clock,
  Phone,
  Video,
  MoreVertical,
  ArrowDown
} from 'lucide-react';
import Card from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    status?: 'online' | 'away' | 'offline';
  };
  content: string;
  timestamp: string;
  isRead: boolean;
  attachments?: Array<{
    id: string;
    type: 'image' | 'file';
    name: string;
    url: string;
    size?: string;
  }>;
}

interface Conversation {
  id: string;
  type: 'direct' | 'group';
  participants: Array<{
    id: string;
    name: string;
    avatar: string;
    role: string;
    status?: 'online' | 'away' | 'offline';
  }>;
  lastMessage: Message;
  unreadCount: number;
}

const CommunicationHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'messages' | 'teams'>('messages');
  const [selectedConversation, setSelectedConversation] = useState<string | null>('conv-001');
  const [newMessage, setNewMessage] = useState('');
  
  // Mock conversations data
  const conversations: Conversation[] = [
    {
      id: 'conv-001',
      type: 'direct',
      participants: [
        {
          id: 'user-002', // Not the current user
          name: 'Dr. Sarah Johnson',
          avatar: '/avatars/sarah.jpg',
          role: 'Medical Response',
          status: 'online'
        }
      ],
      lastMessage: {
        id: 'msg-001',
        sender: {
          id: 'user-002',
          name: 'Dr. Sarah Johnson',
          avatar: '/avatars/sarah.jpg',
          role: 'Medical Response'
        },
        content: "We need additional medical supplies at the south evacuation center. Can you coordinate?",
        timestamp: '2023-06-15T14:30:00',
        isRead: false
      },
      unreadCount: 3
    },
    {
      id: 'conv-002',
      type: 'group',
      participants: [
        {
          id: 'user-003',
          name: 'Emergency Response Team',
          avatar: '/avatars/team.jpg',
          role: 'Team',
          status: 'online'
        }
      ],
      lastMessage: {
        id: 'msg-002',
        sender: {
          id: 'user-003',
          name: 'Mike Chen',
          avatar: '/avatars/mike.jpg',
          role: 'Rescue Coordinator'
        },
        content: "Updates on the north district: roads are now accessible, power still out in sectors 3-5.",
        timestamp: '2023-06-15T10:15:00',
        isRead: true
      },
      unreadCount: 0
    },
    {
      id: 'conv-003',
      type: 'direct',
      participants: [
        {
          id: 'user-004',
          name: 'Alex Rodriguez',
          avatar: '/avatars/alex.jpg',
          role: 'Volunteer Coordinator',
          status: 'away'
        }
      ],
      lastMessage: {
        id: 'msg-003',
        sender: {
          id: 'user-001', // Current user
          name: 'You',
          avatar: '/avatars/you.jpg',
          role: 'Volunteer'
        },
        content: "I\"ve submitted my report for the west side flood relief efforts.",
        timestamp: '2023-06-14T16:45:00',
        isRead: true
      },
      unreadCount: 0
    }
  ];
  
  const messages: Record<string, Message[]> = {
    'conv-001': [
      {
        id: 'msg-101',
        sender: {
          id: 'user-002',
          name: 'Dr. Sarah Johnson',
          avatar: '/avatars/sarah.jpg',
          role: 'Medical Response'
        },
        content: "Hello there! How is the volunteer work going?",
        timestamp: '2023-06-15T09:30:00',
        isRead: true
      },
      {
        id: 'msg-102',
        sender: {
          id: 'user-001', // Current user
          name: 'You',
          avatar: '/avatars/you.jpg',
          role: 'Volunteer'
        },
        content: "It is going well! I have been helping at the downtown shelter for the past two days.",
        timestamp: '2023-06-15T09:45:00',
        isRead: true
      },
      {
        id: 'msg-103',
        sender: {
          id: 'user-002',
          name: 'Dr. Sarah Johnson',
          avatar: '/avatars/sarah.jpg',
          role: 'Medical Response'
        },
        content: "That is great to hear. We need additional medical supplies at the south evacuation center. Can you coordinate?",
        timestamp: '2023-06-15T14:30:00',
        isRead: false,
        attachments: [
          {
            id: 'att-001',
            type: 'file',
            name: 'supply_needs.pdf',
            url: '/files/supply_needs.pdf',
            size: '1.2 MB'
          }
        ]
      },
      {
        id: 'msg-104',
        sender: {
          id: 'user-002',
          name: 'Dr. Sarah Johnson',
          avatar: '/avatars/sarah.jpg',
          role: 'Medical Response'
        },
        content: "I have attached the list of needed supplies and quantities.",
        timestamp: '2023-06-15T14:31:00',
        isRead: false
      },
      {
        id: 'msg-105',
        sender: {
          id: 'user-002',
          name: 'Dr. Sarah Johnson',
          avatar: '/avatars/sarah.jpg',
          role: 'Medical Response'
        },
        content: "Please let me know if you can help with this by today.",
        timestamp: '2023-06-15T14:32:00',
        isRead: false
      }
    ],
    'conv-002': [
      {
        id: 'msg-201',
        sender: {
          id: 'user-005',
          name: 'James Wilson',
          avatar: '/avatars/james.jpg',
          role: 'Logistics'
        },
        content: "Team, we need to coordinate the distribution of water and food supplies today.",
        timestamp: '2023-06-14T08:15:00',
        isRead: true
      },
      {
        id: 'msg-202',
        sender: {
          id: 'user-006',
          name: 'Lisa Patel',
          avatar: '/avatars/lisa.jpg',
          role: 'Communications'
        },
        content: "I can handle the east district route. Already have three trucks ready.",
        timestamp: '2023-06-14T08:25:00',
        isRead: true
      },
      {
        id: 'msg-203',
        sender: {
          id: 'user-001', // Current user
          name: 'You',
          avatar: '/avatars/you.jpg',
          role: 'Volunteer'
        },
        content: "I will take the south district with my team. We have 6 volunteers available today.",
        timestamp: '2023-06-14T08:30:00',
        isRead: true
      },
      {
        id: 'msg-204',
        sender: {
          id: 'user-003',
          name: 'Mike Chen',
          avatar: '/avatars/mike.jpg',
          role: 'Rescue Coordinator'
        },
        content: "Updates on the north district: roads are now accessible, power still out in sectors 3-5.",
        timestamp: '2023-06-15T10:15:00',
        isRead: true,
        attachments: [
          {
            id: 'att-002',
            type: 'image',
            name: 'road_status.jpg',
            url: '/images/road_status.jpg'
          }
        ]
      }
    ],
    'conv-003': [
      {
        id: 'msg-301',
        sender: {
          id: 'user-004',
          name: 'Alex Rodriguez',
          avatar: '/avatars/alex.jpg',
          role: 'Volunteer Coordinator'
        },
        content: "Hi there! Can you send me your report on the west side flood relief efforts?",
        timestamp: '2023-06-13T15:20:00',
        isRead: true
      },
      {
        id: 'msg-302',
        sender: {
          id: 'user-001', // Current user
          name: 'You',
          avatar: '/avatars/you.jpg',
          role: 'Volunteer'
        },
        content: "Sure! I have been working on it and will send it shortly.",
        timestamp: '2023-06-14T09:10:00',
        isRead: true
      },
      {
        id: 'msg-303',
        sender: {
          id: 'user-004',
          name: 'Alex Rodriguez',
          avatar: '/avatars/alex.jpg',
          role: 'Volunteer Coordinator'
        },
        content: "Great, thank you. We need it for the coordination meeting tomorrow.",
        timestamp: '2023-06-14T09:15:00',
        isRead: true
      },
      {
        id: 'msg-304',
        sender: {
          id: 'user-001', // Current user
          name: 'You',
          avatar: '/avatars/you.jpg',
          role: 'Volunteer'
        },
        content: "I have submitted my report for the west side flood relief efforts.",
        timestamp: '2023-06-14T16:45:00',
        isRead: true,
        attachments: [
          {
            id: 'att-003',
            type: 'file',
            name: 'west_side_flood_report.pdf',
            url: '/files/west_side_flood_report.pdf',
            size: '3.5 MB'
          }
        ]
      }
    ]
  };
  
  // Team related data - for Teams tab
  const teams = [
    {
      id: 'team-001',
      name: 'Emergency Response Alpha',
      members: 8,
      avatar: '/avatars/team-alpha.jpg',
      description: 'First responders and medical personnel for central district'
    },
    {
      id: 'team-002',
      name: 'Logistics & Supply Group',
      members: 12,
      avatar: '/avatars/team-logistics.jpg',
      description: 'Coordinating supply distribution across affected areas'
    },
    {
      id: 'team-003',
      name: 'Volunteer Network',
      members: 24,
      avatar: '/avatars/team-volunteer.jpg',
      description: 'Community volunteers providing general assistance and support'
    }
  ];
  
  const getCurrentMessages = () => {
    if (!selectedConversation) return [];
    return messages[selectedConversation] || [];
  };
  
  const getConversationName = (conversation: Conversation) => {
    if (conversation.type === 'direct') {
      return conversation.participants[0]?.name || 'Unknown';
    }
    // For group chats
    return conversation.participants[0]?.name || 'Group Chat';
  };
  
  const getConversationAvatar = (conversation: Conversation) => {
    const defaultAvatar = '/avatars/default.jpg';
    if (conversation.type === 'direct') {
      return conversation.participants[0]?.avatar || defaultAvatar;
    }
    return conversation.participants[0]?.avatar || defaultAvatar;
  };
  
  const getConversationRole = (conversation: Conversation) => {
    if (conversation.type === 'direct') {
      return conversation.participants[0]?.role || '';
    }
    return 'Group';
  };
  
  const getParticipantStatus = (conversation: Conversation) => {
    if (conversation.type === 'direct') {
      return conversation.participants[0]?.status || 'offline';
    }
    return null;
  };
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (timestamp: string) => {
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
  };
  
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    // In a real app, here we'd send the message to a server
    console.log(`Sending message to ${selectedConversation}: ${newMessage}`);
    
    // Reset input
    setNewMessage('');
  };
  
  const renderMessages = () => {
    const messagesForConversation = getCurrentMessages();
    
    // Group messages by date
    const messagesByDate: Record<string, Message[]> = {};
    messagesForConversation.forEach((message) => {
      const date = formatDate(message.timestamp);
      if (!messagesByDate[date]) {
        messagesByDate[date] = [];
      }
      messagesByDate[date].push(message);
    });
    
    return Object.entries(messagesByDate).map(([date, dateMessages]) => (
      <div key={date} className="mb-6">
        <div className="flex justify-center mb-4">
          <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">{date}</span>
        </div>
        
        <div className="space-y-3">
          {dateMessages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.sender.id === 'user-001' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender.id !== 'user-001' && (
                <img 
                  src={message.sender.avatar} 
                  alt={message.sender.name} 
                  className="h-10 w-10 rounded-full mr-3 flex-shrink-0"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/40?text=User';
                  }}
                />
              )}
              
              <div 
                className={`max-w-[70%] ${
                  message.sender.id === 'user-001' 
                    ? 'bg-primary-100 text-primary-900 rounded-l-lg rounded-br-lg' 
                    : 'bg-white border border-gray-200 rounded-r-lg rounded-bl-lg'
                } p-3 shadow-sm`}
              >
                {message.sender.id !== 'user-001' && (
                  <div className="font-medium text-sm text-gray-900 mb-1">{message.sender.name}</div>
                )}
                <p className="text-sm">{message.content}</p>
                
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {message.attachments.map((attachment) => (
                      <div 
                        key={attachment.id}
                        className="flex items-center p-2 bg-gray-50 rounded border border-gray-200"
                      >
                        {attachment.type === 'image' ? (
                          <Image className="h-4 w-4 text-gray-500 mr-2" />
                        ) : (
                          <Paperclip className="h-4 w-4 text-gray-500 mr-2" />
                        )}
                        <span className="text-xs text-gray-700 truncate flex-grow">{attachment.name}</span>
                        {attachment.size && (
                          <span className="text-xs text-gray-500 ml-2">{attachment.size}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {formatTime(message.timestamp)}
                </div>
              </div>
              
              {message.sender.id === 'user-001' && (
                <img 
                  src={message.sender.avatar} 
                  alt="You" 
                  className="h-10 w-10 rounded-full ml-3 flex-shrink-0"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/40?text=You';
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    ));
  };
  
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex mb-6">
          <div className="mr-4">
            <h1 className="text-2xl font-bold text-gray-900">Communication Hub</h1>
            <p className="text-gray-600">Coordinate with team members and other stakeholders</p>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="flex h-[calc(100vh-200px)]">
            {/* Left sidebar - Conversations & Teams */}
            <div className="w-80 border-r border-gray-200 flex flex-col">
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button 
                  onClick={() => setActiveTab('messages')}
                  className={`flex-1 py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'messages' 
                      ? 'border-primary-600 text-primary-600' 
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Messages
                  </div>
                </button>
                <button 
                  onClick={() => setActiveTab('teams')}
                  className={`flex-1 py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'teams' 
                      ? 'border-primary-600 text-primary-600' 
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <Users className="h-4 w-4 mr-2" />
                    Teams
                  </div>
                </button>
              </div>
              
              {/* Search */}
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={activeTab === 'messages' ? "Search messages" : "Search teams"}
                    className="pl-9"
                  />
                </div>
              </div>
              
              {/* Conversations or Teams list */}
              <div className="flex-1 overflow-y-auto">
                {activeTab === 'messages' ? (
                  <div className="divide-y divide-gray-200">
                    {conversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        className={`w-full text-left p-3 hover:bg-gray-50 flex items-start ${
                          selectedConversation === conversation.id ? 'bg-gray-50' : ''
                        }`}
                        onClick={() => setSelectedConversation(conversation.id)}
                      >
                        <div className="relative mr-3 flex-shrink-0">
                          <img 
                            src={getConversationAvatar(conversation)} 
                            alt={getConversationName(conversation)}
                            className="h-10 w-10 rounded-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/40?text=User';
                            }}
                          />
                          {getParticipantStatus(conversation) && (
                            <span 
                              className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-1 ring-white ${
                                getParticipantStatus(conversation) === 'online' ? 'bg-green-400' :
                                getParticipantStatus(conversation) === 'away' ? 'bg-yellow-400' : 
                                'bg-gray-300'
                              }`}
                            ></span>
                          )}
                          {conversation.unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {getConversationName(conversation)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatTime(conversation.lastMessage.timestamp)}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 mb-1 truncate">
                            {getConversationRole(conversation)}
                          </p>
                          <p className={`text-xs truncate ${conversation.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                            {conversation.lastMessage.sender.id === 'user-001' ? 'You: ' : ''}
                            {conversation.lastMessage.content}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {teams.map((team) => (
                      <div
                        key={team.id}
                        className="p-3 hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <img 
                            src={team.avatar}
                            alt={team.name}
                            className="h-10 w-10 rounded-full mr-3 flex-shrink-0"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/40?text=Team';
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {team.name}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {team.members} members
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                          {team.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Create new */}
              <div className="p-3 border-t border-gray-200">
                <Button variant="outline" className="w-full flex items-center justify-center">
                  <Plus className="h-4 w-4 mr-2" />
                  {activeTab === 'messages' ? 'New Message' : 'Create Team'}
                </Button>
              </div>
            </div>
            
            {/* Right content area - Messages */}
            {activeTab === 'messages' && selectedConversation ? (
              <div className="flex-1 flex flex-col">
                {/* Chat header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center">
                    <img 
                      src={getConversationAvatar(conversations.find(c => c.id === selectedConversation)!)}
                      alt={getConversationName(conversations.find(c => c.id === selectedConversation)!)}
                      className="h-10 w-10 rounded-full mr-3"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/40?text=User';
                      }}
                    />
                    <div>
                      <h2 className="text-md font-medium text-gray-900">
                        {getConversationName(conversations.find(c => c.id === selectedConversation)!)}
                      </h2>
                      <div className="flex items-center text-xs text-gray-500">
                        {getParticipantStatus(conversations.find(c => c.id === selectedConversation)!) && (
                          <span className={`h-2 w-2 rounded-full mr-2 ${
                            getParticipantStatus(conversations.find(c => c.id === selectedConversation)!) === 'online' ? 'bg-green-400' :
                            getParticipantStatus(conversations.find(c => c.id === selectedConversation)!) === 'away' ? 'bg-yellow-400' : 
                            'bg-gray-300'
                          }`}></span>
                        )}
                        {getConversationRole(conversations.find(c => c.id === selectedConversation)!)}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      title="Make phone call"
                      aria-label="Make phone call"
                    >
                      <Phone className="h-5 w-5" />
                    </button>
                    <button 
                      className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      title="Start video call"
                      aria-label="Start video call"
                    >
                      <Video className="h-5 w-5" />
                    </button>
                    <button 
                      className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      title="More options"
                      aria-label="More options"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                {/* Messages area */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  {renderMessages()}
                </div>
                
                {/* Message input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full border-gray-300 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <div className="flex items-center mt-2">
                        <button className="p-2 rounded-full text-gray-500 hover:text-gray-700">
                          <Paperclip className="h-5 w-5" />
                        </button>
                        <button className="p-2 rounded-full text-gray-500 hover:text-gray-700">
                          <Image className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="h-10 w-10 rounded-full p-0 flex items-center justify-center"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : activeTab === 'teams' ? (
              <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
                <Users className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Team Communication</h3>
                <p className="text-sm text-gray-600 max-w-md mb-6">
                  Select a team to view members, create group chats, and coordinate responses for your emergency response operations.
                </p>
                <Button>
                  View Team Directory
                </Button>
              </div>
            ) : (
              <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
                <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Conversation Selected</h3>
                <p className="text-sm text-gray-600 max-w-md mb-6">
                  Choose a conversation from the list or start a new message to communicate with team members and coordinate response efforts.
                </p>
                <Button>
                  Start New Conversation
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationHub;
