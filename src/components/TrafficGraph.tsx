import React, { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis } from 'recharts';

interface DataPoint {
  download: number;
  upload: number;
}

const TrafficGraph = ({ downloadSpeed, uploadSpeed }: { downloadSpeed: number, uploadSpeed: number }) => {
  // Buffer mai mare pentru fluiditate
  const [data, setData] = useState<DataPoint[]>(Array(30).fill({ download: 0, upload: 0 }));

  useEffect(() => {
    // Adaugam datele noi si mentinem array-ul curat
    setData(prev => {
        const newPoint = {
            download: downloadSpeed,
            upload: uploadSpeed
        };
        const newData = [...prev.slice(1), newPoint];
        return newData;
    });
  }, [downloadSpeed, uploadSpeed]);

  return (
    <div className="w-full h-40 mt-6 relative bg-black/20 rounded-xl border border-white/5 backdrop-blur-sm overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorDownload" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorUpload" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
          </defs>

          <YAxis domain={[0, 'auto']} hide />
          <Tooltip
            contentStyle={{ backgroundColor: '#18181b', borderColor: '#333', borderRadius: '8px', fontSize: '12px' }}
            itemStyle={{ padding: 0 }}
            labelStyle={{ display: 'none' }}
            formatter={(value: number) => [`${value.toFixed(1)} KB/s`]}
            animationDuration={300} // Animatie fina la tooltip
          />

          <Area
            type="monotone" // Curbe fine
            dataKey="download"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorDownload)"
            isAnimationActive={true}
            animationDuration={1000} // Tranzitie lenta intre puncte
          />
          <Area
            type="monotone"
            dataKey="upload"
            stroke="#8b5cf6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorUpload)"
            isAnimationActive={true}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Overlay Stats */}
      <div className="absolute top-2 right-3 text-[10px] text-gray-500 font-mono flex gap-3 pointer-events-none">
          <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-emerald-500">DL: {downloadSpeed.toFixed(0)}</span>
          </div>
          <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
              <span className="text-purple-500">UP: {uploadSpeed.toFixed(0)}</span>
          </div>
      </div>
    </div>
  );
};

export default TrafficGraph;