import { create } from 'zustand';
import { friendApi } from '../services/api';
import socketService from '../services/socketService';
import toast from 'react-hot-toast';

export const useFriendStore = create((set, get) => ({
    friends: [],
    pendingRequests: [],
    blockedUsers: [],
    loading: false,

    // Load accepted friends
    loadFriends: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        set({ loading: true });
        try {
            const res = await friendApi.getFriends();
            set({ friends: res.data, loading: false });
        } catch (err) {
            console.error('Failed to load friends', err);
            set({ loading: false });
        }
    },

    // Load incoming pending requests
    loadPending: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await friendApi.getPending();
            set({ pendingRequests: res.data });
        } catch (err) {
            // Silently fail - might not be authenticated yet
            if (err.response?.status !== 401) {
                console.error('Failed to load pending requests', err);
            }
        }
    },

    // Send a friend request
    sendRequest: async (receiverId) => {
        try {
            await friendApi.sendRequest(receiverId);
            toast.success('Friend request sent!');
        } catch (err) {
            console.error('Send request error', err);
            throw err;
        }
    },

    // Respond to a request (accept / reject)
    respondRequest: async (requestId, action) => {
        try {
            await friendApi.respondRequest(requestId, action);
            // Remove from pending list immediately
            set((state) => ({
                pendingRequests: state.pendingRequests.filter(r => r.id !== requestId)
            }));
            if (action === 'accept') {
                // Reload friends list
                get().loadFriends();
            }
        } catch (err) {
            console.error('Respond request error', err);
            throw err;
        }
    },

    // Remove a friend
    removeFriend: async (friendId) => {
        try {
            await friendApi.removeFriend(friendId);
            set((state) => ({
                friends: state.friends.filter(f => f.id !== friendId)
            }));
            toast.success('Friend removed');
        } catch (err) {
            console.error('Remove friend error', err);
            toast.error('Failed to remove friend');
        }
    },

    // Block a user
    blockUser: async (userId) => {
        try {
            await friendApi.blockUser(userId);
            set((state) => ({
                friends: state.friends.filter(f => f.id !== userId),
                blockedUsers: [...state.blockedUsers, { id: userId }] // Optimistic update
            }));
            toast.success('User blocked');
            get().loadBlocked(); // Reload to get full details
        } catch (err) {
            console.error('Block user error', err);
            toast.error('Failed to block user');
        }
    },

    // Unblock a user
    unblockUser: async (userId) => {
        try {
            await friendApi.unblockUser(userId);
            set((state) => ({
                blockedUsers: state.blockedUsers.filter(u => u.id !== userId)
            }));
            toast.success('User unblocked');
        } catch (err) {
            console.error('Unblock user error', err);
            toast.error('Failed to unblock user');
        }
    },

    // Load blocked users
    loadBlocked: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await friendApi.getBlocked();
            set({ blockedUsers: res.data });
        } catch (err) {
            console.error('Failed to load blocked users', err);
        }
    },

    // Initialize socket listeners for real-time notifications
    initSocket: () => {
        const socket = socketService.socket;
        if (!socket) {
            console.log('Socket not available for friend store');
            return;
        }

        console.log('Initializing friend socket listeners...');

        // Remove existing listeners
        socket.off('friendRequest:received');
        socket.off('friendRequest:updated');
        socket.off('friend:removed');

        socket.on('friendRequest:received', (request) => {
            console.log('📬 Friend request received:', request);
            toast.success(`${request.sender?.name || 'Someone'} sent you a friend request!`, {
                duration: 5000,
                icon: '👋'
            });
            set((state) => ({
                pendingRequests: [request, ...state.pendingRequests.filter(r => r.id !== request.id)]
            }));
        });

        socket.on('friendRequest:updated', (updated) => {
            console.log('📬 Friend request updated:', updated);
            const { status, sender, receiver } = updated;

            set((state) => ({
                pendingRequests: state.pendingRequests.filter(r => r.id !== updated.id)
            }));

            if (status === 'accepted') {
                get().loadFriends();
                toast.success(`You are now friends with ${sender?.name || receiver?.name}!`, {
                    icon: '🎉'
                });
            }
        });

        socket.on('friend:removed', ({ friendId }) => {
            console.log('👋 Friend removed:', friendId);
            set((state) => ({
                friends: state.friends.filter(f => f.id !== friendId)
            }));
        });

        console.log('Friend socket listeners initialized ✓');
    },
}));
