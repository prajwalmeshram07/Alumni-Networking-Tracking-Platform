import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(name, email, password, role);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 border rounded shadow-sm">
      <h2 className="text-2xl font-bold text-center mb-6 text-primary">Join Aluminaye</h2>
      {error && <div className="bg-red-100 text-red-600 p-2 mb-4 rounded">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">Role</label>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            className="shadow border rounded w-full py-2 px-3 text-gray-700"
          >
            <option value="student">Student</option>
            <option value="alumni">Alumni</option>
          </select>
        </div>
        <button type="submit" className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none">
          Register
        </button>
      </form>
      <div className="mt-4 text-center">
        <p className="text-sm">Already have an account? <Link to="/login" className="text-primary hover:underline">Login</Link></p>
      </div>
    </div>
  );
};

export default Register;
