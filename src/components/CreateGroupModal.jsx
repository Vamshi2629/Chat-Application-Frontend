import { useState, useEffect } from 'react';
import { useFriendStore } from '../store/friendStore';
import { useChatStore } from '../store/chatStore';
import { X, Users, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateGroupModal = ({ onClose }) => {
    const { friends, loadFriends } = useFriendStore();
    const { createGroup, setActiveChannel } = useChatStore();
    const [groupName, setGroupName] = useState('');
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadFriends();
    }, [loadFriends]);

    const toggleFriend = (friendId) => {
        setSelectedFriends(prev =>
            prev.includes(friendId)
                ? prev.filter(id => id !== friendId)
                : [...prev, friendId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!groupName.trim()) {
            toast.error('Please enter a group name');
            return;
        }
        if (selectedFriends.length === 0) {
            toast.error('Please select at least one friend');
            return;
        }

        setIsSubmitting(true);
        try {
            const channel = await createGroup(groupName, selectedFriends);
            setActiveChannel(channel);
            toast.success('Group created successfully!');
            onClose();
        } catch (error) {
            toast.error('Failed to create group');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 w-full max-w-md rounded-2xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Users className="text-blue-500" /> Create New Group
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-4 space-y-4 overflow-y-auto flex-1">
                        {/* Group Name Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Group Name</label>
                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder="e.g. Weekend Trip"
                                className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
                                autoFocus
                            />
                        </div>

                        {/* Friends Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Select Members ({selectedFriends.length})
                            </label>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {friends.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No friends found. Add friends first!</p>
                                ) : (
                                    friends.map((friend) => (
                                        <div
                                            key={friend.id}
                                            onClick={() => toggleFriend(friend.id)}
                                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${selectedFriends.includes(friend.id)
                                                ? 'bg-blue-600/20 border-blue-500/50'
                                                : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${selectedFriends.includes(friend.id)
                                                ? 'bg-blue-500 border-blue-500'
                                                : 'border-gray-500'
                                                }`}>
                                                {selectedFriends.includes(friend.id) && <Check size={12} className="text-white" />}
                                            </div>

                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-xs font-bold">
                                                {friend.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className={`font-medium truncate ${selectedFriends.includes(friend.id) ? 'text-white' : 'text-gray-300'}`}>
                                                    {friend.name}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">{friend.email}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-800 bg-gray-900">
                        <button
                            type="submit"
                            disabled={!groupName.trim() || selectedFriends.length === 0 || isSubmitting}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>Create Group</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGroupModal;
