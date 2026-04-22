import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThumbsUp, MessageCircle, Share2, Send, MapPin, Briefcase } from 'lucide-react';

const ViewProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [commentTexts, setCommentTexts] = useState({});
  const [showComments, setShowComments] = useState({});

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const [userRes, postsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/users/${id}`, { headers: { Authorization: `Bearer ${currentUser.token}` } }),
          axios.get(`http://localhost:5000/api/posts/user/${id}`, { headers: { Authorization: `Bearer ${currentUser.token}` } })
        ]);
        setUser(userRes.data);
        setPosts(postsRes.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    if (currentUser && id) fetchUserData();
  }, [id, currentUser]);

  const handleLike = async (postId) => {
    try {
      const { data } = await axios.put(`http://localhost:5000/api/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
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
      }, { headers: { Authorization: `Bearer ${currentUser.token}` } });
      
      setCommentTexts({ ...commentTexts, [postId]: '' });
      // Refresh user posts to show new comment
      const refreshed = await axios.get(`http://localhost:5000/api/posts/user/${id}`, { headers: { Authorization: `Bearer ${currentUser.token}` } });
      setPosts(refreshed.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading profile...</div>;
  if (!user) return <div className="p-8 text-center text-red-500 font-bold">User not found</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Profile Header */}
      <div className="bg-white dark:bg-neutral-900 shadow-xl rounded-3xl overflow-hidden mb-8 border border-gray-100 dark:border-neutral-800 transition-all">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        <div className="px-8 pb-8 flex flex-col items-center">
          <div className="relative -mt-16 mb-4">
            <div className="w-32 h-32 rounded-full border-4 border-white dark:border-neutral-900 overflow-hidden bg-white shadow-lg">
              {user.profilePic ? (
                <img src={user.profilePic} className="w-full h-full object-cover" alt={user.name} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 text-4xl font-bold">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
            {user.role === 'admin' && (
              <span className="absolute bottom-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">ADMIN</span>
            )}
          </div>
          
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">{user.name}</h1>
          <p className="text-primary font-bold mt-1 uppercase tracking-wider text-xs">{user.role}</p>
          
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm font-medium text-gray-600 dark:text-neutral-400">
            {user.jobTitle && (
              <span className="flex items-center bg-gray-50 dark:bg-neutral-800 px-3 py-1 rounded-full border dark:border-neutral-700">
                <Briefcase className="w-4 h-4 mr-2 text-blue-500" /> {user.jobTitle} {user.company && `@ ${user.company}`}
              </span>
            )}
            {[user.city, user.state, user.country].filter(Boolean).join(', ') && (
              <span className="flex items-center bg-gray-50 dark:bg-neutral-800 px-3 py-1 rounded-full border dark:border-neutral-700">
                <MapPin className="w-4 h-4 mr-2 text-red-500" /> {[user.city, user.state, user.country].filter(Boolean).join(', ')}
              </span>
            )}
          </div>
          
          {user.bio && (
            <div className="mt-6 max-w-2xl text-center text-gray-700 dark:text-neutral-300 italic leading-relaxed">
              "{user.bio}"
            </div>
          )}

          {user.skills && user.skills.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {user.skills.map((skill, i) => (
                <span key={i} className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-lg text-xs font-bold border border-blue-100 dark:border-blue-900/50">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User Posts Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center">
          <span className="w-2 h-8 bg-primary rounded-full mr-3"></span> {user.name.split(' ')[0]}'s Posts
        </h2>
        
        {posts.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 p-10 rounded-3xl text-center border border-dashed dark:border-neutral-800 text-gray-400 font-bold">
            This user hasn't posted anything yet.
          </div>
        ) : (
          posts.map(post => (
            <div key={post._id} className="bg-white dark:bg-neutral-900 shadow-xl rounded-3xl border border-gray-100 dark:border-neutral-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-5 flex items-center space-x-3">
                <div className="w-10 h-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-primary font-bold overflow-hidden">
                  {user.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover"/> : user.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{user.name}</h3>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">{new Date(post.createdAt).toLocaleDateString([], { month:'short', day:'numeric', year:'numeric' })}</p>
                </div>
              </div>

              {post.content && <div className="px-6 pb-4 text-gray-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">{post.content}</div>}
              
              {post.image && (
                <div className="w-full bg-black/5 border-y dark:border-neutral-800">
                  <img src={post.image} className="w-full h-auto object-contain max-h-[500px]" alt="Post content" />
                </div>
              )}
              
              <div className="px-6 py-2 text-xs text-gray-500 dark:text-neutral-500 flex justify-between border-b dark:border-neutral-800">
                <span>{post.likes.length} Likes</span>
                <span>{post.comments.length} Comments</span>
              </div>

              <div className="px-2 py-1 flex justify-around">
                <button onClick={() => handleLike(post._id)} className={`flex-1 mx-1 py-2 rounded-xl flex items-center justify-center font-bold transition-all ${post.likes.includes(currentUser._id) ? 'text-primary bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-neutral-800'}`}>
                  <ThumbsUp className={`w-5 h-5 mr-2 ${post.likes.includes(currentUser._id) ? 'fill-current' : ''}`} /> Like
                </button>
                <button onClick={() => setShowComments({...showComments, [post._id]: !showComments[post._id]})} className="flex-1 mx-1 py-2 rounded-xl flex items-center justify-center font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all">
                  <MessageCircle className="w-5 h-5 mr-2" /> Comment
                </button>
                <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }} className="flex-1 mx-1 py-2 rounded-xl flex items-center justify-center font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all">
                  <Share2 className="w-5 h-5 mr-2" /> Share
                </button>
              </div>

              {/* Comments Section */}
              {showComments[post._id] && (
                <div className="bg-gray-50 dark:bg-neutral-950/50 p-6 border-t dark:border-neutral-800">
                  <form onSubmit={(e) => handleComment(e, post._id)} className="flex items-start space-x-2 mb-6">
                    <div className="w-8 h-8 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-primary font-bold overflow-hidden shadow-sm text-sm">
                      {currentUser.profilePic ? <img src={currentUser.profilePic} className="w-full h-full object-cover"/> : currentUser.name.charAt(0)}
                    </div>
                    <div className="flex-1 relative">
                      <textarea 
                        value={commentTexts[post._id] || ''}
                        onChange={(e) => setCommentTexts({...commentTexts, [post._id]: e.target.value})}
                        placeholder="Add a comment..." 
                        className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 dark:text-white rounded-2xl px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none text-sm transition-all shadow-sm"
                        rows="1"
                      />
                      <button type="submit" disabled={!commentTexts[post._id]?.trim()} className="absolute right-2 top-1.5 text-primary hover:text-blue-700 disabled:opacity-50 p-1">
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </form>
                  
                  <div className="space-y-4">
                    {post.comments.map((c, i) => (
                      <div key={i} className="flex space-x-3">
                        <div className="w-8 h-8 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-primary font-bold overflow-hidden text-sm">
                          {c.userId?.profilePic ? <img src={c.userId.profilePic} className="w-full h-full object-cover"/> : c.userId?.name?.charAt(0)}
                        </div>
                        <div className="bg-white dark:bg-neutral-900 px-4 py-3 rounded-2xl border dark:border-neutral-800 shadow-sm text-sm inline-block max-w-[90%]">
                          <Link to={`/profile/${c.userId?._id}`} className="font-bold text-gray-900 dark:text-white hover:text-primary transition-colors block leading-tight mb-1">{c.userId?.name || 'User'}</Link>
                          <span className="text-gray-700 dark:text-neutral-300 leading-relaxed">{c.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ViewProfile;
