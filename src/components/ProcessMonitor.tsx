import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldAlert, ShieldCheck, AlertTriangle, Cpu, Network } from 'lucide-react';
import { clsx } from 'clsx';

export const ProcessMonitor = ({ isVpnActive }: { isVpnActive: boolean }) => {
    const [processes, setProcesses] = useState<any[]>([]);
    const [iface, setIface] = useState('');

    useEffect(() => {
        const fetchProcs = async () => {
            // @ts-ignore
            const data = await window.ipcRenderer.invoke('sys:get-processes');
            if (data) {
                setProcesses(data.processes || []);
                setIface(data.interface || 'Unknown');
            }
        };
        // Scanare mai rara (3s) pentru a nu face lag
        const interval = setInterval(fetchProcs, 3000);
        fetchProcs();
        return () => clearInterval(interval);
    }, []);

    // Afisam doar top 20 procese pentru performanta, sau toate daca sunt putine
    const displayProcs = processes.slice(0, 30);

    return (
        <div className="h-full flex flex-col p-6 relative">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Cpu className="w-6 h-6 text-purple-400"/> Process Guard
                    </h2>
                    <p className="text-xs text-gray-500">Active connections via: <span className="text-emerald-400 font-mono">{iface}</span></p>
                </div>
                <div className={clsx("text-xs font-bold px-3 py-1 rounded border", isVpnActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20")}>
                    {isVpnActive ? "VPN TUNNEL ACTIVE" : "UNSECURED TRAFFIC"}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                {displayProcs.map((proc) => (
                    <div key={proc.id + proc.pid} className={clsx(
                        "p-3 rounded-lg border flex items-center justify-between transition-all",
                        proc.status === 'exposed' ? "bg-red-500/5 border-red-500/20" : "bg-white/5 border-white/5"
                    )}>
                        <div className="flex items-center gap-3">
                            <div className={clsx("p-2 rounded-lg", proc.status === 'exposed' ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400")}>
                                <Activity className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="font-bold text-sm text-white">{proc.name}</div>
                                <div className="text-[10px] text-gray-500 font-mono">PID: {proc.pid} | {proc.protocol}</div>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className={clsx("text-xs font-bold flex items-center justify-end gap-1",
                                proc.status === 'safe' ? "text-emerald-400" : "text-red-400"
                            )}>
                                {proc.status === 'safe' ? "SECURED" : "EXPOSED"}
                                {proc.status === 'safe' ? <ShieldCheck className="w-3 h-3"/> : <ShieldAlert className="w-3 h-3"/>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};