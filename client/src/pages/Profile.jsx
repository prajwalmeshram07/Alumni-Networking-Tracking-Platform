import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Image } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '', bio: '', company: '', jobTitle: '', city: '', state: '', country: '', skills: '', profilePic: ''
  });
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setFormData({
          name: data.name || '',
          bio: data.bio || '',
          company: data.company || '',
          jobTitle: data.jobTitle || '',
          city: data.city || '',
          state: data.state || '',
          country: data.country || '',
          skills: data.skills && Array.isArray(data.skills) ? data.skills.join(', ') : '',
          profilePic: data.profilePic || ''
        });
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    if (user) fetchProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    try {
      await axios.put('http://localhost:5000/api/users/profile', formData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setSuccessMsg('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update profile');
    }
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image too large. Max 5MB.");
        e.target.value = null;
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setNewPostImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim() && !newPostImage) return;
    try {
      await axios.post('http://localhost:5000/api/posts', {
        content: newPostContent,
        image: newPostImage
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      
      setSuccessMsg('Post created successfully! Check the Social Feed.');
      setNewPostContent('');
      setNewPostImage('');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Failed to post');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-neutral-400 transition-colors duration-300">Loading profile data...</div>;

  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 max-w-3xl mx-auto border border-gray-100 mb-8 dark:bg-neutral-900 dark:text-neutral-100 transition-colors duration-300 dark:border-neutral-800 transition-colors duration-300">
      <div className="flex justify-between items-center border-b pb-6 mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800 dark:text-neutral-100 transition-colors duration-300">My Profile</h1>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)} 
            className="bg-primary hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow"
          >
            Edit Profile
          </button>
        )}
      </div>
      
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-8 font-medium shadow-sm">
          {successMsg}
        </div>
      )}

      {!isEditing ? (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="flex items-center space-x-6">
             <div 
               className={`w-28 h-28 rounded-full overflow-hidden bg-gradient-to-tr from-blue-100 to-indigo-50 border-2 border-gray-100 flex items-center justify-center text-4xl text-primary font-bold shadow-md transition-all ${formData.profilePic ? 'cursor-pointer hover:ring-4 ring-blue-100' : ''}`}
               onClick={() => formData.profilePic && setIsPreviewOpen(true)}
               title={formData.profilePic ? "Click to view full image" : ""}
             >
               {formData.profilePic ? (
                 <img src={formData.profilePic} alt="Profile" className="w-full h-full object-cover hover:scale-105 transition-transform" />
               ) : formData.name.charAt(0).toUpperCase()}
             </div>
             <div>
               <h2 className="text-3xl font-bold text-gray-800 dark:text-neutral-100 transition-colors duration-300">{formData.name}</h2>
               <p className="text-lg text-primary font-medium mt-1">
                 {formData.jobTitle ? formData.jobTitle : 'Not set'} 
                 {formData.company ? ` @ ${formData.company}` : ''}
               </p>
               <p className="text-gray-500 flex items-center mt-1 dark:text-neutral-400 transition-colors duration-300">
                 📍 {[formData.city, formData.state, formData.country].filter(Boolean).join(', ') || 'Location not set'}
               </p>
             </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 dark:bg-neutral-950 dark:text-neutral-200 transition-colors duration-300 dark:border-neutral-800 transition-colors duration-300">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">About Me</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap dark:text-neutral-100 transition-colors duration-300">
              {formData.bio ? formData.bio : <span className="text-gray-400 italic">No bio provided.</span>}
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 dark:bg-neutral-950 dark:text-neutral-200 transition-colors duration-300 dark:border-neutral-800 transition-colors duration-300">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Skills & Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {formData.skills ? formData.skills.split(',').map((s, i) => (
                <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {s.trim()}
                </span>
              )) : <span className="text-gray-400 italic">No skills added.</span>}
            </div>
          </div>

          {/* Create Post Widget inside Profile View */}
          <div className="bg-blue-50/30 border border-blue-100 rounded-2xl p-6 mt-8 animate-in slide-in-from-bottom-4">
            <h3 className="font-bold text-gray-800 mb-5 flex items-center dark:text-neutral-100 transition-colors duration-300">
              <span className="bg-primary w-2 h-6 rounded-full mr-3 inline-block"></span> Create a Post
            </h3>
            <div className="flex space-x-3">
              <div className="w-12 h-12 flex-shrink-0 bg-white border border-gray-200 rounded-full flex items-center justify-center text-primary font-bold overflow-hidden shadow-sm dark:bg-neutral-900 dark:text-neutral-100 transition-colors duration-300 dark:border-neutral-800 transition-colors duration-300">
                {formData.profilePic ? <img src={formData.profilePic} className="w-full h-full object-cover" /> : formData.name.charAt(0).toUpperCase()}
              </div>
              <form onSubmit={handleCreatePost} className="flex-1">
                <textarea 
                  className="w-full bg-white p-4 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none transition-all shadow-sm dark:bg-neutral-900 dark:text-neutral-100 transition-colors duration-300 dark:border-neutral-800 transition-colors duration-300" 
                  placeholder="Share an update, photo, or achievement with the alumni network..." 
                  rows="3"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                />
                
                {newPostImage && (
                  <div className="relative mt-3 max-w-sm rounded-lg overflow-hidden outline outline-2 outline-gray-200 shadow-sm bg-white dark:bg-neutral-900 dark:text-neutral-100 transition-colors duration-300">
                    <img src={newPostImage} alt="Post preview" className="w-full h-auto object-contain" />
                    <button type="button" onClick={() => setNewPostImage('')} className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-8 h-8 flex justify-center items-center hover:bg-red-500 transition-colors shadow focus:outline-none">✕</button>
                  </div>
                )}
                
                <div className="flex justify-between items-center mt-3 pt-3">
                  <label className="cursor-pointer text-gray-600 hover:text-primary transition-colors flex items-center font-medium px-3 py-2 rounded-lg hover:bg-white border text-sm bg-gray-50 shadow-sm dark:bg-neutral-900 dark:text-neutral-100 transition-colors duration-300">
                    <Image className="w-5 h-5 mr-2 text-primary" /> Attach Photo
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                  
                  <button type="submit" disabled={!newPostContent.trim() && !newPostImage} className="bg-primary hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 px-8 rounded-full transition-all shadow-md active:scale-[0.98]">
                    Post to Feed
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          
          <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 mb-6">
            <label className="block text-gray-700 font-bold mb-2 dark:text-neutral-100 transition-colors duration-300">Upload Profile Picture</label>
            <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  if (file.size > 2 * 1024 * 1024) {
                    alert("Image too large. Please select an image under 2MB.");
                    e.target.value = null;
                    return;
                  }
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setFormData({ ...formData, profilePic: reader.result });
                  };
                  reader.readAsDataURL(file);
                }
            }} className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:bg-neutral-900 dark:text-neutral-100 transition-colors duration-300 dark:border-neutral-800 transition-colors duration-300" />
            <p className="text-xs text-gray-500 mt-2 dark:text-neutral-400 transition-colors duration-300">Select a local image from your device (Max 2MB).</p>
            {formData.profilePic && (
              <div className="mt-4 flex items-center">
                <span className="text-sm font-semibold mr-4 text-gray-700 dark:text-neutral-100 transition-colors duration-300">Preview:</span>
                <img src={formData.profilePic} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-primary shadow" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2 dark:text-neutral-100 transition-colors duration-300">Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:border-neutral-800 transition-colors duration-300" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-gray-700 font-bold mb-2 dark:text-neutral-100 transition-colors duration-300">City</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:border-neutral-800 transition-colors duration-300" />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2 dark:text-neutral-100 transition-colors duration-300">State</label>
              <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:border-neutral-800 transition-colors duration-300" />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2 dark:text-neutral-100 transition-colors duration-300">Country</label>
              <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:border-neutral-800 transition-colors duration-300" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-bold mb-2 dark:text-neutral-100 transition-colors duration-300">Company</label>
              <input type="text" name="company" value={formData.company} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:border-neutral-800 transition-colors duration-300" />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2 dark:text-neutral-100 transition-colors duration-300">Job Title</label>
              <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:border-neutral-800 transition-colors duration-300" />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2 dark:text-neutral-100 transition-colors duration-300">Bio</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} rows="4" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:border-neutral-800 transition-colors duration-300" placeholder="Tell us about yourself..." />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2 dark:text-neutral-100 transition-colors duration-300">Skills (Comma separated)</label>
            <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:border-neutral-800 transition-colors duration-300" placeholder="React, Node.js, Python" />
          </div>

          <div className="flex space-x-4 pt-4 border-t border-gray-100 dark:border-neutral-800 transition-colors duration-300">
            <button type="submit" className="bg-primary hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors active:scale-[0.98]">
              Save Profile
            </button>
            <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-8 rounded-lg transition-colors active:scale-[0.98] dark:text-neutral-100 transition-colors duration-300">
              Cancel
            </button>
          </div>
        </form>
      )}

      {isPreviewOpen && formData.profilePic && (
        <div 
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-200"
          onClick={() => setIsPreviewOpen(false)}
        >
          <img 
            src={formData.profilePic} 
            alt="Enlarged Profile" 
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl cursor-default animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} 
          />
          <button 
            onClick={() => setIsPreviewOpen(false)}
            className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors bg-black/50 p-2 rounded-full"
            title="Close Preview"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
