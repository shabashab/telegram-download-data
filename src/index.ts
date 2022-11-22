//ALWAYS AT THE START OF THE FILE!!
import * as dotenv from "dotenv";
dotenv.config();

import * as path from "path";

import { loadAndSaveChatsToFile } from "./chats/save-chats";
import { OUTPUT_DIR, prepareOutputDir } from "./output";
import { initializeClient } from "./init-client";

const MINIFY_JSON = (process.env.MINIFY_JSON ?? "true") === "true" ? true : false;

const bootstrap = async () => {
	const client = await initializeClient();

	console.log("Preparing output directory...");
	await prepareOutputDir();

	const chatsOutputPath = path.resolve(OUTPUT_DIR, "chats.json");
	await loadAndSaveChatsToFile(client, chatsOutputPath, MINIFY_JSON);
	console.log("Chats have been successfully saved to " + chatsOutputPath);

	return;
};

bootstrap().then(() => {
	process.exit(0);
});
