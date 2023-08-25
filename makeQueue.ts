import * as fs from 'fs';
import * as path from 'path';
import { processDirectory } from './src/utils';

if (process.argv.length === 2) {
	console.error('Expected at least one arguments!');
	process.exit(1);
}

const TARGET_DIR = path.resolve(process.argv[2]);
const QUEUE_FILE_PATH = path.resolve('queue.json');

console.log(`Target directory: ${TARGET_DIR}`);

if (!fs.existsSync(TARGET_DIR)) {
	console.log(`Target directory does not exist: ${TARGET_DIR}`);
	process.exit(1);
}

fs.writeFileSync('process.log', '', { encoding: 'utf8', flag: 'w' });

const queue = processDirectory(TARGET_DIR, []);

fs.writeFileSync(QUEUE_FILE_PATH, JSON.stringify({ rootDir: TARGET_DIR, queue }));
