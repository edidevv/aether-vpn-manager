import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Settings, Globe, Minus, X,
  ArrowUp, ArrowDown, Power, CheckCircle2, Volume2, ShieldAlert
} from 'lucide-react';
import { clsx } from 'clsx';
import ParticleBackground from './components/ParticleBackground';
import TrafficGraph from './components/TrafficGraph';
import { sfx } from './utils/SoundEngine';
import { SidebarBtn, Counter } from './components/UIComponents';
import { LoadRing } from './components/LoadRing';
import { ProtonMap } from './components/ProtonMap';
import { ServerDrawer } from './components/ServerDrawer';
import { SettingsView } from './components/SettingsView';
import { detectCity } from './utils/geoData';

const VPN_DIR = '/home/xvxvxv/codes/vpn';

function App() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
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

    window.ipcRenderer.on('vpn:status', (_: any, status: any) => {
        if (status.connected) {
            setConnected(true);
        } else {
            setConnected(false);
            setRealInfo(null);
        }
    });

    scanFiles();

    // Interval Mullvad Check (Heartbeat)
    const hb = setInterval(async () => {
        // Aici apelam handler-ul care lipsea inainte
        const s = await window.ipcRenderer.invoke('vpn:mullvad-check');
        if (s.connected) {
            if (!connected) { setConnected(true); setConnecting(false); }
            setRealInfo(s);
        } else {
            if (connected) {
                // Optional: Auto-disconnect visual daca VPN a picat
            }
        }
    }, 3000);
    return () => clearInterval(hb);
  }, [connected]);

  const scanFiles = async () => {
    const res = await window.ipcRenderer.invoke('vpn:scan-dir', VPN_DIR);
    const enriched = res.map((s:any) => { const geo = detectCity(s.name); return { ...s, prettyCountry: geo.country, prettyCity: geo.city, cityCode: geo.code, load: Math.floor(Math.random()*80)+10 }; });
    setServers(enriched);
    if (enriched.length > 0 && !selectedServer) setSelectedServer(enriched[0]);
  }

  const handleConnect = async () => {
    if (!selectedServer) return;
    sfx.playClick();
    if (connected) {
        setConnecting(true); await window.ipcRenderer.invoke('vpn:disconnect'); setConnecting(false);
    } else {
        setConnecting(true);
        const res = await window.ipcRenderer.invoke('vpn:connect', selectedServer);
        if (!res.success) {
            setErrorMsg('Connection Failed'); setTimeout(() => setErrorMsg(''), 3000);
            setConnecting(false);
        }
    }
  }

  const MemoMap = useMemo(() => (<ProtonMap servers={servers} selectedServerId={selectedServer?.id} onCitySelect={setActiveCityGroup} />), [servers, selectedServer]);

  return (
    <div className="h-screen w-screen bg-[#09090b] text-white overflow-hidden flex flex-col relative font-sans">
      <div className="absolute inset-0 z-0"><ParticleBackground /></div>

      {/* TitleBar */}
      <div className="h-10 flex justify-between items-center px-4 z-50 bg-black/20 backdrop-blur-md border-b border-white/5" style={{WebkitAppRegion: 'drag'} as any}>
         <span className="text-xs font-bold text-gray-500 tracking-[0.2em]"></span>
         <div className="flex items-center gap-2 no-drag" style={{WebkitAppRegion: 'no-drag'} as any}><button onClick={()=>window.ipcRenderer.invoke('app:minimize')} className="p-1 hover:bg-white/10 rounded"><Minus className="w-4 h-4"/></button><button onClick={()=>window.ipcRenderer.invoke('app:close')} className="p-1 hover:bg-red-500/80 rounded"><X className="w-4 h-4"/></button></div>
      </div>

      <div className="flex-1 flex z-10 relative min-h-0">

        {/* SIDEBAR - CURATAT (Fara Apps/Audit) */}
        <div className="w-20 bg-[#18181b]/60 backdrop-blur-2xl border-r border-white/5 flex flex-col items-center py-6 gap-6 z-20">
           <SidebarBtn label="Dashboard" active={view==='dashboard'} onClick={()=>setView('dashboard')} onHover={()=>sfx.playHover()} icon={<Activity/>} />
           <SidebarBtn label="Map" active={view==='map'} onClick={()=>setView('map')} onHover={()=>sfx.playHover()} icon={<Globe/>} />
           <div className="mt-auto"><SidebarBtn label="Settings" active={view==='settings'} onClick={()=>setView('settings')} onHover={()=>sfx.playHover()} icon={<Settings/>} /></div>
        </div>

        <div className="flex-1 flex flex-col relative overflow-hidden">
          <AnimatePresence mode='wait'>

            {/* DASHBOARD */}
            {view === 'dashboard' && (
              <motion.div key="dash" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full flex flex-col p-8">
                <div className="flex justify-between items-start z-20">
                    <div>
                        <div className="flex items-center gap-2 mb-2"><div className={clsx("w-3 h-3 rounded-full animate-pulse", connected ? "bg-emerald-500" : "bg-red-500")}></div><span className={clsx("text-xs font-mono font-bold tracking-wider", connected ? "text-emerald-500" : "text-red-500")}>{connected ? "MULLVAD SECURED" : "UNPROTECTED"}</span></div>
                        {connected && realInfo ? ( <div className="flex flex-col gap-1"><h1 className="text-4xl font-bold">{realInfo.country}</h1><div className="text-gray-400 text-sm flex gap-3"><span>{realInfo.ip}</span><span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Verified</span></div></div> ) : ( <div className="flex flex-col gap-1"><h1 className="text-4xl font-bold">{selectedServer ? selectedServer.prettyCity : 'Select Server'}</h1><span className="text-emerald-400 text-sm">Load: {selectedServer?.load || 0}%</span></div> )}
                    </div>
                    {connected && <div className="flex gap-4"><div className="text-right"><div className="text-xs text-gray-500">DL</div><div className="text-emerald-400 font-mono">{downSpeed.toFixed(1)} KB/s</div></div></div>}
                </div>

                <div className="flex-1 flex flex-col items-center justify-center relative z-20">
                   <button onClick={handleConnect} disabled={!selectedServer} className="group relative outline-none disabled:opacity-50">
                      <div className={clsx("w-48 h-48 rounded-full flex flex-col items-center justify-center backdrop-blur-xl border-4 shadow-2xl transition-all duration-500", connected ? "bg-emerald-500/10 border-emerald-500/50" : "bg-[#18181b]/80 border-white/10 hover:border-purple-500/50")}>
                         <Power className={clsx("w-12 h-12", connected ? "text-emerald-400" : "text-gray-400")} />
                         <span className="mt-2 text-xs font-bold tracking-[0.2em] text-gray-500">{connecting ? '...' : connected ? 'STOP' : 'START'}</span>
                      </div>
                   </button>
                   <div className="w-full max-w-2xl mt-12 h-32"><TrafficGraph downloadSpeed={downSpeed} uploadSpeed={upSpeed} /></div>
                   {errorMsg && <div className="absolute bottom-10 text-red-400 text-xs bg-red-500/10 px-3 py-1 rounded border border-red-500/20">{errorMsg}</div>}
                </div>
              </motion.div>
            )}

            {/* MAP MODE */}
            {view === 'map' && (
                <motion.div key="map" className="h-full w-full relative z-20">
                    {MemoMap}
                    <ServerDrawer isOpen={!!activeCityGroup} onClose={()=>setActiveCityGroup(null)} cityName={activeCityGroup?.name} countryName={activeCityGroup?.country} servers={activeCityGroup?.servers||[]} onSelect={(s:any)=>{setSelectedServer(s); setView('dashboard'); setActiveCityGroup(null);}} currentId={selectedServer?.id}/>
                </motion.div>
            )}

            {/* SETTINGS */}
            {view === 'settings' && (
                <motion.div key="settings" className="h-full z-20">
                    <SettingsView settings={settings} setSettings={setSettings} VPN_DIR={VPN_DIR} appVersion="3.5 Lite" />
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
export default App;
