import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";

export const FollowerPointerCard = ({
  children,
  className,
  title,
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const ref = React.useRef(null);
  const [rect, setRect] = useState(null);
  const [isInside, setIsInside] = useState(false);

  useEffect(() => {
    if (ref.current) {
      setRect(ref.current.getBoundingClientRect());
    }
    
    const handleScrollOrResize = () => {
      if (ref.current) {
        setRect(ref.current.getBoundingClientRect());
      }
    };
    
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    
    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, []);

  const handlePointerMove = (e) => {
    if (rect) {
      // Get pointer relative to the document
      const docX = e.pageX;
      const docY = e.pageY;
      
      // Get container's top-left corner relative to the document
      const containerLeft = rect.left + window.scrollX;
      const containerTop = rect.top + window.scrollY;
      
      // Compute relative coordinates
      x.set(docX - containerLeft);
      y.set(docY - containerTop);
    }
  };

  const handlePointerLeave = () => {
    setIsInside(false);
  };

  const handlePointerEnter = () => {
    setIsInside(true);
  };

  return (
    <div
      onPointerLeave={handlePointerLeave}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      style={{
        cursor: "none",
      }}
      ref={ref}
      className={`relative ${className}`}
    >
      <AnimatePresence>
        {isInside && <FollowPointer x={x} y={y} title={title} />}
      </AnimatePresence>
      {children}
    </div>
  );
};

export const FollowPointer = ({ x, y, title }) => {
  return (
    <motion.div
      className="h-4 w-4 rounded-full absolute z-[100] pointer-events-none"
      style={{
        top: y,
        left: x,
      }}
      initial={{
        scale: 1,
        opacity: 1,
      }}
      animate={{
        scale: 1,
        opacity: 1,
      }}
      exit={{
        scale: 0,
        opacity: 0,
      }}
    >
      {/* SVG Pointer */}
      <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="1"
        viewBox="0 0 16 16"
        className="h-6 w-6 text-primary transform -translate-x-[12px] -translate-y-[10px] stroke-black drop-shadow-xl -rotate-[22deg]"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z"></path>
      </svg>
      {/* Tooltip Content */}
      <motion.div
        initial={{
          scale: 0.5,
          opacity: 0,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        exit={{
          scale: 0.5,
          opacity: 0,
        }}
        className="px-3 py-1.5 bg-white border border-gray-200 shadow-2xl rounded-full text-zinc-900 whitespace-nowrap min-w-max text-xs font-bold pointer-events-none transform translate-x-2 translate-y-1 flex items-center"
      >
        {title}
      </motion.div>
    </motion.div>
  );
};
