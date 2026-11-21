import { cpSync, copyFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = resolve(fileURLToPath(new URL('.', import.meta.url)));
const root = resolve(scriptDirectory, '..');
const output = resolve(root, 'dist');
for (const file of ['manifest.json', 'background.js', 'messages.js', 'content.js', 'peek-content.js', 'work-nudge.js', 'peek-logic.js', 'styles.css', 'popup.html', 'popup.js', 'popup.css']) {
  copyFileSync(resolve(root, file), resolve(output, file));
}
mkdirSync(resolve(output, 'assets'), { recursive: true });
cpSync(resolve(root, 'assets'), resolve(output, 'assets'), { recursive: true });
