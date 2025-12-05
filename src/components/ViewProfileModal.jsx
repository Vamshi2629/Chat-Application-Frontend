import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { userApi } from '../services/api';

const ViewProfileModal = ({ userId, onClose }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await userApi.getUserById(userId);
                setUser(response.data);
            } catch (error) {
                console.error('Failed to fetch user:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, [userId]);

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
                <div className="bg-gray-900 w-full max-w-md rounded-2xl p-6 m-4 border border-gray-800">
                    <div className="flex justify-center">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-gray-900 w-full max-w-md rounded-2xl border border-gray-800 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Profile</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Avatar */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-5xl font-bold text-white">
                                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                )}
                            </div>
                            {/* Online indicator */}
                            {user.isOnline && (
                                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-gray-900" />
                            )}
                        </div>

                        {/* Name */}
                        <h3 className="text-2xl font-bold text-white">{user.name}</h3>

                        {/* Online Status */}
                        <p className="text-sm text-gray-400">
                            {user.isOnline ? (
                                <span className="text-green-400">● Online</span>
                            ) : user.lastSeen ? (
                                `Last seen ${new Date(user.lastSeen).toLocaleString()}`
                            ) : (
                                'Offline'
                            )}
                        </p>
                    </div>

                    {/* Status */}
                    {user.status && (
                        <div className="bg-gray-800 rounded-xl p-4">
                            <p className="text-sm font-medium text-gray-400 mb-1">Status</p>
                            <p className="text-white">{user.status}</p>
                        </div>
                    )}

                    {/* Email */}
                    <div className="bg-gray-800 rounded-xl p-4">
                        <p className="text-sm font-medium text-gray-400 mb-1">Email</p>
                        <p className="text-white break-all">{user.email}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewProfileModal;
