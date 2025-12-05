import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import socketService from '../services/socketService';
import { uploadApi } from '../services/api';
import { Send, Smile, Paperclip, MoreVertical, Phone, Video, Users, Check, CheckCheck, ArrowLeft, MessageCircle, Reply, Trash2, X } from 'lucide-react';
import FilePreview from './FilePreview';
import ViewProfileModal from './ViewProfileModal';
import toast from 'react-hot-toast';

// Message Status Component - Tick system
// 1 gray tick = sent, 2 gray ticks = delivered, 2 blue ticks = read
const MessageStatus = ({ message, isOwn }) => {
    if (!isOwn) return null;

    const status = message.status || 'sent';

    // Read - 2 blue ticks
    if (status === 'read') {
        return (
            <span className="inline-flex ml-1" title="Read">
                <CheckCheck size={14} className="text-blue-400" />
            </span>
        );
    }

    // Delivered - 2 gray ticks
    if (status === 'delivered') {
        return (
            <span className="inline-flex ml-1" title="Delivered">
                <CheckCheck size={14} className="text-gray-400" />
            </span>
        );
    }

    // Sent - 1 gray tick (default)
    return (
        <span className="inline-flex ml-1" title="Sent">
            <Check size={14} className="text-gray-400" />
        </span>
    );
};

// Typing Indicator Animation
const TypingIndicator = () => (
    <div className="flex items-center gap-1 px-4 py-2">
        <div className="flex items-center gap-1 bg-gray-700 rounded-2xl px-4 py-2">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
    </div>
);

