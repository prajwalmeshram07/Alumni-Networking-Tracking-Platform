import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthModal = () => {
  const { login, register, user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');

  if (user) return null; // Don't show if logged in

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    let result;
    if (isLogin) {
      result = await login(formData.email, formData.password);
    } else {
      result = await register(formData.name, formData.email, formData.password, formData.role);
    }
    
    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="flex border-b">
          <button 
            className={`flex-1 py-4 text-center font-bold transition-colors ${isLogin ? 'text-primary border-b-2 border-primary bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            className={`flex-1 py-4 text-center font-bold transition-colors ${!isLogin ? 'text-primary border-b-2 border-primary bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>
        
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {isLogin ? 'Welcome Back!' : 'Join Aluminaye'}
          </h2>
          
          {error && <div className="bg-red-50 text-red-600 p-3 mb-4 rounded-lg text-sm border border-red-100">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow"
                />
              </div>
            )}
            
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1">Email</label>
              <input
                type="email"
                required
                placeholder="you@email.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-1">I am a</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
                >
                  <option value="student">Student</option>
                  <option value="alumni">Alumni</option>
                </select>
              </div>
            )}
            
            <button 
              type="submit" 
              className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98] mt-4"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
