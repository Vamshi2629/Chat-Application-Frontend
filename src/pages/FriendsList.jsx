import { useEffect } from 'react';
import { useFriendStore } from '../store/friendStore';
import { useAuthStore } from '../store/authStore';
import { Check, X, User, MessageCircle } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { useNavigate } from 'react-router-dom';

export default function FriendsList() {
    const { user } = useAuthStore();
    const {
        friends,
        pendingRequests,
        loadFriends,
        loadPending,
        respondRequest,
        initSocket,
    } = useFriendStore();
    const { createDirectChannel, setActiveChannel } = useChatStore();
    const navigate = useNavigate();

    // Load data once on mount
    useEffect(() => {
        if (user?.id) {
            loadFriends();
            loadPending();
            initSocket(); // start listening for real‑time notifications
        }
    }, [user?.id, loadFriends, loadPending, initSocket]);

    const handleMessage = async (friendId) => {
        try {
            const channel = await createDirectChannel(friendId);
            setActiveChannel(channel);
            navigate('/');
        } catch (error) {
            console.error("Failed to start chat", error);
        }
    };

    return (
        <div className="h-full bg-gray-900 text-white p-4 md:p-8 overflow-y-auto">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <User size={24} className="text-blue-500" /> Friends
            </h1>

            {/* Pending requests */}
            {pendingRequests.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-lg font-semibold mb-3 text-yellow-500">Pending Requests</h2>
                    <ul className="space-y-3">
                        {pendingRequests.map((req) => (
                            <li
                                key={req.id}
                                className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 border border-gray-700"
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-bold">
                                    {req.sender.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium">{req.sender.name}</p>
                                    <p className="text-xs text-gray-400">{req.sender.email}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => respondRequest(req.id, 'accept')}
                                        className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-full transition-colors"
                                        title="Accept"
                                    >
                                        <Check size={20} />
                                    </button>
                                    <button
                                        onClick={() => respondRequest(req.id, 'reject')}
                                        className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-full transition-colors"
                                        title="Reject"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Accepted friends */}
            <section>
                <h2 className="text-lg font-semibold mb-3 text-blue-400">Your Friends</h2>
                {friends.length === 0 ? (
                    <div className="text-center py-10 bg-gray-800/50 rounded-lg border border-gray-800">
                        <User size={48} className="mx-auto text-gray-600 mb-3" />
                        <p className="text-gray-400">You have no friends yet.</p>
                        <p className="text-sm text-gray-500 mt-1">Search for users in the sidebar to add them!</p>
                    </div>
                ) : (
                    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {friends.map((f) => (
                            <li
                                key={f.id}
                                className="flex items-center gap-3 p-4 rounded-lg bg-gray-800 hover:bg-gray-750 border border-gray-700 transition-all"
                            >
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                    {f.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{f.name}</p>
                                    <p className="text-xs text-gray-400 truncate">{f.email}</p>
                                </div>
                                <button
                                    onClick={() => handleMessage(f.id)}
                                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-full transition-colors"
                                    title="Message"
                                >
                                    <MessageCircle size={20} />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
