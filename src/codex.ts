import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export const notesDirectory = join(__dirname, '../notes');

const instructions = `You are a notes assistant. Your working directory is the app's notes/ folder.
Read, create, and update notes using files in this directory only.
Read existing notes before editing and preserve unrelated content.
Use your file tools to complete the request, then reply briefly in plain text.
Do not implement or change application code.`;

export async function askCodex(request: string): Promise<string> {
  await mkdir(notesDirectory, { recursive: true });

  return new Promise((resolve, reject) => {
    const child = spawn(process.env.CODEX_BIN || 'codex', [
      'exec',
      '--ignore-user-config',
      '--sandbox', 'workspace-write',
      '-c', 'approval_policy="never"',
      '--skip-git-repo-check',
      '--color', 'never',
      '-',
    ], { cwd: notesDirectory, stdio: ['pipe', 'pipe', 'pipe'] });

    let output = '';
    let diagnostics = '';
    child.stdout.setEncoding('utf8').on('data', (chunk: string) => { output += chunk; });
    child.stderr.setEncoding('utf8').on('data', (chunk: string) => { diagnostics += chunk; });
    child.on('error', reject);
    child.stdin.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve(output.trim());
      else reject(new Error(`Codex exited with code ${code}: ${diagnostics.trim()}`));
    });
    child.stdin.end(`${instructions}\n\nUser request:\n${request}\n`);
  });
}
