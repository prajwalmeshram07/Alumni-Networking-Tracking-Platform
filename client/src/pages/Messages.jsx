import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { Video } from 'lucide-react';
import VideoCall from './VideoCall';
import { Link } from 'react-router-dom';

const socket = io('http://localhost:5000');

const getRoomId = (id1, id2) => {
  if (!id1 || !id2) return '';
  return [id1, id2].sort().join('_');
};

const Messages = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [incomingCall, setIncomingCall] = useState(null);
  const [isReceivingCall, setIsReceivingCall] = useState(false);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        if (!user || !user.token) return;
        const { data } = await axios.get('http://localhost:5000/api/users/connections', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setConnections(data || []);
      } catch (error) {
        console.error("Failed to fetch connections", error);
      }
    };
    if (user) fetchConnections();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    socket.on('receive_message', (data) => {
      // If the message belongs to the active chat room, push it
      if (activeChat && data.roomId === getRoomId(user._id, activeChat._id)) {
        setMessages((prev) => [...prev, data]);
      } else {
        // Unread message logic
        if (data.senderObjId && data.senderObjId !== user._id) {
          setUnreadCounts((prev) => ({
            ...prev,
            [data.senderObjId]: (prev[data.senderObjId] || 0) + 1
          }));
        }
      }
    });

    socket.on('incoming_call', (data) => {
      if (data.receiverObjId === user._id) {
        setIncomingCall(data);
      }
    });

    socket.on('call_declined', (data) => {
      if (data.callerObjId === user._id) {
        alert(`${data.receiverName || 'User'} declined the call.`);
        setShowVideoCall(false);
      }
    });

    return () => {
      socket.off('receive_message');
      socket.off('incoming_call');
      socket.off('call_declined');
    };
  }, [activeChat, user]);

  const acceptCall = () => {
    if (!incomingCall) return;
    const caller = connections.find(c => c._id === incomingCall.callerObjId);
    if (caller) {
      setActiveChat(caller);
    } else {
      setActiveChat({ _id: incomingCall.callerObjId, name: incomingCall.callerName });
    }
    setIsReceivingCall(true);
    setShowVideoCall(true);
    setIncomingCall(null);
  };

  const declineCall = () => {
    if (!incomingCall) return;
    socket.emit('call_declined', {
      callerObjId: incomingCall.callerObjId,
      receiverName: user?.name || 'User'
    });
    setIncomingCall(null);
  };

  const handleSelectChat = (connection) => {
    if (!connection) return;
    setActiveChat(connection);
    setMessages([]); // In a real app we would load history from DB here
    setShowVideoCall(false);
    setUnreadCounts(prev => ({ ...prev, [connection._id]: 0 }));
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (currentMessage.trim() !== '' && activeChat && user) {
      const messageData = {
        text: currentMessage,
        senderId: user.name,
        senderObjId: user._id,
        roomId: getRoomId(user._id, activeChat._id),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      socket.emit('send_message', messageData);
      setMessages((prev) => [...prev, messageData]);
      setCurrentMessage('');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg max-w-6xl mx-auto h-[700px] flex overflow-hidden border border-gray-100 dark:border-gray-800 relative transition-colors duration-300">
      {/* Incoming Call Notification Overlay */}
      {incomingCall && (
        <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm transition-all animate-in fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 dark:bg-neutral-900 dark:text-neutral-100 transition-colors duration-300">
            <div className="w-24 h-24 bg-gradient-to-tr from-blue-100 to-indigo-50 border-2 border-blue-200 rounded-full flex items-center justify-center text-primary font-bold text-4xl mx-auto mb-4 animate-pulse shadow-md">
              {incomingCall.callerName?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1 dark:text-neutral-100 transition-colors duration-300">{incomingCall.callerName || 'Unknown User'}</h3>
            <p className="text-gray-500 mb-8 font-medium dark:text-neutral-400 transition-colors duration-300">Incoming video call...</p>
            <div className="flex justify-center space-x-4">
              <button onClick={acceptCall} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform active:scale-95 flex items-center">
                <Video className="w-5 h-5 mr-3 fill-current" /> Accept
              </button>
              <button onClick={declineCall} className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform active:scale-95 flex items-center">
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Connections */}
      <div className="w-1/3 border-r dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors">
        <div className="p-4 border-b dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors">
          <h2 className="text-xl font-bold text-gray-800 dark:text-neutral-100 transition-colors duration-300">Your Connections</h2>
          <p className="text-sm text-gray-500 dark:text-neutral-400 transition-colors duration-300">Chat with people you follow</p>
        </div>
        <div className="overflow-y-auto flex-1 p-3 space-y-2">
          {(!connections || connections.length === 0) ? (
            <p className="text-center text-gray-400 mt-10">No connections yet. Follow someone from Home to chat!</p>
          ) : (
            connections.map((conn) => (
              <div 
                key={conn?._id || Math.random()} 
                className={`p-3 rounded-lg flex items-center relative transition-colors cursor-default ${activeChat?._id === conn?._id ? 'bg-primary text-white shadow-md' : 'bg-white dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm'}`}
              >
                <Link to={`/profile/${conn?._id}`} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mr-3 overflow-hidden shadow-sm transition-all hover:ring-2 ring-white/50 ${activeChat?._id === conn?._id ? 'bg-white text-primary' : 'bg-blue-100 dark:bg-blue-900 text-primary dark:text-blue-200'}`}>
                  {conn?.profilePic ? <img src={conn.profilePic} className="w-full h-full object-cover"/> : (conn?.name?.charAt(0)?.toUpperCase() || '?')}
                </Link>
                <div onClick={() => handleSelectChat(conn)} className="flex-1">
                  <h3 className="font-semibold px-2">{conn?.name || 'Unknown User'}</h3>
                </div>
                {(unreadCounts[conn?._id] > 0) && (
                  <span className="absolute right-4 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce shadow">
                    {unreadCounts[conn?._id]}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="w-2/3 flex flex-col bg-white dark:bg-gray-900 relative transition-colors">
        {activeChat ? (
          <>
            <div className="p-4 border-b dark:border-gray-800 flex justify-between items-center shadow-sm z-10 bg-white dark:bg-gray-900 transition-colors">
              <div className="flex items-center">
                <Link to={`/profile/${activeChat?._id}`} className="w-10 h-10 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold mr-3 overflow-hidden shadow-sm hover:ring-2 ring-primary transition-all">
                  {activeChat?.profilePic ? <img src={activeChat.profilePic} className="w-full h-full object-cover"/> : (activeChat?.name?.charAt(0)?.toUpperCase() || '?')}
                </Link>
                <Link to={`/profile/${activeChat?._id}`} className="text-xl font-bold hover:text-primary transition-colors">{activeChat?.name || 'Unknown User'}</Link>
              </div>
              <button 
                onClick={() => setShowVideoCall(!showVideoCall)}
                className={`p-2 rounded-full transition-colors flex items-center justify-center ${showVideoCall ? 'bg-red-100 text-red-600' : 'bg-blue-100 hover:bg-blue-200 text-primary'}`}
                title="Video Call"
              >
                <Video className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-3 bg-gray-50 relative dark:bg-neutral-950 dark:text-neutral-200 transition-colors duration-300">
              {showVideoCall && (
                <div className="absolute top-4 left-4 right-4 z-20 shadow-2xl rounded-lg">
                  <VideoCall roomId={getRoomId(user?._id, activeChat?._id)} onEnd={() => { setShowVideoCall(false); setIsReceivingCall(false); }} activeChat={activeChat} currentUser={user} isReceivingCall={isReceivingCall} />
                </div>
              )}

              {(!messages || messages.length === 0) ? (
                <p className="text-gray-400 text-center mt-20">Start the conversation with {activeChat?.name || 'them'}!</p>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className={`max-w-[70%] p-3 rounded-2xl ${msg?.senderId === user?.name ? 'bg-primary text-white self-end rounded-br-none' : 'bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-800 dark:text-gray-100 self-start rounded-bl-none shadow-sm transition-colors'}`}>
                    <p className="font-semibold text-xs mb-1 opacity-80">{msg?.senderId || 'User'}</p>
                    <p>{msg?.text || ''}</p>
                    <span className="text-[10px] opacity-70 mt-1 block text-right">{msg?.time || ''}</span>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t dark:border-gray-800 bg-white dark:bg-gray-900 flex space-x-2 transition-colors">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-gray-100 dark:bg-gray-800 dark:text-gray-100 border-none rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
              <button type="submit" disabled={!currentMessage.trim()} className="bg-primary hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-full transition-colors shadow-md active:scale-95">
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50 dark:bg-neutral-950 dark:text-neutral-200 transition-colors duration-300">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
              <Video className="w-10 h-10" />
            </div>
            <p className="text-lg">Select a connection to start messaging or video calling</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
