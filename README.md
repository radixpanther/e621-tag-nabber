# e621-tag-nabber

This repo contains two utility scripts targetted at finding the set of tags for a local collection of furry art via the e621 API.

## Setup

Just run `npm install` after pulling this repo.

## makeQueue

`npx ts-node processQueue.ts <directory>`

This script takes a directory as an input, and will recursively scan that directory for all non-hidden files. It will create a file in the root of the project (`queue.json`) which will hold the file name and calculated md5 hash.

## processQueue

`npx ts-node processQueue.ts <directory>`

This script will process the `queue.json` file. It will look for any images on e621 with the same md5 hash as the files in the queue, and will download the associated tags. It will then:

-   Copy the original image to the specified directory (mirroring the original directory structure).
-   Create a file in the specified directory with the same name as the original file, but with a `.txt` extension and comma-separated tags.
