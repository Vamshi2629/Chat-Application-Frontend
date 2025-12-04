import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import socketService from '../services/socketService';
import ChatWindow from '../components/ChatWindow';

const Chat = () => {
    const { token } = useAuthStore();
    const { fetchChannels, initSocketListeners, activeChannel } = useChatStore();

    useEffect(() => {
        if (token) {
            // Connect socket
            socketService.connect(token);
            initSocketListeners();
            fetchChannels();
        }

        return () => {
            socketService.disconnect();
        };
    }, [token]);

    if (activeChannel) {
        return <ChatWindow />;
    }

    return (
        <div className="flex-1 flex items-center justify-center bg-gray-800 h-full">
            <div className="text-center p-8">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Welcome to Chat App</h2>
                <p className="text-gray-400">Select a conversation or start a new one</p>
            </div>
        </div>
    );
};

export default Chat;

