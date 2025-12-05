import { create } from 'zustand';
import { channelApi, messageApi } from '../services/api';
import socketService from '../services/socketService';
import toast from 'react-hot-toast';

export const useChatStore = create((set, get) => ({
    channels: [],
    activeChannel: null,
    messages: [],
    typingUsers: {},
    onlineUsers: {},
    replyingTo: null, // New state for reply
    isLoading: false,
    error: null,

    // Fetch channels
    fetchChannels: async () => {
        set({ isLoading: true });
        try {
            const response = await channelApi.getChannels();
            set({ channels: response.data, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    // Set active channel
    setActiveChannel: async (channel) => {
        const prevChannel = get().activeChannel;

        // Leave previous room
        if (prevChannel && socketService.isConnected()) {
            socketService.leaveRoom(prevChannel.id);
        }

        set((state) => ({
            activeChannel: channel,
            messages: [],
            replyingTo: null, // Reset reply state
            // Optimistically reset unread count for this channel
            channels: state.channels.map(c =>
                c.id === channel?.id
                    ? { ...c, _count: { messages: 0 } }
                    : c
            )
        }));

        if (channel) {
            // Join new room
            if (socketService.isConnected()) {
                socketService.joinRoom(channel.id);
            }

            // Fetch messages
            try {
                const response = await messageApi.getMessages(channel.id);
                const messages = response.data;
                set({ messages });

                // Mark all unread messages as read (user is viewing them)
                const currentUserId = localStorage.getItem('userId');
                messages.forEach(msg => {
                    if (msg.senderId !== currentUserId && msg.sender?.id !== currentUserId) {
                        // This is a message from someone else - mark as read
                        const senderId = msg.senderId || msg.sender?.id;
                        if (senderId && socketService.isConnected()) {
                            socketService.messageRead(channel.id, msg.id, senderId);
                        }
                    }
                });
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        }
    },

    // Set replying to message
    setReplyingTo: (message) => {
        set({ replyingTo: message });
    },

    // Add new message (with duplicate check)
    addMessage: (message) => {
        set((state) => {
            const existingIndex = state.messages.findIndex(m => m.id === message.id);
            if (existingIndex !== -1) {
                const newMessages = [...state.messages];
                newMessages[existingIndex] = { ...newMessages[existingIndex], ...message };
                return { messages: newMessages };
            }
            return {
                messages: [...state.messages, message]
            };
        });
    },

    // Update message status (sent -> delivered -> read)
    updateMessageStatus: (messageId, status) => {
        set((state) => ({
            messages: state.messages.map(msg => {
                if (msg.id === messageId) {
                    return { ...msg, status };
                }
                return msg;
            })
        }));
    },

    // Delete message action
    deleteMessage: async (messageId) => {
        try {
            await messageApi.deleteMessage(messageId);
            // Optimistic update
            set((state) => ({
                messages: state.messages.filter(m => m.id !== messageId)
            }));
        } catch (error) {
            console.error('Failed to delete message:', error);
            throw error;
        }
    },

    // Set online status
    setUserOnline: (userId, isOnline) => {
        set((state) => ({
            onlineUsers: {
                ...state.onlineUsers,
                [userId]: isOnline
            },
            channels: state.channels.map(channel => ({
                ...channel,
                members: channel.members?.map(member => ({
                    ...member,
                    user: member.user?.id === userId
                        ? { ...member.user, isOnline }
                        : member.user
                }))
            })),
            activeChannel: state.activeChannel ? {
                ...state.activeChannel,
                members: state.activeChannel.members?.map(member => ({
                    ...member,
                    user: member.user?.id === userId
                        ? { ...member.user, isOnline }
                        : member.user
                }))
            } : null
        }));
    },

    // Send message
    sendMessage: async (content, attachmentUrl = null) => {
        const channel = get().activeChannel;
        const replyingTo = get().replyingTo;

        if (!channel) return;

        try {
            const response = await messageApi.sendMessage(
                channel.id,
                content,
                replyingTo ? replyingTo.id : null,
                attachmentUrl
            );
            const message = response.data;

            // Clear reply state
            set({ replyingTo: null });

            // Add with 'sent' status (1 tick)
            get().addMessage({ ...message, status: 'sent' });

            return message;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },

    // Create direct channel
    createDirectChannel: async (userId) => {
        try {
            const response = await channelApi.createDirect(userId);
            const newChannel = response.data;

            set((state) => ({
                channels: [newChannel, ...state.channels.filter(c => c.id !== newChannel.id)]
            }));

            return newChannel;
        } catch (error) {
            console.error('Error creating channel:', error);
            throw error;
        }
    },

    // Set typing status
    setTypingUser: (channelId, userId, isTyping) => {
        set((state) => {
            const currentTyping = state.typingUsers[channelId] || [];
            const newTyping = isTyping
                ? [...currentTyping.filter(id => id !== userId), userId]
                : currentTyping.filter(id => id !== userId);

            return {
                typingUsers: {
                    ...state.typingUsers,
                    [channelId]: newTyping
                }
            };
        });
    },

    // Create group channel
    createGroup: async (name, memberIds) => {
        try {
            const response = await channelApi.createGroup(name, memberIds);
            const newChannel = response.data;

            set((state) => ({
                channels: [newChannel, ...state.channels]
            }));

            return newChannel;
        } catch (error) {
            console.error('Error creating group:', error);
            throw error;
        }
    },

    // Initialize socket listeners
    initSocketListeners: () => {
        const socket = socketService.socket;
        if (!socket) return;

        console.log('🔌 Initializing chat socket listeners...');

        // Remove existing listeners
        socket.off('new_message');
        socket.off('user_typing');
        socket.off('user_status_changed');
        socket.off('message_status_update');
        socket.off('message_deleted');
        socket.off('channel_created');

        // Listen for new channels (e.g. added to a group)
        socket.on('channel_created', (channel) => {
            console.log('🆕 New channel created:', channel);
            set((state) => ({
                channels: [channel, ...state.channels.filter(c => c.id !== channel.id)]
            }));
        });

        // Listen for new messages
        socket.on('new_message', ({ channelId, message }) => {
            const activeChannel = get().activeChannel;
            const currentUserId = localStorage.getItem('userId');
            const senderId = message?.senderId || message?.sender?.id;

            // Skip if it's our own message
            if (senderId === currentUserId) return;

            if (activeChannel && channelId === activeChannel.id) {
                // Add message
                get().addMessage(message);

                // Send delivered confirmation (2 gray ticks for sender)
                if (senderId && socketService.isConnected()) {
                    socketService.messageDelivered(channelId, message.id, senderId);
                }

                // Also mark as read immediately since user is viewing the chat
                if (senderId && socketService.isConnected()) {
                    socketService.messageRead(channelId, message.id, senderId);
                }
            } else {
                // Message for different channel - just deliver, don't read
                if (senderId && socketService.isConnected()) {
                    socketService.messageDelivered(channelId, message.id, senderId);
                }

                // Show notification
                const senderName = message.sender?.name || 'Someone';
                const contentPreview = message.content.length > 30
                    ? message.content.substring(0, 30) + '...'
                    : message.content;

                toast.success(`${senderName}: ${contentPreview}`, {
                    id: `msg-${message.id}`, // Prevent duplicates
                    icon: '💬',
                    duration: 4000
                });
            }

            get().fetchChannels();
        });

        // Listen for message deletion
        socket.on('message_deleted', ({ messageId, channelId }) => {
            console.log('🗑️ Message deleted:', messageId);
            set((state) => ({
                messages: state.messages.filter(m => m.id !== messageId)
            }));

            // If the deleted message was the last one, refresh channels to update preview
            get().fetchChannels();
        });

        // Listen for typing
        socket.on('user_typing', ({ channelId, userId, isTyping }) => {
            get().setTypingUser(channelId, userId, isTyping);
        });

        // Listen for online status changes
        socket.on('user_status_changed', ({ userId, isOnline }) => {
            get().setUserOnline(userId, isOnline);
        });

        // Listen for message status updates (sent -> delivered -> read)
        socket.on('message_status_update', ({ messageId, status }) => {
            console.log(`📬 Message ${messageId} status: ${status}`);
            get().updateMessageStatus(messageId, status);
        });

        console.log('✅ Chat socket listeners ready');
    }
}));
