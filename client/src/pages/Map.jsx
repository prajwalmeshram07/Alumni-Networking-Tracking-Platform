import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Globe3D } from '../components/ui/3d-globe';

const MapView = () => {
  const { user } = useAuth();
  const [markers, setMarkers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const [allUsersRes, profileRes] = await Promise.all([
          axios.get('http://localhost:5000/api/users', { headers: { Authorization: `Bearer ${user.token}` } }),
          axios.get('http://localhost:5000/api/users/profile', { headers: { Authorization: `Bearer ${user.token}` } })
        ]);
        
        const combinedData = [...allUsersRes.data, profileRes.data];
        
        const registeredMarkers = combinedData
          .filter(u => u && u.location && typeof u.location.lat !== 'undefined' && typeof u.location.lng !== 'undefined')
          .map(u => ({
            lat: parseFloat(u.location.lat),
            lng: parseFloat(u.location.lng),
            src: u.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`,
            name: `${u.name}${u._id === user._id ? ' (You)' : ''} `,
            location: `${u.city || ''}${u.state ? `, ${u.state}` : ''}${u.country ? `, ${u.country}` : ''}`.trim().replace(/^,/, '') || 'Location Unknown',
            company: u.company || 'Open for Opportunities',
            label: `${u.name}${u._id === user._id ? ' (You)' : ''} - ${u.city || 'Location'}`
          }));

        setMarkers(registeredMarkers);
      } catch (err) {
        console.error(err);
        setMarkers([]);
      }
    };
    if (user) {
      fetchLocations();
    } else {
      setMarkers([]);
    }
  }, [user]);

  return (
    <div className="w-full h-full min-h-[700px] bg-gray-900 rounded-3xl border border-gray-800 flex items-center justify-center overflow-hidden relative shadow-2xl">
        <div className="absolute top-8 left-8 z-20 pointer-events-none select-none">
          <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-gray-800 shadow-2xl">
            <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-md mb-2">Global Alumni Network</h1>
            <p className="text-indigo-300 font-medium tracking-wide">Explore interactive connections around the world.</p>
          </div>
        </div>
        
        {markers.length > 0 ? (
          <Globe3D
            markers={markers}
            config={{
              atmosphereColor: "#4da6ff",
              atmosphereIntensity: 20,
              bumpScale: 5,
              autoRotateSpeed: 0.3,
            }}
            onMarkerClick={(marker) => {
              setSelectedUser(marker);
            }}
            onMarkerHover={(marker) => {
              if (marker) {
                console.log("Hovering:", marker.label);
              }
            }} 
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-20">
             <div className="bg-black/60 backdrop-blur-md px-8 py-5 rounded-xl border border-gray-700 shadow-2xl animate-pulse">
               <p className="text-gray-300 font-bold text-lg tracking-widest uppercase">No Active Global Profiles Located</p>
             </div>
           </div>
        )}

        {selectedUser && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-gray-900 border border-gray-700 rounded-3xl p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(0,0,0,0.5)] relative animate-in zoom-in-95 pointer-events-auto">
              <button 
                onClick={() => setSelectedUser(null)} 
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
                title="Close"
              >
                <span className="text-xl leading-none -mt-0.5">&times;</span>
              </button>
              
              <div className="w-24 h-24 mx-auto mb-4 border-[3px] border-gray-700 rounded-full overflow-hidden shadow-[0_0_20px_rgba(77,166,255,0.2)] bg-gray-800 p-0.5">
                <img src={selectedUser.src} alt={selectedUser.name} className="w-full h-full object-cover rounded-full" />
              </div>
              
              <h2 className="text-2xl font-black text-white mb-2 tracking-wide">{selectedUser.name}</h2>
              <div className="h-1 w-12 bg-blue-500 mx-auto mb-6 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
              
              <div className="space-y-4 text-sm font-medium">
                <div className="flex items-center justify-center text-gray-300 bg-gray-800/50 py-2.5 px-4 rounded-xl border border-gray-800">
                  <span className="w-2 h-2 rounded-full bg-purple-400 mr-3 shadow-[0_0_8px_rgba(192,132,252,0.8)] flex-shrink-0"></span>
                  <span className="truncate">{selectedUser.company}</span>
                </div>
                <div className="flex items-center justify-center text-gray-300 bg-gray-800/50 py-2.5 px-4 rounded-xl border border-gray-800">
                  <span className="w-2 h-2 rounded-full bg-green-400 mr-3 shadow-[0_0_8px_rgba(74,222,128,0.8)] flex-shrink-0"></span>
                  <span className="truncate">{selectedUser.location}</span>
                </div>
              </div>
              
              <button onClick={() => setSelectedUser(null)} className="mt-8 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-200 border border-gray-600 w-full shadow-lg active:scale-95 text-sm uppercase tracking-widest">
                Close Profile
              </button>
            </div>
          </div>
        )}
    </div>
  );
};

export default MapView;
