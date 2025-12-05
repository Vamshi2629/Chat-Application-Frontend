import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useFriendStore } from '../store/friendStore';
import { useChatStore } from '../store/chatStore';
import Sidebar from './Sidebar';
import { Menu, X, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
    const { user, logout } = useAuthStore();
    const { pendingRequests } = useFriendStore();
    const { activeChannel } = useChatStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const notificationCount = pendingRequests?.length || 0;

    return (
        <div className="h-screen flex bg-gray-900 text-white overflow-hidden">
            {/* Mobile Header Bar - Hide when chat is active */}
            {!activeChannel && (
                <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <h1 className="text-lg font-semibold">Chat App</h1>

                    {/* Notification Bell */}
                    <Link to="/friends" className="relative p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                        <Bell size={24} />
                        {notificationCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
                                {notificationCount > 9 ? '9+' : notificationCount}
                            </span>
                        )}
                    </Link>
                </div>
            )}

            {/* Sidebar */}
            <div
                className={`
                    fixed inset-y-0 left-0 z-40 w-80 transform transition-transform duration-300 ease-in-out
                    lg:relative lg:translate-x-0
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    pt-16 lg:pt-0
                `}
            >
                <Sidebar user={user} onLogout={logout} onCloseSidebar={() => setIsSidebarOpen(false)} />
            </div>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden pt-16"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className={`flex-1 flex flex-col min-w-0 ${activeChannel ? 'pt-0' : 'pt-16'} lg:pt-0`}>
                {children}
            </div>
        </div>
    );
};

export default Layout;
