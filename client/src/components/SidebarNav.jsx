import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./ui/sidebar";
import { Link, useNavigate } from "react-router-dom";
import {
  IconHome,
  IconUser,
  IconMessageCircle,
  IconWorld,
  IconShieldLock,
  IconLogout,
  IconSun,
  IconMoon
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function SidebarNav() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const links = [
    {
      label: "Social Feed",
      href: "/",
      icon: <IconHome className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
      label: "Alumni Map",
      href: "/map",
      icon: <IconWorld className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
      label: "Messages",
      href: "/messages",
      icon: <IconMessageCircle className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    ...(user?.role === 'admin' ? [{
      label: "Admin Panel",
      href: "/admin",
      icon: <IconShieldLock className="h-5 w-5 shrink-0 text-red-500" />,
    }] : []),
  ];

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          {open ? <AlumniLogo /> : <AlumniLogoIcon />}
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {/* Explicitly bind exact DOM click boundaries skipping Aceternity component layers */}
          <button
            onClick={() => toggleTheme()}
            className="flex items-center gap-3 py-2 cursor-pointer w-full focus:outline-none hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-all px-2 overflow-hidden"
          >
            <div className="flex-shrink-0 z-20 pointer-events-none">
              {theme === 'dark' ? <IconSun className="h-5 w-5 shrink-0 text-yellow-500" /> : <IconMoon className="h-5 w-5 shrink-0 text-indigo-500" />}
            </div>
            {open && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-neutral-700 dark:text-neutral-200 whitespace-pre pointer-events-none">
                {theme === 'dark' ? "Light Mode" : "Dark Mode"}
              </motion.span>
            )}
          </button>
          
          {user && (
            <button
              onClick={() => handleLogout()}
              className="flex items-center gap-3 py-2 cursor-pointer w-full focus:outline-none hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-all px-2 overflow-hidden"
            >
              <div className="flex-shrink-0 z-20 pointer-events-none">
                <IconLogout className="h-5 w-5 shrink-0 text-red-500" />
              </div>
              {open && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-neutral-700 dark:text-neutral-200 whitespace-pre pointer-events-none">
                  Logout
                </motion.span>
              )}
            </button>
          )}

          {user && (
            <Link to="/profile" className="flex items-center gap-3 py-2 cursor-pointer w-full focus:outline-none hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-all px-2 overflow-hidden">
              <div className="flex-shrink-0 z-20 pointer-events-none">
                {user.profilePic ? (
                  <img src={user.profilePic} className="h-7 w-7 shrink-0 rounded-full object-cover" alt="Avatar" />
                ) : (
                  <div className="h-7 w-7 shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-primary font-bold text-xs shadow-sm">
                    {user.name?.charAt(0)}
                  </div>
                )}
              </div>
              {open && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-neutral-700 dark:text-neutral-200 whitespace-pre pointer-events-none">
                  {user.name}
                </motion.span>
              )}
            </Link>
          )}
        </div>
      </SidebarBody>
    </Sidebar>
  );
}

const AlumniLogo = () => {
  return (
    <Link to="/" className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black dark:text-white">
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-primary" />
      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-bold text-lg whitespace-pre text-black dark:text-white">
        Alumni Net
      </motion.span>
    </Link>
  );
};

const AlumniLogoIcon = () => {
  return (
    <Link to="/" className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black dark:text-white">
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-primary" />
    </Link>
  );
};
