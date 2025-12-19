import React from 'react';
import { motion } from 'framer-motion';

export const SnowOverlay = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">

      {/* 1. PARTICULE CARE CAD (Ninsoare) */}
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white rounded-full opacity-80 blur-[1px]"
          initial={{
            x: Math.random() * window.innerWidth,
            y: -20,
            scale: Math.random() * 0.5 + 0.5
          }}
          animate={{
            y: window.innerHeight + 20,
            x: `calc(${Math.random() * 50 - 25}px)` // Mica deviatie stanga-dreapta
          }}
          transition={{
            duration: Math.random() * 5 + 5, // Viteza variabila
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 5
          }}
          style={{
            width: Math.random() * 3 + 2 + 'px',
            height: Math.random() * 3 + 2 + 'px',
          }}
        />
      ))}

      {/* 2. DEALUL DE ZAPADA (Jos) */}
      <div className="absolute bottom-0 left-0 w-full h-32 z-10 pointer-events-none">
          {/* Strat 1 - Spate (Mai transparent) */}
          <svg className="absolute bottom-0 w-full h-full text-white/5" viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path fill="currentColor" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>

          {/* Strat 2 - Fata (Mai alb, cu blur) */}
          <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-white/10 to-transparent backdrop-blur-[2px] rounded-[50%_50%_0_0_/_30%_30%_0_0]" style={{ transform: 'scaleX(1.5)' }}></div>

          {/* Glow jos */}
          <div className="absolute bottom-0 left-0 w-full h-10 bg-white/5 blur-xl"></div>
      </div>

    </div>
  );
};