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

export type E621Tagset = {
	artist: string[];
	character: string[];
	species: string[];
	general: string[];
	invalid: string[];
	meta: string[];
	lore: string[];
	copyright: string[];
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
			processDirectory(dir, queue);
		}
	}

	writeToProcessLog(`Finished processing directory: ${dir}`);

	return queue;
}

export function writeToProcessLog(log: string) {
	console.log(log);
	fs.appendFileSync('process.log', `${log}\n`, { encoding: 'utf8', flag: 'a+' });
}

export function processFile(file: string) {
	writeToProcessLog(`Processing file: "${file}"`);

	const md5 = md5File.sync(file);
	writeToProcessLog(`MD5 hash: ${md5} for file ${file}`);

	return md5;
}

export function mergeE621Tags(tagset: E621Tagset): string[] {
	const tags = [
		...tagset.artist,
		...tagset.copyright,
		...tagset.character,
		...tagset.species,
		...tagset.general,
		...tagset.invalid,
		...tagset.meta,
	];

	return [...new Set(tags)];
}
