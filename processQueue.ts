import * as path from 'path';
import * as fs from 'fs';
import axios from 'axios';
import dotenv from 'dotenv';

import { QueueStucture, mergeE621Tags, writeToProcessLog } from './src/utils';

dotenv.config();

if (!process.env.API_KEY) {
	console.error('Missing API_KEY in environment!');
	process.exit(1);
}

const API_KEY = process.env.API_KEY as string;
const API_USERNAME = process.env.API_USERNAME as string;

if (!API_USERNAME) {
	console.error('Missing API_USERNAME in environment!');
	process.exit(1);
}

if (!API_KEY) {
	console.error('Missing API_PASSWORD in environment!');
	process.exit(1);
}

const OUTPUT_DIR = path.resolve(process.argv[2]);
const QUEUE_FILE_PATH = path.resolve('queue.json');
const MAX_SPEED = 1000;

let timer: NodeJS.Timeout;

async function searchForMd5(md5: string) {
	return axios.get(`https://e621.net/posts.json?tags=md5%3A${md5}`, {
		headers: {
			'User-Agent': 'e621-tag-nabber',
		},
		auth: {
			username: API_USERNAME,
			password: API_KEY,
		},
		responseType: 'json',
	});
}

async function processFileFromQueue() {
	const queueContent = fs.readFileSync(QUEUE_FILE_PATH, { encoding: 'utf8' });

	if (!queueContent) {
		writeToProcessLog('Queue file is empty!');
		process.exit(1);
	}

	const processQueue = JSON.parse(queueContent) as QueueStucture;
	const queue = processQueue.queue;

	// Remove the first item from the queue
	const item = queue.shift();

	if (!item) {
		writeToProcessLog('Queue is empty!');
		clearInterval(timer);
		return;
	}

	try {
		writeToProcessLog(`Processing file: ${item.path}`);

		const md5result = await searchForMd5(item.md5);
		const post = md5result.data.posts[0];
		if (!post) {
			writeToProcessLog(`No data found on e621 for file: ${item.path} with md5: ${item.md5}`);
			// Write the new queue to the file
			writeToProcessLog(`Writing queue to file: ${QUEUE_FILE_PATH}`);
			fs.writeFileSync(QUEUE_FILE_PATH, JSON.stringify(processQueue));
			return;
		}
		const tags = mergeE621Tags(post.tags);
		writeToProcessLog(`Found post: ${post.id} for file: ${item.path}. File has ${tags.length} tags.`);

		const relativeDir = item.path.replace(processQueue.rootDir, '');
		const targetOutputPath = path.join(OUTPUT_DIR, relativeDir);
		const targetOutputDir = path.dirname(targetOutputPath);
		const targetFileName = path.parse(targetOutputPath).name;

		if (!fs.existsSync(targetOutputDir)) {
			writeToProcessLog(`Creating directory: ${targetOutputDir}`);
			fs.mkdirSync(targetOutputDir, { recursive: true });
		}

		//copy file (if it's not already there)
		if (!fs.existsSync(targetOutputPath)) {
			writeToProcessLog(`Copying file: ${item.path} to ${targetOutputPath}`);
			fs.copyFileSync(item.path, targetOutputPath);
		}

		// write tags
		let tagString = tags.join(', ');
		tagString = tagString.replace(/_/g, ' ');
		writeToProcessLog(`Writing tags to file: ${targetFileName}.txt`);
		fs.writeFileSync(`${path.join(targetOutputDir, targetFileName)}.txt`, tagString, {
			encoding: 'utf8',
			flag: 'w',
		});
	} catch (error) {
		writeToProcessLog(`Error processing file: ${item.path}`);
	}

	// Write the new queue to the file
	writeToProcessLog(`Writing queue to file: ${QUEUE_FILE_PATH}`);
	fs.writeFileSync(QUEUE_FILE_PATH, JSON.stringify(processQueue));
}

timer = setInterval(processFileFromQueue, MAX_SPEED);