const ChatWindow = () => {
    const { activeChannel, messages, sendMessage, typingUsers, setActiveChannel, replyingTo, setReplyingTo, deleteMessage } = useChatStore();
    const { user } = useAuthStore();
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [viewingProfileId, setViewingProfileId] = useState(null);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);

    const typingUsersInChannel = typingUsers[activeChannel?.id] || [];
    const isOtherUserTyping = typingUsersInChannel.length > 0;

    // Scroll to bottom when messages change or typing status changes
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, replyingTo, isOtherUserTyping]); // Also scroll when reply state changes to show banner

    // Mark messages as read when viewing
    useEffect(() => {
        if (activeChannel && messages.length > 0 && socketService.isConnected()) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage && lastMessage.senderId !== user?.id && lastMessage.sender?.id !== user?.id) {
                socketService.markAsRead(activeChannel.id, lastMessage.id);
            }
        }
    }, [messages, activeChannel, user]);

    const handleTyping = (e) => {
        setNewMessage(e.target.value);

        if (!isTyping && socketService.isConnected() && activeChannel) {
            setIsTyping(true);
            socketService.startTyping(activeChannel.id);
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            if (socketService.isConnected() && activeChannel) {
                socketService.stopTyping(activeChannel.id);
            }
        }, 2000);
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size exceeds 10MB limit');
            return;
        }

        setSelectedFile(file);
        e.target.value = ''; // Reset input
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedFile) || isSending) return;

        const messageContent = newMessage.trim();
        let attachmentUrl = null;

        setIsSending(true);

        try {
            // Upload file first if selected
            if (selectedFile) {
                setIsUploading(true);
                const uploadResponse = await uploadApi.uploadFile(selectedFile);
                attachmentUrl = uploadResponse.data.url;
                setIsUploading(false);
            }

            setNewMessage('');
            setSelectedFile(null);

            // Send message with or without attachment
            await sendMessage(messageContent || '📎 Attachment', attachmentUrl);
            setIsTyping(false);
            if (socketService.isConnected() && activeChannel) {
                socketService.stopTyping(activeChannel.id);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message');
            setNewMessage(messageContent);
        } finally {
            setIsSending(false);
            setIsUploading(false);
        }
    };

    const handleBack = () => {
        setActiveChannel(null);
    };

    const handleDelete = async (messageId) => {
        if (window.confirm('Are you sure you want to delete this message?')) {
            try {
                await deleteMessage(messageId);
            } catch (error) {
                console.error('Failed to delete message', error);
            }
        }
    };

    const getOtherUser = () => {
        if (activeChannel?.type === 'group') return null;
        return activeChannel?.members?.find(m => m.user?.id !== user?.id)?.user;
    };

    const otherUser = getOtherUser();
    const channelName = activeChannel?.type === 'group'
        ? activeChannel.name
        : otherUser?.name || 'Unknown User';

    // Get online status
    const isUserOnline = otherUser?.isOnline || false;

    // Format last seen
    const getStatusText = () => {
        if (isOtherUserTyping) {
            return 'typing...';
        }
        if (isUserOnline) {
            return 'Online';
        }
        if (otherUser?.lastSeen) {
            const lastSeen = new Date(otherUser.lastSeen);
            const now = new Date();
            const diffMs = now - lastSeen;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return 'Last seen just now';
            if (diffMins < 60) return `Last seen ${diffMins}m ago`;
            if (diffHours < 24) return `Last seen ${diffHours}h ago`;
            return `Last seen ${diffDays}d ago`;
        }
        return 'Offline';
    };

    return (
        <div className="flex flex-col h-full bg-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-700">
                <div className="flex items-center gap-3 min-w-0">
                    {/* Back button for mobile */}
                    <button
                        onClick={handleBack}
                        className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => otherUser && setViewingProfileId(otherUser.id)}
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden hover:opacity-80 transition-opacity"
                        >
                            {activeChannel?.type === 'group' ? (
                                <Users size={18} />
                            ) : otherUser?.avatar ? (
                                <img
                                    src={otherUser.avatar}
                                    alt={otherUser.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                channelName.charAt(0).toUpperCase()
                            )}
                        </button>
                        {/* Online indicator */}
                        {isUserOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
                        )}
                    </div>

                    <div className="min-w-0">
                        <h3 className="font-semibold text-white truncate">{channelName}</h3>
                        <p className={`text-xs ${isOtherUserTyping ? 'text-green-400' : isUserOnline ? 'text-green-400' : 'text-gray-400'}`}>
                            {otherUser?.status || getStatusText()}
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
            <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                            <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p>No messages yet</p>
                            <p className="text-sm">Start the conversation!</p>
                        </div>
                    </div>
                ) : (
                    messages.map((message, index) => {
                        const isOwn = message.senderId === user?.id || message.sender?.id === user?.id;
                        const showAvatar = index === 0 ||
                            messages[index - 1]?.senderId !== message.senderId;
                        const showTime = index === 0 ||
                            new Date(message.createdAt).getTime() - new Date(messages[index - 1]?.createdAt).getTime() > 300000;

                        return (
                            <div key={message.id || index} className="group">
                                {showTime && (
                                    <div className="flex justify-center my-4">
                                        <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
                                            {new Date(message.createdAt).toLocaleDateString([], {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                )}
                                <div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                                    {!isOwn && showAvatar && (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                            {message.sender?.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    {!isOwn && !showAvatar && <div className="w-8" />}

                                    <div className={`flex flex-col max-w-[75%] sm:max-w-[60%] ${isOwn ? 'items-end' : 'items-start'}`}>
                                        {/* Reply Preview Bubble */}
                                        {message.replyTo && (
                                            <div className={`mb-1 px-3 py-2 rounded-lg text-xs bg-gray-700/50 border-l-4 border-blue-500 text-gray-300 w-full truncate cursor-pointer`}>
                                                <p className="font-bold text-blue-400 mb-0.5">{message.replyTo.sender?.name}</p>
                                                <p className="truncate">{message.replyTo.content}</p>
                                            </div>
                                        )}

                                        <div
                                            className={`relative px-4 py-2.5 rounded-2xl ${isOwn
                                                ? 'bg-blue-600 text-white rounded-br-md'
                                                : 'bg-gray-700 text-white rounded-bl-md'
                                                }`}
                                        >
                                            {!isOwn && showAvatar && (
                                                <p className="text-xs font-medium text-blue-400 mb-1">
                                                    {message.sender?.name}
                                                </p>
                                            )}
                                            <p className="text-sm break-all whitespace-pre-wrap">{message.content}</p>
                                            {message.attachmentUrl && (
                                                <FilePreview url={message.attachmentUrl} file={null} />
                                            )}
                                            <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
                                                <span className="text-[10px]">
                                                    {new Date(message.createdAt).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                    {message.isEdited && ' • Edited'}
                                                </span>
                                                <MessageStatus message={message} isOwn={isOwn} />
                                            </div>
                                        </div>

                                        {/* Action Buttons (Reply/Delete) */}
                                        <div className={`flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${isOwn ? 'flex-row-reverse' : ''}`}>
                                            <button
                                                onClick={() => setReplyingTo(message)}
                                                className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"
                                                title="Reply"
                                            >
                                                <Reply size={14} />
                                            </button>
                                            {isOwn && (
                                                <button
                                                    onClick={() => handleDelete(message.id)}
                                                    className="p-1 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-full"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Typing indicator */}
                {isOtherUserTyping && <TypingIndicator />}

                <div ref={messagesEndRef} />
            </div>

            {/* Reply Banner */}
            {replyingTo && (
                <div className="px-4 py-2 bg-gray-800 border-t border-gray-700 flex items-center justify-between">
                    <div className="flex-1 border-l-4 border-blue-500 pl-3">
                        <p className="text-xs text-blue-400 font-bold">Replying to {replyingTo.sender?.name}</p>
                        <p className="text-sm text-gray-300 truncate">{replyingTo.content}</p>
                    </div>
                    <button
                        onClick={() => setReplyingTo(null)}
                        className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Message Input */}
            <form onSubmit={handleSend} className="p-4 bg-gray-900 border-t border-gray-700">
                {/* File Preview */}
                {selectedFile && (
                    <div className="mb-2">
                        <FilePreview file={selectedFile} onRemove={handleRemoveFile} />
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                        title="Attach file"
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
                            disabled={isSending}
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
                        disabled={(!newMessage.trim() && !selectedFile) || isSending || isUploading}
                        className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                    >
                        {isSending || isUploading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Send size={20} />
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatWindow;
