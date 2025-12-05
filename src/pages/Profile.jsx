import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { userApi, uploadApi } from '../services/api';
import { Camera, Save, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, setUser } = useAuthStore();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        status: user?.status || '',
        avatar: user?.avatar || ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                status: user.status || '',
                avatar: user.avatar || ''
            });
        }
    }, [user]);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate it's an image
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (5MB for profile photos)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        setIsUploading(true);
        try {
            console.log('Starting upload for file:', file.name);
            const uploadResponse = await uploadApi.uploadFile(file);
            console.log('Upload response:', uploadResponse);

            const avatarUrl = uploadResponse.data.url;
            console.log('Avatar URL:', avatarUrl);

            setFormData(prev => {
                const updated = { ...prev, avatar: avatarUrl };
                console.log('Updated formData:', updated);
                return updated;
            });

            toast.success('Photo uploaded! Click Save to update');
        } catch (error) {
            console.error('Upload error:', error);
            console.error('Error response:', error.response);
            toast.error('Failed to upload photo');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Name is required');
            return;
        }

        setIsLoading(true);
        try {
            console.log('Sending update with data:', formData);
            const response = await userApi.updateProfile(formData);
            console.log('Update response:', response);
            setUser(response.data);
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Update error:', error);
            console.error('Error response:', error.response);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="max-w-2xl mx-auto p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-bold">My Profile</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center gap-4 p-6 bg-gray-800 rounded-xl">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                {formData.avatar ? (
                                    <img
                                        src={formData.avatar}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-5xl font-bold">
                                        {formData.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={handleAvatarClick}
                                disabled={isUploading}
                                className="absolute bottom-0 right-0 p-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors disabled:opacity-50"
                            >
                                {isUploading ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <Camera size={20} />
                                )}
                            </button>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <p className="text-sm text-gray-400 text-center">
                            Click the camera icon to upload a profile photo
                        </p>
                    </div>

                    {/* Name Field */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                            Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
                            placeholder="Enter your name"
                        />
                    </div>

                    {/* Status Field */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                            Status / Description
                        </label>
                        <textarea
                            value={formData.status}
                            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 resize-none"
                            placeholder="What's on your mind?"
                            rows={3}
                            maxLength={150}
                        />
                        <p className="text-xs text-gray-400">
                            {formData.status?.length || 0}/150 characters
                        </p>
                    </div>

                    {/* Email (read-only) */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                            Email
                        </label>
                        <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="w-full bg-gray-700 text-gray-400 px-4 py-3 rounded-xl cursor-not-allowed border border-gray-600"
                        />
                    </div>

                    {/* Save Button */}
                    <button
                        type="submit"
                        disabled={isLoading || isUploading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                Save Profile
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
