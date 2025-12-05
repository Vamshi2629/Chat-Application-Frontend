import { useEffect } from 'react';
import { useFriendStore } from '../store/friendStore';
import { useAuthStore } from '../store/authStore';
import { Check, X, User, MessageCircle, UserMinus, Ban, Shield } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function FriendsList() {
    const { user } = useAuthStore();
    const {
        friends,
        pendingRequests,
        blockedUsers,
        loadFriends,
        loadPending,
        loadBlocked,
        respondRequest,
        removeFriend,
        blockUser,
        unblockUser,
        initSocket,
    } = useFriendStore();
    const { createDirectChannel, setActiveChannel, fetchChannels } = useChatStore();
    const navigate = useNavigate();

    // Load data once on mount
    useEffect(() => {
        if (user?.id) {
            loadFriends();
            loadPending();
            loadBlocked();
            initSocket(); // start listening for real‑time notifications
        }
    }, [user?.id, loadFriends, loadPending, loadBlocked, initSocket]);

    const handleAccept = async (reqId) => {
        try {
            await respondRequest(reqId, 'accept');
            toast.success('Friend request accepted!');
            loadFriends();
            loadPending();
        } catch (error) {
            toast.error('Failed to accept request');
        }
    };

    const handleReject = async (reqId) => {
        try {
            await respondRequest(reqId, 'reject');
            toast.success('Friend request rejected');
            loadPending();
        } catch (error) {
            toast.error('Failed to reject request');
        }
    };

    const handleMessage = async (friendId) => {
        try {
            const channel = await createDirectChannel(friendId);
            if (channel) {
                await setActiveChannel(channel);
                await fetchChannels(); // Refresh channels list
                navigate('/');
            }
        } catch (error) {
            console.error("Failed to start chat", error);
            toast.error('Failed to start chat');
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
                    <h2 className="text-lg font-semibold mb-3 text-yellow-500">
                        Pending Requests ({pendingRequests.length})
                    </h2>
                    <ul className="space-y-3">
                        {pendingRequests.map((req) => (
                            <li
                                key={req.id}
                                className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 border border-gray-700"
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-bold">
                                    {req.sender?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium">{req.sender?.name || 'Unknown'}</p>
                                    <p className="text-xs text-gray-400">{req.sender?.email}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAccept(req.id)}
                                        className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-full transition-colors"
                                        title="Accept"
                                    >
                                        <Check size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleReject(req.id)}
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
            <section className="mb-8">
                <h2 className="text-lg font-semibold mb-3 text-blue-400">
                    Your Friends ({friends.length})
                </h2>
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
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                        {f.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    {f.isOnline && (
                                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-gray-800" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{f.name}</p>
                                    <p className="text-xs text-gray-400 truncate">{f.email}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleMessage(f.id)}
                                        className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-full transition-colors"
                                        title="Message"
                                    >
                                        <MessageCircle size={20} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm(`Are you sure you want to block ${f.name}?`)) {
                                                blockUser(f.id);
                                            }
                                        }}
                                        className="p-2 text-yellow-500 hover:bg-yellow-500/10 rounded-full transition-colors"
                                        title="Block User"
                                    >
                                        <Ban size={20} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm(`Are you sure you want to remove ${f.name} from friends?`)) {
                                                removeFriend(f.id);
                                            }
                                        }}
                                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                                        title="Remove Friend"
                                    >
                                        <UserMinus size={20} />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* Blocked Users */}
            {blockedUsers.length > 0 && (
                <section>
                    <h2 className="text-lg font-semibold mb-3 text-red-500 flex items-center gap-2">
                        <Shield size={20} /> Blocked Users ({blockedUsers.length})
                    </h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {blockedUsers.map((user) => (
                            <li
                                key={user.id}
                                className="flex items-center gap-3 p-4 rounded-lg bg-gray-800/50 border border-gray-700 opacity-75"
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 font-bold">
                                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-400 truncate">{user.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                                <button
                                    onClick={() => unblockUser(user.id)}
                                    className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                >
                                    Unblock
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
}
