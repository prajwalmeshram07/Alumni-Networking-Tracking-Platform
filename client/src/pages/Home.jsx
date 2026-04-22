import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, Image, ThumbsUp, MessageCircle, Share2, Send, Users } from 'lucide-react';
import { FollowerPointerCard } from '../components/ui/following-pointer';
import { AnimatedTooltip } from '../components/ui/animated-tooltip';
import { Link } from 'react-router-dom';

const TitleComponent = ({ title, avatar, id }) => (
  <div className="flex items-center space-x-2 w-full max-w-[200px]">
    <Link to={`/profile/${id}`} className="flex-shrink-0 z-20">
      <img
        src={avatar}
        height="25"
        width="25"
        alt="author thumbnail"
        className="rounded-full border-2 border-white object-cover shadow-sm bg-gray-200" 
      />
    </Link>
    <Link to={`/profile/${id}`} className="text-gray-800 truncate hover:text-primary transition-colors font-medium">{title}</Link>
  </div>
);

const Home = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('feed');

  const [commentTexts, setCommentTexts] = useState({});
  const [showComments, setShowComments] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, postsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/users', { headers: { Authorization: `Bearer ${user.token}` } }),
          axios.get('http://localhost:5000/api/posts', { headers: { Authorization: `Bearer ${user.token}` } })
        ]);
        setUsers(usersRes.data);
        setPosts(postsRes.data);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };
    if (user) fetchData();
  }, [user]);

  const handleFollow = async (id) => {
    setLoadingId(id);
    try {
      await axios.put(`http://localhost:5000/api/users/${id}/follow`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isConnected: true, connections: [...(u.connections || []), user._id] } : u));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to follow user');
    }
    setLoadingId(null);
  };

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return users.filter(u => 
      (u.name && u.name.toLowerCase().includes(q)) || 
      (u.company && u.company.toLowerCase().includes(q)) || 
      (u.city && u.city.toLowerCase().includes(q)) ||
      (u.state && u.state.toLowerCase().includes(q)) ||
      (u.country && u.country.toLowerCase().includes(q))
    );
  }, [users, searchQuery]);

  const handleLike = async (postId) => {
    try {
      const { data } = await axios.put(`http://localhost:5000/api/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPosts(posts.map(p => p._id === postId ? { ...p, likes: data.likes } : p));
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (e, postId) => {
    e.preventDefault();
    if (!commentTexts[postId]?.trim()) return;
    try {
      const { data } = await axios.post(`http://localhost:5000/api/posts/${postId}/comment`, {
        text: commentTexts[postId]
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      
      setPosts(posts.map(p => p._id === postId ? { ...p, comments: data.comments } : p));
      setCommentTexts({ ...commentTexts, [postId]: '' });
      // Fetch posts again immediately to get properly populated comment user data
      const refreshed = await axios.get('http://localhost:5000/api/posts', { headers: { Authorization: `Bearer ${user.token}` } });
      setPosts(refreshed.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      {/* Tabs Layout */}
      <div className="flex justify-center space-x-4 mb-8">
        <button 
          onClick={() => setActiveTab('feed')}
          className={`flex items-center px-6 py-3 font-bold rounded-xl transition-all duration-300 shadow-sm ${activeTab === 'feed' ? 'bg-primary text-white scale-105' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700'}`}
        >
          📰 Social Feed
        </button>
        <button 
          onClick={() => setActiveTab('network')}
          className={`flex items-center px-6 py-3 font-bold rounded-xl transition-all duration-300 shadow-sm ${activeTab === 'network' ? 'bg-primary text-white scale-105' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700'}`}
        >
          <Users className="w-5 h-5 mr-2" /> Discover Alumni
        </button>
      </div>

      {activeTab === 'feed' && (
        <div className="max-w-2xl mx-auto space-y-6">
          {users.filter((u) => (!u.connections || !u.connections.includes(user._id)) && !u.isConnected && u._id !== user._id).length > 0 && (
            <div className="bg-white dark:bg-gray-900 border text-center border-gray-100 dark:border-gray-800 shadow-sm rounded-3xl p-6 relative overflow-visible animate-in slide-in-from-top-4 duration-500 hover:shadow-md transition-colors transition-shadow">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Suggested Connections</h3>
               <div className="flex flex-row items-center justify-center w-full pl-6">
                 <AnimatedTooltip items={users.filter((u) => (!u.connections || !u.connections.includes(user._id)) && !u.isConnected && u._id !== user._id).slice(0, 7).map((u, i) => ({
                    id: i + 1,
                    name: u.name,
                    designation: u.company ? `${u.jobTitle || 'Alumni'} @ ${u.company}` : u.jobTitle || "Alumni",
                    image: u.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`
                  }))} />
               </div>
            </div>
          )}

          {/* Social Feed List */}
          <div className="space-y-6">
            {posts.length === 0 && <p className="text-center text-gray-500 py-10">No posts yet. Be the first to share something!</p>}
            
            {posts.map(post => (
              <FollowerPointerCard
                key={post._id}
                title={
                  <TitleComponent 
                    title={post.userId?.name || 'Unknown User'} 
                    avatar={post.userId?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.userId?.name || 'User')}&background=random`} 
                    id={post.userId?._id}
                  />
                }
              >
                <div className="bg-white dark:bg-gray-900 shadow rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in-95 duration-300 relative group transition-all hover:shadow-xl hover:-translate-y-1">
                  <div className="p-4 flex items-center space-x-3 pointer-events-auto">
                    <Link to={`/profile/${post.userId?._id}`} className="w-12 h-12 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-primary font-bold overflow-hidden shadow-sm hover:ring-2 ring-primary transition-all">
                      {post.userId?.profilePic ? <img src={post.userId.profilePic} className="w-full h-full object-cover"/> : post.userId?.name?.charAt(0)}
                    </Link>
                  <div>
                    <Link to={`/profile/${post.userId?._id}`} className="font-bold text-gray-900 dark:text-gray-100 leading-tight hover:text-primary transition-colors">{post.userId?.name || 'Unknown User'}</Link>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">{post.userId?.jobTitle} {post.userId?.company && `@ ${post.userId.company}`}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{new Date(post.createdAt).toLocaleDateString([], { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}</p>
                  </div>
                </div>

                {post.content && <div className="px-4 pb-3 text-gray-800 dark:text-gray-300 whitespace-pre-wrap">{post.content}</div>}
                
                {post.image && (
                  <div className="w-full bg-black/5 border-y">
                    <img src={post.image} className="w-full h-auto object-contain max-h-[600px]" alt="Post content" />
                  </div>
                )}
                
                <div className="px-4 py-2 text-xs text-gray-500 flex justify-between border-b">
                  <span>{post.likes.length} Likes</span>
                  <span>{post.comments.length} Comments</span>
                </div>

                <div className="px-2 py-1 flex justify-around pointer-events-auto cursor-auto">
                  <button onClick={() => handleLike(post._id)} className={`flex-1 mx-1 py-2 rounded-lg flex items-center justify-center font-medium transition-colors ${post.likes.includes(user._id) ? 'text-primary bg-blue-50' : 'text-gray-500 hover:bg-gray-100'}`}>
                    <ThumbsUp className={`w-5 h-5 mr-2 ${post.likes.includes(user._id) ? 'fill-current' : ''}`} /> Like
                  </button>
                  <button onClick={() => setShowComments({...showComments, [post._id]: !showComments[post._id]})} className="flex-1 mx-1 py-2 rounded-lg flex items-center justify-center font-medium text-gray-500 hover:bg-gray-100 transition-colors">
                    <MessageCircle className="w-5 h-5 mr-2" /> Comment
                  </button>
                  <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Link copied to dashboard!'); }} className="flex-1 mx-1 py-2 rounded-lg flex items-center justify-center font-medium text-gray-500 hover:bg-gray-100 transition-colors">
                    <Share2 className="w-5 h-5 mr-2" /> Share
                  </button>
                </div>

                {/* Comments Section */}
                {showComments[post._id] && (
                  <div className="bg-gray-50 dark:bg-gray-800/60 p-4 border-t dark:border-gray-700">
                    <form onSubmit={(e) => handleComment(e, post._id)} className="flex items-start space-x-2 mb-4">
                      <div className="w-8 h-8 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-primary font-bold overflow-hidden shadow-sm text-sm">
                        {user.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover"/> : user.name.charAt(0)}
                      </div>
                      <div className="flex-1 relative">
                        <textarea 
                          value={commentTexts[post._id] || ''}
                          onChange={(e) => setCommentTexts({...commentTexts, [post._id]: e.target.value})}
                          placeholder="Add a comment..." 
                          className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 dark:text-gray-100 rounded-2xl px-4 py-2 pr-12 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none text-sm transition-colors"
                          rows="1"
                        />
                        <button type="submit" disabled={!commentTexts[post._id]?.trim()} className="absolute right-2 top-1.5 text-primary hover:text-blue-700 disabled:opacity-50 p-1">
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </form>
                    
                    <div className="space-y-3">
                      {post.comments.map((c, i) => (
                        <div key={i} className="flex space-x-2 animate-in slide-in-from-top-2">
                          <div className="w-8 h-8 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-primary font-bold overflow-hidden text-sm">
                            {c.userId?.profilePic ? <img src={c.userId.profilePic} className="w-full h-full object-cover"/> : c.userId?.name?.charAt(0)}
                          </div>
                          <div className="bg-white dark:bg-gray-900 px-4 py-2 rounded-2xl border dark:border-gray-700 shadow-sm text-sm inline-block max-w-[85%]">
                            <span className="font-bold text-gray-900 dark:text-gray-100 block leading-tight mb-0.5">{c.userId?.name || 'User'}</span>
                            <span className="text-gray-800 dark:text-gray-300">{c.text}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                </div>
              </FollowerPointerCard>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'network' && (
        <div className="bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800 transition-colors shadow rounded-lg p-6 min-h-[500px]">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4 border-b dark:border-gray-800 pb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Discover Alumni</h1>
              <p className="text-gray-500 mt-1">Connect with people, companies, and locations.</p>
            </div>
            
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg leading-5 bg-gray-50 dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                placeholder="Search by Name, Location, or Company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.length === 0 && <p className="text-gray-500 col-span-full text-center py-10">No users match your search.</p>}
            {filteredUsers.map(u => (
              <div key={u._id} className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/40 rounded-xl p-6 flex flex-col items-center shadow-sm hover:shadow-md transition-all">
                <Link to={`/profile/${u._id}`} className="w-20 h-20 bg-gradient-to-r from-blue-100 to-blue-50 text-primary border border-blue-200 rounded-full flex items-center justify-center text-3xl font-bold mb-4 shadow-sm overflow-hidden hover:ring-4 ring-blue-50 transition-all">
                  {u.profilePic ? <img src={u.profilePic} className="w-full h-full object-cover" /> : u.name.charAt(0).toUpperCase()}
                </Link>
                <Link to={`/profile/${u._id}`} className="font-bold text-xl text-gray-800 dark:text-gray-100 hover:text-primary transition-colors">{u.name}</Link>
                <p className="text-primary font-medium text-sm mt-1">{u.role === 'alumni' ? (u.jobTitle || 'Alumni') : 'Student'}</p>
                
                <div className="w-full mt-4 mb-4 text-sm text-gray-600 flex flex-col items-center space-y-1">
                  <span className="flex items-center text-center">{u.company ? `🏢 ${u.company}` : '🏢 No company listed'}</span>
                  <span className="flex items-center text-center">{[u.city, u.state, u.country].filter(Boolean).join(', ') ? `📍 ${[u.city, u.state, u.country].filter(Boolean).join(', ')}` : '📍 Location unknown'}</span>
                </div>
                
                <button 
                  onClick={() => handleFollow(u._id)}
                  disabled={loadingId === u._id || u.isConnected || (u.connections && u.connections.includes(user._id))}
                  className={`w-full py-2.5 mt-auto rounded-lg font-bold transition-all ${
                    (u.isConnected || (u.connections && u.connections.includes(user._id))) 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                      : 'bg-primary hover:bg-blue-700 text-white shadow hover:shadow-md active:scale-[0.98]'
                  }`}
                >
                  {(u.isConnected || (u.connections && u.connections.includes(user._id))) ? '✓ Connected' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
