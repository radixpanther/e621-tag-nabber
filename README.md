# e621-tag-nabber

This repo contains two utility scripts targetted at finding the set of tags for a local collection of furry art via the e621 API.

## Setup

Just run `npm install` after pulling this repo.

## How It Works

-   `makeQueue` will scan a directory for all non-hidden files, and will create a file in the root of the project (`queue.json`) which will hold the file name and calculated md5 hash.
-   `processQueue` will process the `queue.json` file. It will look for any images on e621 with the same md5 hash as the files in the queue, and will download the associated tags. It will then:
    -   Copy the original image to the specified directory (mirroring the original directory structure).
    -   Create a file in the specified directory with the same name as the original file, but with a `.txt` extension and comma-separated tags.

## makeQueue

`npx ts-node makeQueue.ts <directory>`

This script takes a directory as an input, and will recursively scan that directory for all non-hidden files. It will create a file in the root of the project (`queue.json`) which will hold the file name and calculated md5 hash.

## processQueue

`npx ts-node processQueue.ts <directory>`

This script will process the `queue.json` file. It will look for any images on e621 with the same md5 hash as the files in the queue, and will download the associated tags. It will then:

-   Copy the original image to the specified directory (mirroring the original directory structure).
-   Create a file in the specified directory with the same name as the original file, but with a `.txt` extension and comma-separated tags.

## E621 API

This tool uses e621's API which, by default, hides explicit content. If you want to use this tool to download explicit content, you will need to create an account on e621 and enable the "show explicit content" option in your account settings. You will need to provide your username and API key to the tool in order to use it.

Create a file named `.env` in the root of the project with the following contents:

```
API_KEY=<your api key>
API_USERNAME=<your username>
```

To be a good citizen, the script runs at a max speed of 1 request per second.

## TODO

Stuff I would like to see added at some point:

-   [ ] Add ability to target a specific file.
-   [ ] Add an actual CLI interface.
-   [ ] Option to overwite or not overwrite existing files.
-   [ ] Control where to put the tags file (currently it's always in the same directory as the image).
