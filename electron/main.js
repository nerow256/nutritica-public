const { app, BrowserWindow, shell } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

let mainWindow;
let nextProcess;
const PORT = 3000;

function waitForServer(port, timeout = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(`http://localhost:${port}`, () => resolve());
      req.on('error', () => {
        if (Date.now() - start > timeout) {
          reject(new Error('Server start timeout'));
        } else {
          setTimeout(check, 500);
        }
      });
    };
    check();
  });
}

function startNextServer(port) {
  const serverPath = path.join(process.resourcesPath, 'standalone', 'server.js');
  nextProcess = spawn('node', [serverPath], {
    env: {
      ...process.env,
      PORT: String(port),
      HOSTNAME: 'localhost',
    },
    cwd: path.join(process.resourcesPath, 'standalone'),
    stdio: 'pipe',
  });

  nextProcess.stdout?.on('data', (d) => console.log(`[Next.js] ${d}`));
  nextProcess.stderr?.on('data', (d) => console.error(`[Next.js] ${d}`));
}

async function createWindow() {
  const isDev = !app.isPackaged;

  mainWindow = new BrowserWindow({
    width: 430,
    height: 900,
    minWidth: 360,
    minHeight: 600,
    icon: path.join(__dirname, '..', 'public', 'icons', 'icon-512.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
    title: 'Nutritica',
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev) {
    try {
      await waitForServer(PORT, 5000);
    } catch {
      console.log('Dev server not running. Start it with: npm run dev');
      app.quit();
      return;
    }
  } else {
    startNextServer(PORT);
    await waitForServer(PORT);
  }

  mainWindow.loadURL(`http://localhost:${PORT}`);

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (nextProcess) nextProcess.kill();
  app.quit();
});

app.on('activate', () => {
  if (!mainWindow) createWindow();
});

app.on('before-quit', () => {
  if (nextProcess) nextProcess.kill();
});
