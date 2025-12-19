import React, { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis } from 'recharts';

interface DataPoint {
  download: number;
  upload: number;
}

const TrafficGraph = ({ downloadSpeed, uploadSpeed }: { downloadSpeed: number, uploadSpeed: number }) => {
  // Initializam cu date goale pentru a evita erorile de render
  const [data, setData] = useState<DataPoint[]>(Array(40).fill({ download: 0, upload: 0 }));

  useEffect(() => {
    // Mecanism de update fluid
    const interval = setInterval(() => {
      setData(prev => {
        const newPoint = {
            download: downloadSpeed,
            upload: uploadSpeed
        };
        // Pastram ultimele 40 de puncte si adaugam unul nou
        const newData = [...prev.slice(1), newPoint];
        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [downloadSpeed, uploadSpeed]);

  return (
    <div className="w-full h-40 mt-6 relative bg-black/20 rounded-xl border border-white/5 backdrop-blur-sm overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorDownload" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorUpload" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
          </defs>

          {/* YAxis ascuns pentru look minimalist */}
          <YAxis domain={[0, 'auto']} hide />

          <Tooltip
            contentStyle={{ backgroundColor: '#18181b', borderColor: '#333', borderRadius: '8px', fontSize: '12px' }}
            itemStyle={{ padding: 0 }}
            labelStyle={{ display: 'none' }}
            formatter={(value: number) => [`${value.toFixed(1)} KB/s`]}
            animationDuration={200}
          />

          <Area
            type="monotone"
            dataKey="download"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorDownload)"
            isAnimationActive={true}
            animationDuration={800}
          />
          <Area
            type="monotone"
            dataKey="upload"
            stroke="#8b5cf6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorUpload)"
            isAnimationActive={true}
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend Overlay */}
      <div className="absolute top-2 right-3 text-[10px] text-gray-500 font-mono flex gap-3 pointer-events-none">
          <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-emerald-500">DL</span>
          </div>
          <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
              <span className="text-purple-500">UP</span>
          </div>
      </div>
    </div>
  );
};

export default TrafficGraph;