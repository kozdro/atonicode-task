import { app, BrowserWindow } from 'electron';
import { join } from 'node:path';

function createWindow(): void {
  const window = new BrowserWindow({
    width: 640,
    height: 680,
    minWidth: 420,
    minHeight: 560,
    title: 'Notes assistant',
    backgroundColor: '#f6f4ef',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  void window.loadFile(join(__dirname, '../src/index.html'));
}

void app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
