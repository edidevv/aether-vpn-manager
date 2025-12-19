import React from 'react';
import { motion } from 'framer-motion';
import { X, Server, Wifi, Star } from 'lucide-react';
import { LoadRing } from './LoadRing';
import { clsx } from 'clsx';

interface ServerDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    cityName: string;
    countryName: string;
    servers: any[];
    onSelect: (server: any) => void;
    currentId: string | null;
}

export const ServerDrawer = ({ isOpen, onClose, cityName, countryName, servers, onSelect, currentId }: ServerDrawerProps) => {
    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: isOpen ? '0%' : '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 h-full w-80 bg-[#121214]/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-30 flex flex-col"
        >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-start bg-gradient-to-b from-white/5 to-transparent">
                <div>
                    <h2 className="text-2xl font-bold text-white leading-none">{cityName}</h2>
                    <p className="text-sm text-gray-400 mt-1">{countryName}</p>
                    <div className="flex items-center gap-2 mt-3">
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                            {servers.length} Servers Available
                        </span>
                    </div>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition">
                    <X className="w-5 h-5 text-gray-400" />
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {servers.map((server) => (
                    <div
                        key={server.id}
                        onClick={() => onSelect(server)}
                        className={clsx(
                            "p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]",
                            currentId === server.id
                                ? "bg-purple-500/10 border-purple-500/50 shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                                : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                        )}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                                <Server className={clsx("w-4 h-4", currentId === server.id ? "text-purple-400" : "text-gray-500")} />
                                <span className={clsx("text-xs font-bold", currentId === server.id ? "text-white" : "text-gray-300")}>
                                    {server.name}
                                </span>
                            </div>
                            {currentId === server.id && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                        </div>

                        <div className="flex justify-between items-end">
                            <div className="flex gap-3">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-500 uppercase">Ping</span>
                                    <span className={clsx("text-xs font-mono", server.latency ? "text-emerald-400" : "text-gray-600")}>
                                        {server.latency ? `${server.latency}ms` : '-'}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-500 uppercase">Type</span>
                                    <span className="text-xs text-gray-300 uppercase">{server.type}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="text-[10px] text-gray-500 font-bold">LOAD</div>
                                <LoadRing percentage={server.load} size={28} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};