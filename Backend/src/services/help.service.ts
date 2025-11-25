import fs from 'fs';
import path from 'path';

const DEFAULT_HELP_FILE = process.env.HELP_FILE
  ? path.resolve(process.cwd(), process.env.HELP_FILE)
  : path.resolve(__dirname, '../../lib/help.txt');

export const showHelpOnRoot = process.env.SHOW_HELP_ON_ROOT !== 'false';

let cachedHelpContent: string | null = null;
let cachedMtime = 0;

export function getHelpContent(): string {
  try {
    const stats = fs.statSync(DEFAULT_HELP_FILE);
    if (cachedHelpContent !== null && stats.mtimeMs === cachedMtime) {
      return cachedHelpContent;
    }

    cachedHelpContent = fs.readFileSync(DEFAULT_HELP_FILE, 'utf-8');
    cachedMtime = stats.mtimeMs;
    return cachedHelpContent;
  } catch (error) {
    const fallback = `CorsBridge • syrins.tech\n\nUnable to load help file at ${DEFAULT_HELP_FILE}.\nReason: ${
      error instanceof Error ? error.message : 'Unknown'
    }`;
    cachedHelpContent = fallback;
    cachedMtime = Date.now();
    return fallback;
  }
}
