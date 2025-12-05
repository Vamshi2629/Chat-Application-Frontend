import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useFriendStore } from '../store/friendStore';
import socketService from '../services/socketService';
import ChatWindow from '../components/ChatWindow';
import { MessageCircle } from 'lucide-react';

const Chat = () => {
    const { token, user } = useAuthStore();
    const { fetchChannels, initSocketListeners, activeChannel } = useChatStore();
    const { loadPending, initSocket: initFriendSocket } = useFriendStore();

    useEffect(() => {
        if (token && user?.id) {
            // Store userId for later reference
            localStorage.setItem('userId', user.id);

            // Connect socket
            console.log('🔌 Connecting socket...');
            const socket = socketService.connect(token);

            if (socket) {
                const initializeListeners = () => {
                    console.log('✅ Socket connected! Initializing listeners...');
                    initSocketListeners();
                    initFriendSocket();
                };

                // Listen for connect event
                socket.off('connect'); // Remove old listener
                socket.on('connect', () => {
                    console.log('✅ Socket connected event fired');
                    initializeListeners();
                });

                // If already connected, init immediately
                if (socket.connected) {
                    console.log('Socket already connected');
                    initializeListeners();
                }

                socket.off('disconnect');
                socket.on('disconnect', (reason) => {
                    console.log('❌ Socket disconnected:', reason);
                });

                socket.off('connect_error');
                socket.on('connect_error', (error) => {
                    console.error('❌ Socket connection error:', error.message);
                });
            }

            fetchChannels();
            loadPending();
        }
    }, [token, user?.id]);

    // Join room when activeChannel changes
    useEffect(() => {
        if (activeChannel && socketService.isConnected()) {
            console.log('📥 Joining chat room:', activeChannel.id);
            socketService.joinRoom(activeChannel.id);
        }
    }, [activeChannel?.id]);

    if (activeChannel) {
        return <ChatWindow />;
    }

    return (
        <div className="flex-1 flex items-center justify-center bg-gray-800 h-full">
            <div className="text-center p-8">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-pulse">
                    <MessageCircle className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Welcome to Chat App</h2>
                <p className="text-gray-400 mb-4">Select a conversation or start a new one</p>
                <div className="flex flex-col gap-2 text-sm text-gray-500">
                    <p>💬 Search for users in the sidebar</p>
                    <p>👥 Add friends before starting a chat</p>
                    <p>✉️ Send and receive messages in real-time</p>
                </div>
            </div>
        </div>
    );
};

export default Chat;
