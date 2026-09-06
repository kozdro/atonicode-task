import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'node:path';
import { transcribeAudio } from './transcription';
import { askCodex } from './codex';

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
  ipcMain.handle('agent:ask', async (_event, text: unknown) => {
    if (typeof text !== 'string' || !text.trim()) throw new Error('A transcript is required.');
    try {
      const reply = await askCodex(text);
      if (!reply) throw new Error('Codex returned an empty reply.');
      return reply;
    } catch (error) {
      console.error('Codex request failed:', error);
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        throw new Error('Codex CLI was not found. Set CODEX_BIN to its executable path and restart the app.');
      }
      throw new Error('Codex failed. Check that the CLI is installed and logged in, then try again.');
    }
  });
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
