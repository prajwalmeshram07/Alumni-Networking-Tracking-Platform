import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef, useState } from "react";

export const FloatingDock = ({ items, className }) => {
  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[5000] ${className}`}>
      <FloatingDockDesktop items={items} />
    </div>
  );
};

const FloatingDockDesktop = ({ items }) => {
  const mouseX = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className="mx-auto flex h-16 gap-4 items-end rounded-2xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border border-gray-200 dark:border-neutral-800 px-4 pb-3 shadow-[0_0_40px_rgba(0,0,0,0.1)]"
    >
      {items.filter(Boolean).map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

function IconContainer({ mouseX, title, icon, href, onClick }) {
  const ref = useRef(null);
  
  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  const heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

  const widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
  const heightTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);

  const width = useSpring(widthTransform, { mass: 0.1, stiffness: 150, damping: 12 });
  const height = useSpring(heightTransform, { mass: 0.1, stiffness: 150, damping: 12 });

  const widthIcon = useSpring(widthTransformIcon, { mass: 0.1, stiffness: 150, damping: 12 });
  const heightIcon = useSpring(heightTransformIcon, { mass: 0.1, stiffness: 150, damping: 12 });

  const [hovered, setHovered] = useState(false);

  const InnerCore = (
    <motion.div
      ref={ref}
      style={{ width, height }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="aspect-square rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center relative shadow-sm border border-transparent dark:border-white/10"
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 2, x: "-50%" }}
            className="px-3 py-1.5 whitespace-nowrap absolute left-1/2 -top-10 rounded-md bg-black border border-gray-800 text-white text-xs font-bold shadow-xl z-50 pointer-events-none"
          >
            {title}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        style={{ width: widthIcon, height: heightIcon }}
        className="flex items-center justify-center pointer-events-none"
      >
        {icon}
      </motion.div>
    </motion.div>
  );

  return onClick ? (
    <button onClick={onClick} className="h-full flex items-end focus:outline-none cursor-pointer">
      {InnerCore}
    </button>
  ) : (
    <Link to={href} className="h-full flex items-end focus:outline-none cursor-pointer">
      {InnerCore}
    </Link>
  );
}
