import React from 'react';
import { Settings, Volume2, Power, ShieldAlert, Info } from 'lucide-react';
import { clsx } from 'clsx';

const SettingToggle = ({ label, desc, active, onClick, icon }: any) => (
    <div onClick={onClick} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition group">
        <div className="flex items-center gap-3">
            <div className={clsx("p-2 rounded-lg transition-colors", active ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-700/30 text-gray-400")}>
                {icon}
            </div>
            <div>
                <div className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">{label}</div>
                <div className="text-xs text-gray-500">{desc}</div>
            </div>
        </div>

        {/* Switch Visual */}
        <div className={clsx("w-11 h-6 rounded-full relative transition-colors duration-300 ease-in-out", active ? "bg-emerald-500" : "bg-gray-700")}>
            <div className={clsx("absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-md", active ? "left-6" : "left-1")} />
        </div>
    </div>
);

export const SettingsView = ({ settings, setSettings, appVersion, configDir }: any) => {

    const toggle = (key: string) => {
        setSettings((prev: any) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="p-8 h-full flex flex-col z-20 overflow-y-auto custom-scrollbar">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Settings className="w-6 h-6 text-purple-400"/>
                    Preferences
                </h2>
                <p className="text-gray-500 text-sm mt-1">Customize your security environment.</p>
            </div>

            <div className="space-y-4">
                <SettingToggle
                    label="Sound Effects"
                    desc="Enable UI feedback sounds (Sci-Fi)."
                    active={settings.sound}
                    onClick={() => toggle('sound')}
                    icon={<Volume2 className="w-5 h-5"/>}
                />

                <SettingToggle
                    label="Auto-Connect"
                    desc="Connect to last known server on startup."
                    active={settings.autoConnect}
                    onClick={() => toggle('autoConnect')}
                    icon={<Power className="w-5 h-5"/>}
                />

                <SettingToggle
                    label="Kill Switch"
                    desc="Block all traffic if VPN connection drops."
                    active={settings.killSwitch}
                    onClick={() => toggle('killSwitch')}
                    icon={<ShieldAlert className="w-5 h-5"/>}
                />

                 <div className="p-5 bg-black/20 border border-white/5 rounded-xl mt-8">
                     <h3 className="font-bold text-gray-300 mb-4 flex items-center gap-2">
                        <Info className="w-4 h-4 text-purple-400"/> System Diagnostics
                     </h3>

                     <div className="space-y-3">
                         <div className="flex justify-between items-center text-xs">
                             <span className="text-gray-500">Configuration Path</span>
                             <span className="text-gray-300 font-mono bg-white/5 px-2 py-1 rounded max-w-[200px] truncate" title={configDir}>{configDir}</span>
                         </div>
                         <div className="flex justify-between items-center text-xs">
                             <span className="text-gray-500">Backend Engine</span>
                             <span className="text-emerald-400 font-mono">NMCLI + Electron</span>
                         </div>
                         <div className="flex justify-between items-center text-xs">
                             <span className="text-gray-500">App Version</span>
                             <span className="text-white font-mono">{appVersion}</span>
                         </div>
                     </div>
                 </div>
            </div>
        </div>
    );
};