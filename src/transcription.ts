export async function transcribeAudio(audio: ArrayBuffer, mimeType: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error('Set OPENAI_API_KEY in the launch environment and restart the app.');

  const form = new FormData();
  form.append('file', new Blob([audio], { type: mimeType }), 'recording.webm');
  form.append('model', 'whisper-1');
  form.append('response_format', 'text');

  let response: Response;
  try {
    response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
  } catch {
    throw new Error('Could not reach OpenAI. Check your connection and try again.');
  }

  if (!response.ok) {
    throw new Error(`Transcription request failed (HTTP ${response.status}). Please try again.`);
  }

  const transcript = await response.text();
  if (!transcript.trim()) throw new Error('No speech recognized. Please record again.');
  return transcript;
}
