import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { cn } from "../../lib/utils";
import { Link } from "react-router-dom";

const SidebarContext = createContext(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const Sidebar = ({ children, open: openProp, setOpen: setOpenProp, animate = true }) => {
  const [openState, setOpenState] = useState(false);
  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const SidebarBody = (props) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...props} />
    </>
  );
};

export const DesktopSidebar = ({ className, children, ...props }) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        "h-full px-4 py-4 hidden md:flex md:flex-col bg-white dark:bg-neutral-900 w-[250px] flex-shrink-0 border-r border-neutral-200 dark:border-neutral-800 transition-colors z-[100]",
        className
      )}
      animate={{
        width: animate ? (open ? "250px" : "70px") : "250px",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({ className, children, ...props }) => {
  const { open, setOpen } = useSidebar();
  return (
    <div className={cn("h-14 px-4 py-4 flex flex-row items-center justify-between bg-white dark:bg-neutral-900 w-full md:hidden transition-colors border-b border-neutral-200 dark:border-neutral-800 z-[100]", className)} {...props}>
      <div className="flex justify-end w-full">
        <IconMenu2
          className="text-neutral-800 dark:text-neutral-200 cursor-pointer"
          onClick={() => setOpen(!open)}
        />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className="fixed inset-0 bg-white dark:bg-neutral-900 flex flex-col z-[100] px-4 py-6"
          >
            <div className="flex justify-end w-full cursor-pointer absolute top-4 right-4 z-50">
              <IconX
                className="text-neutral-800 dark:text-neutral-200"
                onClick={() => setOpen(!open)}
              />
            </div>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SidebarLink = ({ link, className, onClick }) => {
  const { open, animate } = useSidebar();

  const Inner = (
    <>
      <div className="flex-shrink-0">{link.icon}</div>
      <AnimatePresence>
        {(open || !animate) && (
          <motion.span
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.15 }}
            className="text-sm text-neutral-700 dark:text-neutral-200 whitespace-pre"
          >
            {link.label}
          </motion.span>
        )}
      </AnimatePresence>
    </>
  );

  return onClick ? (
    <button onClick={onClick} className={cn("flex items-center gap-3 py-2 cursor-pointer w-full focus:outline-none hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-all px-2 overflow-hidden", className)}>
      {Inner}
    </button>
  ) : (
    <Link to={link.href} className={cn("flex items-center gap-3 py-2 cursor-pointer w-full focus:outline-none hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-all px-2 overflow-hidden", className)}>
      {Inner}
    </Link>
  );
};
