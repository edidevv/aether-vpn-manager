import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Settings, Globe, Minus, X, Power, CheckCircle2, Volume2, ShieldAlert } from 'lucide-react';
import { clsx } from 'clsx';
import ParticleBackground from './components/ParticleBackground';
import TrafficGraph from './components/TrafficGraph';
import { sfx } from './utils/SoundEngine';
import { SidebarBtn } from './components/UIComponents';
import { LoadRing } from './components/LoadRing';
import { ProtonMap } from './components/ProtonMap';
import { ServerDrawer } from './components/ServerDrawer';
import { SettingsView } from './components/SettingsView';
import { detectCity } from './utils/geoData';

const VPN_DIR = '/home/xvxvxv/codes/vpn';

function App() {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [view, setView] = useState('dashboard');
  const [servers, setServers] = useState<any[]>([]);
  const [selectedServer, setSelectedServer] = useState<any>(null);
  const [downSpeed, setDownSpeed] = useState(0);
  const [upSpeed, setUpSpeed] = useState(0);
  const [realInfo, setRealInfo] = useState<any>(null);
  const [activeCityGroup, setActiveCityGroup] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [settings, setSettings] = useState(() => {
      const s = localStorage.getItem('vpn_settings');
      return s ? JSON.parse(s) : { autoConnect: false, killSwitch: true, sound: true };
  });

  useEffect(() => { localStorage.setItem('vpn_settings', JSON.stringify(settings)); sfx.setEnabled(settings.sound); }, [settings]);

  useEffect(() => {
    window.ipcRenderer.on('stats:update', (_: any, data: any) => { setDownSpeed(data.down/1024); setUpSpeed(data.up/1024); });

    window.ipcRenderer.on('vpn:status', (_: any, st: any) => {
        if (st.connected) {
            setStatus('connected');
        } else {
            setStatus('disconnected');
            setRealInfo(null);
        }
    });

    scanFiles();

    // Heartbeat
    const hb = setInterval(async () => {
        const s = await window.ipcRenderer.invoke('vpn:mullvad-check');
        if (s.connected) {
            if (status !== 'connected') { setStatus('connected'); }
            setRealInfo(s);
        } else {
            if (status === 'connected') {
                // Daca eram conectati si a picat Mullvad
                // setStatus('disconnected');
            }
        }
    }, 3000);
    return () => clearInterval(hb);
  }, [status]);

  const scanFiles = async () => {
    const res = await window.ipcRenderer.invoke('vpn:scan-dir', VPN_DIR);
    const enriched = res.map((s:any) => { const geo = detectCity(s.name); return { ...s, prettyCountry: geo.country, prettyCity: geo.city, cityCode: geo.code, load: Math.floor(Math.random()*80)+10 }; });
    setServers(enriched);
    if (enriched.length > 0 && !selectedServer) setSelectedServer(enriched[0]);
  }

  const handleConnect = async () => {
    if (!selectedServer) return;
    sfx.playClick();

    if (status === 'connected') {
        setStatus('disconnected'); // Visual instant
        await window.ipcRenderer.invoke('vpn:disconnect');
        sfx.playDisconnect();
    } else {
        setStatus('connecting'); // Visual Yellow
        sfx.playConnect();

        const res = await window.ipcRenderer.invoke('vpn:connect', selectedServer);
        if (!res.success) {
            setErrorMsg('Connection Failed'); setTimeout(() => setErrorMsg(''), 3000);
            setStatus('disconnected');
        }
        // Daca e success, asteptam confirmarea de la Mullvad sau Traffic Monitor
    }
  }

  const MemoMap = useMemo(() => (<ProtonMap servers={servers} selectedServerId={selectedServer?.id} onCitySelect={setActiveCityGroup} />), [servers, selectedServer]);

  // STYLING LOGIC - GLOWS & COLORS
  const getMainColor = () => {
      if (status === 'connected') return 'text-emerald-400';
      if (status === 'connecting') return 'text-yellow-400';
      return 'text-gray-400';
  };

  const getButtonStyles = () => {
      if (status === 'connected') return "bg-emerald-500/10 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.4)]";
      if (status === 'connecting') return "bg-yellow-500/10 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.4)] animate-pulse";
      return "bg-[#18181b]/80 border-white/10 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]";
  };

  return (
    <div className="h-screen w-screen bg-[#09090b] text-white overflow-hidden flex flex-col relative font-sans">
      <div className="absolute inset-0 z-0"><ParticleBackground /></div>

      <div className="h-10 flex justify-between items-center px-4 z-50 bg-black/20 backdrop-blur-md border-b border-white/5" style={{WebkitAppRegion: 'drag'} as any}>
         <span className="text-xs font-bold text-gray-500 tracking-[0.2em]">AETHER PRO</span>
         <div className="flex items-center gap-2 no-drag" style={{WebkitAppRegion: 'no-drag'} as any}><button onClick={()=>window.ipcRenderer.invoke('app:minimize')} className="p-1 hover:bg-white/10 rounded"><Minus className="w-4 h-4"/></button><button onClick={()=>window.ipcRenderer.invoke('app:close')} className="p-1 hover:bg-red-500/80 rounded"><X className="w-4 h-4"/></button></div>
      </div>

      <div className="flex-1 flex z-10 relative min-h-0">
        <div className="w-20 bg-[#18181b]/60 backdrop-blur-2xl border-r border-white/5 flex flex-col items-center py-6 gap-6 z-20">
           <SidebarBtn label="Dashboard" active={view==='dashboard'} onClick={()=>setView('dashboard')} onHover={()=>sfx.playHover()} icon={<Activity/>} />
           <SidebarBtn label="Map" active={view==='map'} onClick={()=>setView('map')} onHover={()=>sfx.playHover()} icon={<Globe/>} />
           <div className="mt-auto"><SidebarBtn label="Settings" active={view==='settings'} onClick={()=>setView('settings')} onHover={()=>sfx.playHover()} icon={<Settings/>} /></div>
        </div>

        <div className="flex-1 flex flex-col relative overflow-hidden">
          <AnimatePresence mode='wait'>

            {view === 'dashboard' && (
              <motion.div key="dash" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full flex flex-col p-8">
                <div className="flex justify-between items-start z-20">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className={clsx("w-3 h-3 rounded-full transition-colors duration-500", status === 'connected' ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : status === 'connecting' ? "bg-yellow-500 shadow-[0_0_10px_#eab308]" : "bg-red-500 shadow-[0_0_10px_#ef4444]")}></div>
                            <span className={clsx("text-xs font-mono font-bold tracking-wider transition-colors duration-500", status === 'connected' ? "text-emerald-500" : status === 'connecting' ? "text-yellow-500" : "text-red-500")}>
                                {status === 'connected' ? "MULLVAD SECURED" : status === 'connecting' ? "NEGOTIATING..." : "UNPROTECTED"}
                            </span>
                        </div>
                        {status === 'connected' && realInfo ? (
                            <div className="flex flex-col gap-1">
                                <h1 className="text-4xl font-bold text-white">{realInfo.country}</h1>
                                <div className="text-gray-400 text-sm flex gap-3"><span>{realInfo.ip}</span><span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Verified</span></div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1">
                                <h1 className="text-4xl font-bold">{selectedServer ? selectedServer.prettyCity : 'Select Server'}</h1>
                                {selectedServer && <div className="flex gap-4 mt-2 text-gray-400 text-sm"><span>{selectedServer.prettyCountry}</span><span className="text-emerald-400">Load: {selectedServer.load}%</span></div>}
                            </div>
                        )}
                    </div>
                    {status === 'connected' && <div className="flex gap-4"><div className="text-right"><div className="text-xs text-gray-500">DL</div><div className="text-emerald-400 font-mono">{downSpeed.toFixed(1)} KB/s</div></div></div>}
                </div>

                <div className="flex-1 flex flex-col items-center justify-center relative z-20">
                   {/* Background Glow Ring */}
                   <motion.div
                        animate={{
                            opacity: status === 'connected' ? 0.2 : status === 'connecting' ? 0.3 : 0.1,
                            backgroundColor: status === 'connected' ? '#10b981' : status === 'connecting' ? '#eab308' : '#8b5cf6',
                            scale: status === 'connecting' ? [1, 1.2, 1] : 1
                        }}
                        transition={{ duration: 2, repeat: status === 'connecting' ? Infinity : 0 }}
                        className="absolute w-[500px] h-[500px] rounded-full blur-[100px]"
                   />

                   <button onClick={handleConnect} disabled={!selectedServer} className="group relative outline-none disabled:opacity-50">
                      <div className={clsx("w-48 h-48 rounded-full flex flex-col items-center justify-center backdrop-blur-xl border-4 transition-all duration-500", getButtonStyles())}>
                         <Power className={clsx("w-12 h-12 transition-colors duration-500", getMainColor())} />
                         <span className="mt-2 text-xs font-bold tracking-[0.2em] text-gray-500">
                             {status === 'connected' ? 'DISCONNECT' : status === 'connecting' ? 'INIT...' : 'CONNECT'}
                         </span>
                      </div>
                   </button>

                   <div className="w-full max-w-2xl mt-12 h-32 relative">
                        {status === 'connected' ? (
                            <TrafficGraph downloadSpeed={downSpeed} uploadSpeed={upSpeed} />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center border border-dashed border-white/10 rounded-xl bg-white/5 text-gray-600 text-sm">
                                <div className="flex items-center gap-2"><Power className="w-4 h-4"/> Traffic monitoring standby</div>
                            </div>
                        )}
                   </div>

                   {errorMsg && <div className="absolute bottom-10 text-red-400 text-xs bg-red-500/10 px-3 py-1 rounded border border-red-500/20">{errorMsg}</div>}
                </div>
              </motion.div>
            )}

            {view === 'map' && (
                <motion.div key="map" className="h-full w-full relative z-20">
                    {MemoMap}
                    <ServerDrawer isOpen={!!activeCityGroup} onClose={()=>setActiveCityGroup(null)} cityName={activeCityGroup?.name} countryName={activeCityGroup?.country} servers={activeCityGroup?.servers||[]} onSelect={(s:any)=>{setSelectedServer(s); setView('dashboard'); setActiveCityGroup(null);}} currentId={selectedServer?.id}/>
                </motion.div>
            )}

            {view === 'settings' && (
                <motion.div key="settings" className="h-full z-20">
                    <SettingsView settings={settings} setSettings={setSettings} VPN_DIR={VPN_DIR} appVersion="3.6 Neon" />
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
export default App;