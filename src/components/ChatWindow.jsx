import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import socketService from '../services/socketService';
import { Send, Smile, Paperclip, MoreVertical, Phone, Video, Users } from 'lucide-react';

const ChatWindow = () => {
    const { activeChannel, messages, sendMessage, typingUsers } = useChatStore();
    const { user } = useAuthStore();
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleTyping = (e) => {
        setNewMessage(e.target.value);

        // Send typing indicator
        if (!isTyping) {
            setIsTyping(true);
            socketService.startTyping(activeChannel.id);
        }

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            socketService.stopTyping(activeChannel.id);
        }, 2000);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        await sendMessage(newMessage.trim());
        setNewMessage('');
        setIsTyping(false);
        socketService.stopTyping(activeChannel.id);
    };

    const getOtherUser = () => {
        if (activeChannel.type === 'group') return null;
        return activeChannel.members?.find(m => m.user?.id !== user?.id)?.user;
    };

    const otherUser = getOtherUser();
    const channelName = activeChannel.type === 'group'
        ? activeChannel.name
        : otherUser?.name || 'Unknown User';

    const typingUsersInChannel = typingUsers[activeChannel.id] || [];

    return (
        <div className="flex flex-col h-full bg-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
                <div className="flex items-center gap-3 min-w-0 pl-12 lg:pl-0">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {activeChannel.type === 'group' ? (
                                <Users size={18} />
                            ) : (
                                channelName.charAt(0).toUpperCase()
                            )}
                        </div>
                        {otherUser?.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-semibold text-white truncate">{channelName}</h3>
                        <p className="text-xs text-gray-400">
                            {otherUser?.isOnline ? 'Online' : 'Offline'}
                            {typingUsersInChannel.length > 0 && ' • Typing...'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors hidden sm:block">
                        <Phone size={20} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors hidden sm:block">
                        <Video size={20} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                        <MoreVertical size={20} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => {
                    const isOwn = message.senderId === user?.id || message.sender?.id === user?.id;
                    const showAvatar = index === 0 ||
                        messages[index - 1]?.senderId !== message.senderId;

                    return (
                        <div
                            key={message.id || index}
                            className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
                        >
                            {!isOwn && showAvatar && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                    {message.sender?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                            )}
                            {!isOwn && !showAvatar && <div className="w-8" />}

                            <div
                                className={`max-w-[75%] sm:max-w-[60%] px-4 py-2.5 rounded-2xl ${isOwn
                                        ? 'bg-blue-600 text-white rounded-br-md'
                                        : 'bg-gray-700 text-white rounded-bl-md'
                                    }`}
                            >
                                {!isOwn && showAvatar && (
                                    <p className="text-xs font-medium text-blue-400 mb-1">
                                        {message.sender?.name}
                                    </p>
                                )}
                                <p className="text-sm break-words">{message.content}</p>
                                <p className={`text-[10px] mt-1 ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
                                    {new Date(message.createdAt).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                    {message.isEdited && ' • Edited'}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicator */}
            {typingUsersInChannel.length > 0 && (
                <div className="px-4 py-2 text-sm text-gray-400">
                    <span className="inline-flex gap-1">
                        <span className="animate-bounce">•</span>
                        <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>•</span>
                        <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>•</span>
                    </span>
                    <span className="ml-2">typing...</span>
                </div>
            )}

            {/* Message Input */}
            <form onSubmit={handleSend} className="p-4 bg-gray-900 border-t border-gray-800">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors hidden sm:block"
                    >
                        <Paperclip size={20} />
                    </button>
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={handleTyping}
                            placeholder="Type a message..."
                            className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors hidden sm:block"
                        >
                            <Smile size={20} />
                        </button>
                    </div>
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatWindow;
