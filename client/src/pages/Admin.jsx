import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Trash2, Users, FileText, Image, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const Admin = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, posts: 0 });
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user || user.role !== 'admin') return;
    try {
      setLoading(true);
      const [statsRes, usersRes, postsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/stats', { headers: { Authorization: `Bearer ${user.token}` } }),
        axios.get('http://localhost:5000/api/admin/users', { headers: { Authorization: `Bearer ${user.token}` } }),
        axios.get('http://localhost:5000/api/posts', { headers: { Authorization: `Bearer ${user.token}` } })
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setPosts(postsRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if(!window.confirm("Are you sure you want to permanently ban this user?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchData();
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const deletePost = async (id) => {
    if(!window.confirm("Are you sure you want to completely remove this post?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/posts/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchData();
    } catch (err) {
      alert("Failed to delete post");
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-in fade-in">
        <ShieldAlert className="w-24 h-24 text-red-500 mb-6 drop-shadow-md" />
        <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Access Denied</h1>
        <p className="text-lg text-gray-500 mt-3 font-medium">You do not have administrative privileges to view this control panel.</p>
      </div>
    );
  }

  if (loading) return <div className="text-center p-10 font-bold text-gray-500 animate-pulse text-lg">Authenticating Admin Protocol...</div>;

  return (
    <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden min-h-[750px] border border-gray-100 flex flex-col md:flex-row relative">
      {/* Sidebar */}
      <div className="w-full md:w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6 flex flex-col shadow-inner z-10">
        <div className="flex items-center mb-12 mt-4 px-2">
          <div className="bg-red-500 p-2 rounded-lg mr-4 shadow-lg shadow-red-500/30">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">ADMIN</h2>
        </div>
        
        <nav className="flex-1 space-y-3">
          <button onClick={() => { setActiveTab('dashboard'); setSearchTerm(''); }} className={`w-full flex items-center px-5 py-3.5 rounded-xl font-medium transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-red-500 text-white shadow-md shadow-red-500/20 translate-x-1' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
            <ShieldAlert className="w-5 h-5 mr-4" /> Dashboard
          </button>
          <button onClick={() => { setActiveTab('users'); setSearchTerm(''); }} className={`w-full flex items-center px-5 py-3.5 rounded-xl font-medium transition-all duration-200 ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 translate-x-1' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
            <Users className="w-5 h-5 mr-4" /> Manage Users
          </button>
          <button onClick={() => { setActiveTab('posts'); setSearchTerm(''); }} className={`w-full flex items-center px-5 py-3.5 rounded-xl font-medium transition-all duration-200 ${activeTab === 'posts' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20 translate-x-1' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
            <FileText className="w-5 h-5 mr-4" /> Manage Posts
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 bg-gray-50/50 overflow-y-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
          {activeTab === 'dashboard' && 'Platform Overview'}
          {activeTab === 'users' && 'User Directory'}
          {activeTab === 'posts' && 'Content Moderation'}
        </h1>
        <p className="text-gray-500 mb-10 pb-6 border-b border-gray-200 font-medium">
          {activeTab === 'dashboard' && 'High-level metrics and system performance.'}
          {activeTab === 'users' && 'View, audit, or permanently ban accounts.'}
          {activeTab === 'posts' && 'Monitor social feeds and remove inappropriate content.'}
        </p>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center hover:translate-y-[-2px] transition-transform">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mr-6 shadow-inner">
                <Users className="w-10 h-10" />
              </div>
              <div>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-1">Total Registered Accounts</p>
                <p className="text-5xl font-black text-gray-900">{stats.users}</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center hover:translate-y-[-2px] transition-transform">
              <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mr-6 shadow-inner">
                <FileText className="w-10 h-10" />
              </div>
              <div>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-1">Total Social Posts</p>
                <p className="text-5xl font-black text-gray-900">{stats.posts}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <div className="mb-6 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm font-medium"
                placeholder="Search specific users by name, company, job title, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">User Profile</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">System Role</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Details</th>
                    <th className="px-6 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {users.filter(u => 
                    (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (u.company && u.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (u.city && u.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (u.jobTitle && u.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
                  ).map(u => (
                  <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <Link to={`/profile/${u._id}`} className="flex-shrink-0 h-12 w-12 bg-gradient-to-tr from-blue-100 to-indigo-50 border border-blue-100 rounded-full flex items-center justify-center text-primary font-bold overflow-hidden shadow-sm hover:ring-2 ring-primary transition-all">
                          {u.profilePic ? <img src={u.profilePic} className="h-full w-full object-cover"/> : u.name.charAt(0).toUpperCase()}
                        </Link>
                        <div className="ml-4">
                          <Link to={`/profile/${u._id}`} className="text-sm font-bold text-gray-900 hover:text-primary transition-colors">{u.name}</Link>
                          <div className="text-xs font-medium text-gray-500 mt-0.5">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`px-4 py-1.5 inline-flex text-xs font-bold uppercase tracking-wider rounded-md shadow-sm ${u.role === 'admin' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-600">
                      <div><span className="font-bold text-gray-400 text-[10px] uppercase tracking-widest block mb-0.5">Location</span>{u.city ? `${u.city}${u.country ? `, ${u.country}` : ''}` : <span className="text-gray-300 italic">Unknown</span>}</div>
                      {u.company && <div className="mt-2"><span className="font-bold text-gray-400 text-[10px] uppercase tracking-widest block mb-0.5">Company</span>{u.company}</div>}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm">
                      {u.role !== 'admin' && (
                        <button onClick={() => deleteUser(u._id)} className="text-red-500 hover:text-white bg-red-50 hover:bg-red-600 px-4 py-2 font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-sm active:scale-95" title="Permanently Ban System User">
                          Ban Account
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="mb-6 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-sm font-medium"
                placeholder="Search specific posts by author name or content data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-5">
              {posts.filter(p => 
                (p.userId?.name && p.userId.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (p.content && p.content.toLowerCase().includes(searchTerm.toLowerCase()))
              ).map(p => (
              <div key={p._id} className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col md:flex-row items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <Link to={`/profile/${p.userId?._id}`} className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-primary font-bold text-xs mr-3 overflow-hidden hover:ring-2 ring-primary transition-all">
                      {p.userId?.profilePic ? <img src={p.userId.profilePic} className="h-full w-full object-cover"/> : p.userId?.name?.charAt(0)}
                    </Link>
                    <div>
                      <Link to={`/profile/${p.userId?._id}`} className="font-bold text-gray-900 block leading-tight hover:text-primary transition-colors">{p.userId?.name || 'Unknown'}</Link>
                      <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100">
                    <p className="text-gray-700 text-sm font-medium leading-relaxed whitespace-pre-wrap">{p.content || <span className="italic text-gray-400">[Attached Image Post]</span>}</p>
                    {p.image && <div className="mt-3 text-xs font-bold text-blue-500 flex items-center"><Image className="w-4 h-4 mr-1"/> Contains Media Payload</div>}
                  </div>
                </div>
                <div className="w-full md:w-auto flex justify-end">
                  <button onClick={() => deletePost(p._id)} className="text-red-500 hover:text-white bg-red-50 hover:bg-red-600 px-5 py-2.5 font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-sm flex items-center active:scale-95" title="Wipe Post from Database">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </button>
                </div>
              </div>
            ))}
            {posts.filter(p => 
              (p.userId?.name && p.userId.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
              (p.content && p.content.toLowerCase().includes(searchTerm.toLowerCase()))
            ).length === 0 && <p className="text-center text-gray-400 py-10 font-bold uppercase tracking-widest text-sm animate-pulse">No Active Database Posts</p>}
          </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
