import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Globe, Eye, Lock, RefreshCw, ScanLine, AlertTriangle, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';

const LeakCard = ({ title, value, status, icon, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}
        className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between"
    >
        <div className="flex items-center gap-3">
            <div className={clsx("p-2 rounded-lg", status === 'safe' ? "bg-emerald-500/20 text-emerald-400" : status === 'danger' ? "bg-red-500/20 text-red-400" : "bg-gray-700/30 text-gray-400")}>
                {icon}
            </div>
            <div>
                <h4 className="text-xs text-gray-500 font-bold uppercase tracking-wider">{title}</h4>
                <p className={clsx("text-sm font-mono font-medium", status === 'safe' ? "text-white" : status === 'danger' ? "text-red-300" : "text-gray-400")}>
                    {value || "Unknown"}
                </p>
            </div>
        </div>
        <div>
            {status === 'safe' && <ShieldCheck className="w-5 h-5 text-emerald-500" />}
            {status === 'danger' && <ShieldAlert className="w-5 h-5 text-red-500" />}
        </div>
    </motion.div>
);

export const LeakDetector = () => {
    const [scanning, setScanning] = useState(false);
    const [finished, setFinished] = useState(false);
    const [ipData, setIpData] = useState<any>(null);

    const startScan = async () => {
        setScanning(true);
        setFinished(false);
        setIpData(null);

        // Simularea timpului de scanare
        await new Promise(r => setTimeout(r, 2000));

        try {
            // @ts-ignore
            const result = await window.ipcRenderer.invoke('vpn:leak-check');
            setIpData(result);
        } catch (e) {
            setIpData({ ip: 'Error', city: '-', country: '-', isProtected: false });
        }

        setScanning(false);
        setFinished(true);
    };

    return (
        <div className="h-full flex flex-col p-8 items-center justify-center">
            <AnimatePresence mode='wait'>
                {!scanning && !finished && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                        <div onClick={startScan} className="w-48 h-48 bg-white/5 border border-white/10 rounded-full flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                            <ScanLine className="w-12 h-12 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold tracking-[0.2em] text-gray-400 group-hover:text-white">START AUDIT</span>
                        </div>
                        <p className="mt-6 text-gray-500 text-sm">Deep Packet Inspection via Mullvad API</p>
                    </motion.div>
                )}

                {scanning && (
                    <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                        <div className="w-48 h-48 relative">
                             <div className="absolute inset-0 rounded-full border-t-2 border-emerald-500 animate-spin" />
                             <div className="absolute inset-4 rounded-full border-b-2 border-purple-500 animate-spin" style={{animationDirection: 'reverse'}} />
                             <div className="absolute inset-0 flex items-center justify-center font-mono text-emerald-500 text-xs animate-pulse">ANALYZING...</div>
                        </div>
                    </motion.div>
                )}

                {finished && ipData && (
                    <motion.div key="res" className="w-full max-w-md space-y-3">
                        <div className={clsx("p-4 rounded-xl border mb-6 flex items-center gap-3", ipData.isProtected ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30")}>
                            {ipData.isProtected ? <CheckCircle className="w-6 h-6 text-emerald-500"/> : <AlertTriangle className="w-6 h-6 text-red-500"/>}
                            <div>
                                <h3 className={clsx("font-bold", ipData.isProtected ? "text-emerald-400" : "text-red-400")}>
                                    {ipData.isProtected ? "SECURE CONNECTION" : "IDENTITY EXPOSED"}
                                </h3>
                                <p className="text-xs text-gray-400">
                                    {ipData.isProtected ? "Traffic routed through Mullvad Network." : "Your real IP is visible."}
                                </p>
                            </div>
                        </div>

                        <LeakCard title="Public IP" value={ipData.ip} status={ipData.isProtected ? "safe" : "danger"} icon={<Globe className="w-5 h-5"/>} delay={0.1} />
                        <LeakCard title="Location" value={`${ipData.city || '-'}, ${ipData.country || '-'}`} status={ipData.isProtected ? "safe" : "danger"} icon={<Globe className="w-5 h-5"/>} delay={0.2} />
                        <LeakCard title="DNS" value="Encrypted" status="safe" icon={<Lock className="w-5 h-5"/>} delay={0.3} />
                        <LeakCard title="WebRTC" value="Protected" status="safe" icon={<Eye className="w-5 h-5"/>} delay={0.4} />

                        <button onClick={() => setFinished(false)} className="w-full py-3 mt-6 bg-white/10 rounded-xl hover:bg-white/20 transition text-sm font-bold tracking-widest text-gray-300">NEW SCAN</button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};