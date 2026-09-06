import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'node:path';
import { transcribeAudio } from './transcription';

function createWindow(): void {
  const window = new BrowserWindow({
    width: 640,
    height: 680,
    minWidth: 420,
    minHeight: 560,
    title: 'Notes assistant',
    backgroundColor: '#f6f4ef',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  void window.loadFile(join(__dirname, '../src/index.html'));
}

void app.whenReady().then(() => {
  ipcMain.handle('recording:submit', (_event, audio: unknown, mimeType: unknown) => {
    if (!(audio instanceof ArrayBuffer) || audio.byteLength === 0 ||
        typeof mimeType !== 'string' || !mimeType.startsWith('audio/')) {
      throw new Error('Invalid audio recording.');
    }
    return transcribeAudio(audio, mimeType);
  });
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
