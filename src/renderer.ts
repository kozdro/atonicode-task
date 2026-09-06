interface Window {
  notesAssistant: {
    sendRecording(audio: ArrayBuffer, mimeType: string): Promise<void>;
  };
}

const recordButton = document.querySelector<HTMLButtonElement>('#record-button')!;
const recordingStatus = document.querySelector<HTMLParagraphElement>('#recording-status')!;
const recordingResult = document.querySelector<HTMLParagraphElement>('#recording-result')!;

interface RecordingSession {
  pointerId: number | null;
  stream?: MediaStream;
  recorder?: MediaRecorder;
  failed?: boolean;
}

let activeRecording: RecordingSession | null = null;

function showStatus(message: string, listening = false): void {
  recordingStatus.textContent = message;
  recordButton.textContent = listening ? 'Release to stop' : 'Hold to talk';
  recordButton.classList.toggle('listening', listening);
}

function showError(error: unknown): void {
  const message = error instanceof Error && error.name === 'NotAllowedError'
    ? 'Microphone access denied. Enable Electron in System Settings → Privacy & Security → Microphone, then restart the app.'
    : error instanceof Error ? error.message : 'Could not record audio.';
  showStatus(`Error: ${message}`);
}

function stopRecording(): void {
  if (!activeRecording) return;
  activeRecording.pointerId = null;
  if (activeRecording.recorder?.state === 'recording') {
    showStatus('Finishing recording…');
    activeRecording.recorder.stop();
  }
  activeRecording.stream?.getTracks().forEach((track) => track.stop());
}

recordButton.addEventListener('pointerdown', async (event) => {
  if (event.button !== 0 || !event.isPrimary || activeRecording) return;
  event.preventDefault();
  const recording: RecordingSession = { pointerId: event.pointerId };
  activeRecording = recording;
  recordingResult.textContent = '';

  try {
    recordButton.setPointerCapture(event.pointerId);
    showStatus('Requesting microphone…');
    recording.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Permission may resolve after release or focus loss. Never start a stale hold.
    if (recording.pointerId === null) {
      recording.stream.getTracks().forEach((track) => track.stop());
      activeRecording = null;
      showStatus('Ready');
      return;
    }

    const recorder = new MediaRecorder(recording.stream);
    recording.recorder = recorder;
    const chunks: Blob[] = [];
    recorder.addEventListener('dataavailable', (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    });
    recorder.addEventListener('error', () => {
      recording.failed = true;
      stopRecording();
      showError(new Error('Recording failed. Please try again.'));
    });
    recorder.addEventListener('stop', async () => {
      recording.pointerId = null;
      recording.stream?.getTracks().forEach((track) => track.stop());
      try {
        if (recording.failed) return;
        const audio = new Blob(chunks, { type: recorder.mimeType });
        if (audio.size === 0) throw new Error('No audio captured. Hold the button a little longer.');
        await window.notesAssistant.sendRecording(await audio.arrayBuffer(), audio.type);
        recordingResult.textContent = 'Recording captured. Transcription is not connected yet.';
        showStatus('Ready');
      } catch (error) {
        showError(error);
      } finally {
        activeRecording = null;
      }
    });
    recorder.start();
    showStatus('Listening…', true);
  } catch (error) {
    recording.stream?.getTracks().forEach((track) => track.stop());
    activeRecording = null;
    showError(error);
  }
});

for (const eventName of ['pointerup', 'pointercancel', 'lostpointercapture'] as const) {
  recordButton.addEventListener(eventName, (event) => {
    if (event.pointerId === activeRecording?.pointerId) stopRecording();
  });
}
window.addEventListener('blur', stopRecording);
window.addEventListener('pagehide', stopRecording);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopRecording();
});
