import { create } from 'zustand';
import { friendApi } from '../services/api';
import socketService from '../services/socketService';
import toast from 'react-hot-toast';

export const useFriendStore = create((set, get) => ({
    friends: [], // accepted friends
    pendingRequests: [], // incoming pending requests
    loading: false,

    // Load accepted friends
    loadFriends: async () => {
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
        set({ loading: true });
        try {
            const res = await friendApi.getPending();
            set({ pendingRequests: res.data, loading: false });
        } catch (err) {
            console.error('Failed to load pending requests', err);
            set({ loading: false });
        }
    },

    // Send a friend request
    sendRequest: async (receiverId) => {
        try {
            await friendApi.sendRequest(receiverId);
        } catch (err) {
            console.error('Send request error', err);
        }
    },

    // Respond to a request (accept / reject)
    respondRequest: async (requestId, action) => {
        try {
            await friendApi.respondRequest(requestId, action);
        } catch (err) {
            console.error('Respond request error', err);
        }
    },

    // Initialize socket listeners for real‑time notifications
    initSocket: () => {
        const socket = socketService.connect(localStorage.getItem('token'));

        socket.off('friendRequest:received'); // Prevent duplicate listeners
        socket.on('friendRequest:received', (request) => {
            // Show toast
            toast.success(`${request.sender.name || 'Someone'} sent you a friend request!`, {
                duration: 5000,
            });
            // prepend to pendingRequests
            set((state) => ({ pendingRequests: [request, ...state.pendingRequests] }));
        });

        socket.off('friendRequest:updated');
        socket.on('friendRequest:updated', (updated) => {
            // If accepted, move to friends list; otherwise remove from pending
            const { status, sender, receiver } = updated;
            set((state) => {
                const pending = state.pendingRequests.filter((r) => r.id !== updated.id);
                // Determine which user object to add to friends list
                // We need to know the current user ID to pick the *other* person
                // But we don't have easy access to it here unless we store it or decode token again
                // A simple workaround is to check both and pick the one that isn't me
                // However, 'sender' and 'receiver' are full objects.
                // Let's assume the backend sends full objects.

                // Actually, we can just reload friends to be safe and simple, 
                // but for optimistic UI updates:
                // We need to know who "I" am. 
                // Let's just reload friends for now to ensure consistency, 
                // or try to guess. 
                // Better: The updated object has sender and receiver.
                // If I am sender, friend is receiver. If I am receiver, friend is sender.
                // We can decode token here or just fetch friends again.

                if (status === 'accepted') {
                    get().loadFriends();
                    toast.success(`You are now friends with ${sender.name || receiver.name}!`);
                }

                return { pendingRequests: pending };
            });
        });
    },
}));
