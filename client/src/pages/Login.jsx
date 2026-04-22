import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 border rounded shadow-sm">
      <h2 className="text-2xl font-bold text-center mb-6 text-primary">Login to Aluminaye</h2>
      {error && <div className="bg-red-100 text-red-600 p-2 mb-4 rounded">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        <button type="submit" className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none transition-colors">
          Sign In
        </button>
      </form>
      <div className="mt-4 text-center">
        <p className="text-sm">Don't have an account? <Link to="/register" className="text-primary hover:underline">Register</Link></p>
      </div>
    </div>
  );
};

export default Login;
