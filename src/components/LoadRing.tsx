import React from 'react';
import { clsx } from 'clsx';

interface LoadRingProps {
  percentage: number;
  size?: number;
}

export const LoadRing = ({ percentage, size = 36 }: LoadRingProps) => {
  const radius = (size - 4) / 2; // Raza cercului
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  // Determina culoarea in functie de incarcare
  const getColor = (p: number) => {
    if (p < 50) return "text-emerald-500"; // Verde (Liber)
    if (p < 80) return "text-yellow-500";  // Galben (Mediu)
    return "text-red-500";                 // Rosu (Aglomerat)
  };

  const colorClass = getColor(percentage);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Textul din mijloc */}
      <span className={clsx("absolute text-[10px] font-bold font-mono", colorClass)}>
        {percentage}
      </span>

      {/* SVG-ul Cercului */}
      <svg className="transform -rotate-90 w-full h-full">
        {/* Cercul de fundal (gri) */}
        <circle
          className="text-white/5"
          strokeWidth="3"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Cercul de progres (colorat) */}
        <circle
          className={clsx("transition-all duration-1000 ease-out", colorClass)}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
    </div>
  );
};