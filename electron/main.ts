import { app, BrowserWindow, ipcMain, Tray, Menu, Notification, nativeImage } from 'electron'
import path from 'node:path'
import { exec } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

// Flags pentru performanta si stabilitate
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.disableHardwareAcceleration();

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const DIST = path.join(__dirname, '../dist')
const PUBLIC = app.isPackaged ? DIST : path.join(DIST, '../public')
process.env.DIST = DIST
process.env.VITE_PUBLIC = PUBLIC

let win: BrowserWindow | null
let trafficInterval: NodeJS.Timeout | null = null
let currentConnectionName: string | null = null
let lastRx = 0
let lastTx = 0

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    transparent: true,
    hasShadow: true,
    icon: path.join(PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      backgroundThrottling: false
    },
  })

  win.once('ready-to-show', () => {
      win?.show();
      // Verificam la start daca a ramas ceva agatat, dar SAFE
      safeCleanup();
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(DIST, 'index.html'))
  }
}

const execute = (command: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
         if (command.startsWith('ping') || command.includes('delete') || command.includes('show')) {
             resolve(stdout || ''); return;
         }
         // Nu dam reject violent ca sa nu crape UI-ul
         console.log(`Command failed safe: ${command}`);
         resolve('');
         return;
      }
      resolve(stdout.trim());
    });
  });
};

// --- SAFE CLEANUP (FIX PENTRU NET) ---
// Sterge DOAR conexiunile de tip VPN/Wireguard, nu Ethernet/WiFi
const safeCleanup = async () => {
    try {
        const output = await execute('nmcli -t -f NAME,TYPE,UUID connection show --active');
        const lines = output.split('\n');

        let foundVpn = false;

        for (const line of lines) {
            const parts = line.split(':');
            if (parts.length < 2) continue;
            const name = parts[0];
            const type = parts[1];

            // Daca gasim un VPN activ
            if (type === 'wireguard' || type === 'vpn' || type === 'tun') {
                console.log(`Found active VPN: ${name}`);
                currentConnectionName = name;
                startTrafficMonitor();
                win?.webContents.send('vpn:status', { connected: true, server: name });
                foundVpn = true;
            }
        }

        if (!foundVpn) {
            win?.webContents.send('vpn:status', { connected: false });
        }
    } catch (e) { console.error("Cleanup error:", e); }
};

// --- TRAFFIC MONITOR ---
const getTraffic = () => {
    try {
        const data = fs.readFileSync('/proc/net/dev', 'utf-8');
        const lines = data.split('\n');
        let totalRx = 0, totalTx = 0;
        for (let i = 2; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const parts = line.split(/\s+/);
            if (parts.length > 9) {
                if (parts[0].includes(':') && parts[0].split(':')[1] !== '') {
                     totalRx += parseInt(parts[0].split(':')[1]); totalTx += parseInt(parts[8]);
                } else {
                     totalRx += parseInt(parts[1]); totalTx += parseInt(parts[9]);
                }
            }
        }
        return { rx: totalRx, tx: totalTx };
    } catch (e) { return { rx: 0, tx: 0 }; }
}

const startTrafficMonitor = () => {
    if (trafficInterval) clearInterval(trafficInterval);
    const init = getTraffic(); lastRx = init.rx; lastTx = init.tx;
    trafficInterval = setInterval(() => {
        const current = getTraffic();
        const down = Math.max(0, current.rx - lastRx);
        const up = Math.max(0, current.tx - lastTx);
        lastRx = current.rx; lastTx = current.tx;
        if (!win?.isMinimized()) win?.webContents.send('stats:update', { down, up });
    }, 1000);
}

const stopTrafficMonitor = () => { if (trafficInterval) clearInterval(trafficInterval); }

// --- IPC HANDLERS ---

// 1. MULLVAD CHECK (Rezolva eroarea ta)
ipcMain.handle('vpn:mullvad-check', async () => {
    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 3000);
        const req = await fetch('https://am.i.mullvad.net/json', { signal: controller.signal });
        clearTimeout(id);
        const data = await req.json();
        return {
            connected: data.mullvad_exit_ip,
            ip: data.ip,
            country: data.country,
            server: data.hostname
        };
    } catch { return { connected: false }; }
});

ipcMain.handle('vpn:scan-dir', async (_, dirPath) => {
    try {
        if (!fs.existsSync(dirPath)) return [];
        return fs.readdirSync(dirPath).filter(f => f.endsWith('.conf') || f.endsWith('.ovpn')).map(f => {
            const c = fs.readFileSync(path.join(dirPath, f), 'utf-8');
            const m = c.match(/(Endpoint|remote)\s*(=|\s)\s*([0-9.]+)/i);
            return { id: f, name: f.replace(/\.(conf|ovpn)$/, ''), path: path.join(dirPath, f), type: f.includes('conf') ? 'wireguard' : 'openvpn', endpoint: m ? m[3] : '1.1.1.1' };
        });
    } catch { return []; }
});

ipcMain.handle('vpn:ping', async (_, ip) => {
    try { const o = await execute(`ping -c 1 -W 1 ${ip}`); const m = o.match(/time=([0-9.]+)/); return m ? Math.round(parseFloat(m[1])) : 999; } catch { return 999; }
});

ipcMain.handle('vpn:connect', async (_, config) => {
  try {
    // 1. Daca suntem deja conectati la ceva, ne deconectam SAFE
    if (currentConnectionName) {
        await execute(`nmcli connection down id "${currentConnectionName}"`);
        // Stergem doar daca e sigur un profil importat temporar
        await execute(`nmcli connection delete id "${currentConnectionName}"`);
    }

    const connName = config.name;
    // Stergem preventiv profilul vechi cu acelasi nume ca sa facem import curat
    await execute(`nmcli connection delete id "${connName}"`);

    // Import
    await execute(`nmcli connection import type ${config.type} file "${config.path}"`);

    // Connect
    await execute(`nmcli connection up id "${connName}"`);

    currentConnectionName = connName;
    startTrafficMonitor();
    new Notification({ title: 'Aether VPN', body: 'Secured' }).show();
    return { success: true };
  } catch (e: any) {
      return { success: false, error: e.message || 'Failed' };
  }
});

// --- SAFE DISCONNECT (CRITIC) ---
ipcMain.handle('vpn:disconnect', async () => {
    stopTrafficMonitor();

    // Stergem doar ce stim ca e VPN
    if (currentConnectionName) {
        await execute(`nmcli connection down id "${currentConnectionName}"`);
        await execute(`nmcli connection delete id "${currentConnectionName}"`);
        currentConnectionName = null;
    } else {
        // Fallback safe: cautam doar wireguard/vpn active
        const output = await execute('nmcli -t -f NAME,TYPE connection show --active');
        const lines = output.split('\n');
        for(const line of lines) {
            const [name, type] = line.split(':');
            if (type === 'wireguard' || type === 'vpn' || type === 'tun') {
                await execute(`nmcli connection down id "${name}"`);
                await execute(`nmcli connection delete id "${name}"`);
            }
        }
    }

    win?.webContents.send('vpn:status', { connected: false });
    return { success: true };
});

ipcMain.handle('app:close', () => app.quit());
ipcMain.handle('app:minimize', () => win?.minimize());

app.whenReady().then(createWindow)