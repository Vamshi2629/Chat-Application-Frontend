import { create } from 'zustand';
import { channelApi, messageApi } from '../services/api';
import socketService from '../services/socketService';

export const useChatStore = create((set, get) => ({
    channels: [],
    activeChannel: null,
    messages: [],
    typingUsers: {},
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
        if (prevChannel) {
            socketService.leaveRoom(prevChannel.id);
        }

        set({ activeChannel: channel, messages: [] });

        if (channel) {
            // Join new room
            socketService.joinRoom(channel.id);

            // Fetch messages
            try {
                const response = await messageApi.getMessages(channel.id);
                set({ messages: response.data });
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        }
    },

    // Add new message
    addMessage: (message) => {
        set((state) => ({
            messages: [...state.messages, message]
        }));
    },

    // Send message
    sendMessage: async (content, replyToId = null) => {
        const channel = get().activeChannel;
        if (!channel) return;

        try {
            const response = await messageApi.sendMessage(channel.id, content, replyToId);
            // Message will be added via socket event
            socketService.sendMessage(channel.id, content, replyToId);
        } catch (error) {
            console.error('Error sending message:', error);
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
        set((state) => ({
            typingUsers: {
                ...state.typingUsers,
                [channelId]: isTyping
                    ? [...(state.typingUsers[channelId] || []), userId]
                    : (state.typingUsers[channelId] || []).filter(id => id !== userId)
            }
        }));
    },

    // Initialize socket listeners
    initSocketListeners: () => {
        socketService.onMessage((message) => {
            const activeChannel = get().activeChannel;
            if (activeChannel && message.channelId === activeChannel.id) {
                get().addMessage(message);
            }
        });

        socketService.onTyping(({ channelId, userId, isTyping }) => {
            get().setTypingUser(channelId, userId, isTyping);
        });
    }
}));
