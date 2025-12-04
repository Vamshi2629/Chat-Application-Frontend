import { useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { userApi, friendApi } from '../services/api';
import { Search, LogOut, Plus, MessageCircle, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Sidebar = ({ user, onLogout }) => {
    const { channels, activeChannel, setActiveChannel, createDirectChannel } = useChatStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await userApi.searchUsers(query);
            setSearchResults(response.data);
        } catch (error) {
            console.error('Search error:', error);
        }
        setIsSearching(false);
    };

    const handleStartChat = async (userId) => {
        try {
            const channel = await createDirectChannel(userId);
            setActiveChannel(channel);
            setSearchQuery('');
            setSearchResults([]);
        } catch (error) {
            if (error.response && error.response.status === 403) {
                // Not friends, send request
                try {
                    await friendApi.sendRequest(userId);
                    toast.success('Friend request sent!');
                    setSearchQuery('');
                    setSearchResults([]);
                } catch (reqError) {
                    if (reqError.response && reqError.response.status === 409) {
                        toast.error('Friend request already sent/pending');
                    } else {
                        toast.error('Failed to send friend request');
                    }
                }
            } else {
                console.error('Error starting chat:', error);
            }
        }
    };

    const getChannelName = (channel) => {
        if (channel.type === 'group') {
            return channel.name || 'Group Chat';
        }
        // For direct chats, get the other user's name
        const otherMember = channel.members?.find(m => m.user?.id !== user?.id);
        return otherMember?.user?.name || 'Unknown User';
    };

    const getChannelAvatar = (channel) => {
        if (channel.type === 'group') {
            return channel.avatar;
        }
        const otherMember = channel.members?.find(m => m.user?.id !== user?.id);
        return otherMember?.user?.avatar;
    };

    const isOnline = (channel) => {
        if (channel.type === 'group') return false;
        const otherMember = channel.members?.find(m => m.user?.id !== user?.id);
        return otherMember?.user?.isOnline;
    };

    return (
        <div className="h-full bg-gray-900 border-r border-gray-800 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="hidden sm:block">
                            <h3 className="font-semibold text-white truncate max-w-[120px]">{user?.name}</h3>
                            <p className="text-xs text-gray-400 truncate max-w-[120px]">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full bg-gray-800 text-white pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <div className="absolute left-4 right-4 mt-2 bg-gray-800 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
                        {searchResults.map((user) => (
                            <button
                                key={user.id}
                                onClick={() => handleStartChat(user.id)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-gray-700 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-bold">
                                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                    <p className="font-medium text-white truncate">{user.name}</p>
                                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                </div>
                                <Plus size={18} className="text-gray-400" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Channel List */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-2">
                    <Link
                        to="/friends"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2 text-gray-300 hover:text-white"
                    >
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                            <Users size={20} />
                        </div>
                        <span className="font-medium">Friends</span>
                    </Link>

                    <h4 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Messages
                    </h4>
                    <div className="p-2">
                        {channels.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No conversations yet</p>
                                <p className="text-xs mt-1">Search for users to start chatting</p>
                            </div>
                        ) : (
                            channels.map((channel) => (
                                <button
                                    key={channel.id}
                                    onClick={() => setActiveChannel(channel)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors mb-1 ${activeChannel?.id === channel.id
                                        ? 'bg-blue-600/20 border border-blue-500/30'
                                        : 'hover:bg-gray-800'
                                        }`}
                                >
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                            {channel.type === 'group' ? (
                                                <Users size={20} />
                                            ) : (
                                                getChannelName(channel).charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        {isOnline(channel) && (
                                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-gray-900" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="font-medium text-white truncate">{getChannelName(channel)}</p>
                                        {channel.messages?.[0] && (
                                            <p className="text-sm text-gray-400 truncate">
                                                {channel.messages[0].content}
                                            </p>
                                        )}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
