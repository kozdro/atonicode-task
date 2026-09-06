import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { askCodex, notesDirectory } from './codex';

async function main(): Promise<void> {
  const filename = `smoke-${randomUUID()}.md`;
  const token = randomUUID();
  const file = join(notesDirectory, filename);

  try {
    console.log(`Creating notes/${filename} through Codex CLI...`);
    console.log(await askCodex(
      `Create ${filename} containing a shopping list with milk and the reference ${token}.`,
    ));
    const contents = await readFile(file, 'utf8');
    assert.match(contents, /milk/i);
    assert.ok(contents.includes(token), 'Created note must contain the reference');

    console.log('Reading the note in a separate Codex invocation...');
    const reply = await askCodex(`Read ${filename} and return its full contents.`);
    assert.match(reply, /milk/i);
    assert.ok(reply.includes(token), 'Reply must include the reference read from disk');
    console.log(reply);
    console.log('PASS: Codex created a note and read it back in a fresh invocation.');
  } finally {
    await rm(file, { force: true });
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
