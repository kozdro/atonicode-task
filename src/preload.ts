import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('notesAssistant', {
  sendRecording: (audio: ArrayBuffer, mimeType: string): Promise<void> =>
    ipcRenderer.invoke('recording:submit', audio, mimeType),
});
