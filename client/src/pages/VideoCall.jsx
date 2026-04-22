import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const VideoCall = ({ roomId, onEnd, activeChat, currentUser, isReceivingCall }) => {
  const [inCall, setInCall] = useState(false);
  const [callStatus, setCallStatus] = useState('Waiting to start...');
  const myVideo = useRef();
  const userVideo = useRef();
  const peerConnection = useRef(null);
  const localStream = useRef(null);

  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStream.current = stream;
        if (myVideo.current) myVideo.current.srcObject = stream;
        
        socket.emit('join_call', roomId);
        
        if (isReceivingCall) {
          socket.emit('call_accepted', roomId);
        }
      } catch (err) {
        console.error("Error accessing media devices.", err);
      }
    };
    initMedia();

    socket.on('call_accepted', async () => {
      setCallStatus('Call Connected!');
      if (!peerConnection.current) {
         peerConnection.current = createPeerConnection();
      }
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socket.emit('offer', { offer, roomId });
      setInCall(true);
    });

    socket.on('offer', async (data) => {
      if (!peerConnection.current) {
         peerConnection.current = createPeerConnection();
      }
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      socket.emit('answer', { answer, roomId });
      setInCall(true);
      setCallStatus('Call Active');
    });

    socket.on('answer', async (data) => {
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    });

    socket.on('ice_candidate', async (data) => {
      if (peerConnection.current) {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    socket.on('end_call', () => {
      endCall(false);
    });

    return () => {
      socket.off('call_accepted');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice_candidate');
      socket.off('end_call');
      if (localStream.current) {
        localStream.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [roomId]);

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice_candidate', { candidate: event.candidate, roomId });
      }
    };

    pc.ontrack = (event) => {
      if (userVideo.current) {
        userVideo.current.srcObject = event.streams[0];
      }
    };

    if (localStream.current) {
      localStream.current.getTracks().forEach(track => pc.addTrack(track, localStream.current));
    }

    return pc;
  };

  const ringUser = () => {
    socket.emit('incoming_call', {
      callerName: currentUser.name,
      callerObjId: currentUser._id,
      receiverObjId: activeChat._id,
      roomId
    });
    setCallStatus('Ringing ' + activeChat.name + '...');
  };

  const endCall = (emit = true) => {
    if (emit) {
      socket.emit('end_call', roomId);
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
    }
    setInCall(false);
    if(onEnd) onEnd();
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col items-center shadow-2xl relative">
      <div className="absolute top-3 left-5 text-green-400 font-bold text-sm tracking-widest z-10">{callStatus}</div>
      <div className="flex gap-4 mb-4 flex-wrap justify-center w-full mt-6">
        <div className="w-[45%] min-w-[200px] aspect-video bg-black rounded-lg overflow-hidden relative shadow-lg outline outline-1 outline-gray-700">
          <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
          <span className="absolute bottom-2 left-3 bg-black/60 text-white px-2 py-1 text-xs rounded-md font-bold">You</span>
        </div>
        
        <div className="w-[45%] min-w-[200px] aspect-video bg-black rounded-lg overflow-hidden relative shadow-lg outline outline-1 outline-gray-700">
          {inCall ? (
            <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-800/80">
              <div className="w-16 h-16 rounded-full bg-gray-700 border-2 border-gray-600 flex items-center justify-center text-2xl mb-2 font-bold text-gray-300">
                {activeChat?.name?.charAt(0)}
              </div>
            </div>
          )}
          <span className="absolute bottom-2 left-3 bg-black/60 text-white px-2 py-1 text-xs rounded-md font-bold">Remote</span>
        </div>
      </div>

      <div className="flex gap-4 mt-2">
        {!inCall && callStatus.includes('Waiting') ? (
          <button onClick={ringUser} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 px-8 rounded-full transition-colors shadow-lg active:scale-95">
            Call {activeChat?.name}
          </button>
        ) : (
          <button onClick={() => endCall(true)} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-8 rounded-full transition-colors shadow-lg active:scale-95">
            End Call
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
