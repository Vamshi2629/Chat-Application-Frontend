import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, KeyRound } from 'lucide-react';

const VerifyOTP = () => {
    const [otp, setOtp] = useState('');
    const { verifyOTP, isLoading, error } = useAuthStore();
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;

    if (!email) {
        navigate('/signup');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await verifyOTP(email, otp);
            navigate('/');
        } catch (err) {
            // Error handled in store
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
            <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Verify Email</h2>
                    <p className="text-gray-400">Enter the OTP sent to {email}</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            className="w-full bg-gray-700 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 placeholder-gray-400 tracking-widest text-center text-xl"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            maxLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify Email'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VerifyOTP;
