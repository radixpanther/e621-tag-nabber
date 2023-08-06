import * as fs from 'fs';
import * as path from 'path';
import md5File from 'md5-file';

export type QueueItem = {
	path: string;
	md5: string;
};

export type QueueStucture = {
	rootDir: string;
	queue: QueueItem[];
};

export function processDirectory(dir: string, queue: QueueItem[] = []): QueueItem[] {
	const dirs: string[] = [];
	const files = fs.readdirSync(dir);

	writeToProcessLog(`Processing directory: ${dir}`);

	for (const file of files) {
		const fullPath = path.join(dir, file);
		const stats = fs.statSync(fullPath);

		if (stats.isDirectory()) {
			dirs.push(fullPath);
		} else {
			if (file.startsWith('.')) continue;

			queue.push({
				path: fullPath,
				md5: md5File.sync(fullPath),
			});
		}
	}

	if (dirs.length > 0) {
		for (const dir of dirs) {
			const items = processDirectory(dir, queue);
			// queue = queue.concat(items);
		}
	}

	writeToProcessLog(`Finished processing directory: ${dir}`);

	return queue;
}

export function writeToProcessLog(log: string) {
	// Overwrite existing log file
	console.log(log);
	fs.appendFileSync('process.log', `${log}\n`, { encoding: 'utf8', flag: 'a+' });
}

export function processFile(file: string) {
	writeToProcessLog(`Processing file: "${file}"`);

	const md5 = md5File.sync(file);
	writeToProcessLog(`MD5 hash: ${md5} for file ${file}`);
	return md5;
}

export function mergeE621Tags(tagset: Record<string, string[]>): string[] {
	//remove "artist" tag... This is to prevent
	delete tagset.artist;

	const tags = Object.values(tagset).reduce((acc, cur) => acc.concat(cur), []);
	return [...new Set(tags)];
}
