import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SidebarNav from './components/SidebarNav';
import Home from './pages/Home';
import Profile from './pages/Profile';
import ViewProfile from './pages/ViewProfile';
import Messages from './pages/Messages';
import MapView from './pages/Map';
import AuthModal from './components/AuthModal';
import Admin from './pages/Admin';
import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();

  return (
    <ThemeProvider>
      <Router>
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950 font-sans relative transition-colors duration-300 w-full overflow-hidden">
          <AuthModal />
          <SidebarNav />
          <main className="flex-1 overflow-y-auto px-4 py-8 relative z-10 transition-colors duration-300">
            <div className="max-w-7xl mx-auto h-full">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:id" element={<ViewProfile />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/map" element={<MapView />} />
                <Route 
                  path="/admin" 
                  element={user?.role === 'admin' ? <Admin /> : <Navigate to="/" />} 
                />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
