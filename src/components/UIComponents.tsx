import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Counter = ({ value, unit }: { value: number, unit: string }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;
    const duration = 500;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = start + (end - start) * ease;
      setDisplayValue(current);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span className="font-mono">
      {displayValue.toFixed(1)} <span className="text-xs text-gray-500">{unit}</span>
    </span>
  );
};

export const SidebarBtn = ({ active, onClick, icon, label, onHover }: any) => {
    const [hover, setHover] = useState(false);
    return (
        <div className="relative flex items-center">
            <motion.button
                onClick={onClick}
                onMouseEnter={() => { setHover(true); onHover(); }}
                onMouseLeave={() => setHover(false)}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                className={`p-3 rounded-xl transition-all duration-300 relative z-20 ${active ? "text-purple-400 bg-purple-500/10" : "text-gray-500 hover:text-white hover:bg-white/5"}`}
            >
                {active && <motion.div layoutId="nav-glow" className="absolute inset-0 rounded-xl bg-purple-500/20 blur-lg" />}
                {icon}
            </motion.button>
            <AnimatePresence>
                {hover && (
                    <motion.div
                        initial={{ opacity: 0, x: 10, scale: 0.8 }}
                        animate={{ opacity: 1, x: 20, scale: 1 }}
                        exit={{ opacity: 0, x: 10, scale: 0.8 }}
                        className="absolute left-full bg-gray-800 text-white text-xs px-2 py-1 rounded border border-white/10 whitespace-nowrap z-50 shadow-xl"
                    >
                        {label}
                        <div className="absolute top-1/2 -left-1 -mt-1 border-4 border-transparent border-r-gray-800" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};