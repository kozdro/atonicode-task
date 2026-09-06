import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('notesAssistant', {
  sendRecording: async (audio: ArrayBuffer, mimeType: string): Promise<string> => {
    try {
      return await ipcRenderer.invoke('recording:submit', audio, mimeType);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Transcription failed. Please try again.';
      throw new Error(message.replace(/^Error invoking remote method 'recording:submit': Error: /, ''));
    }
  },
  askAgent: async (text: string): Promise<string> => {
    try {
      return await ipcRenderer.invoke('agent:ask', text);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Codex failed. Please try again.';
      throw new Error(message.replace(/^Error invoking remote method 'agent:ask': Error: /, ''));
    }
  },
});
