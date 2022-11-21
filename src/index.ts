//ALWAYS AT THE START OF THE FILE!!
import * as dotenv from "dotenv";
dotenv.config();

import * as path from "path";
import * as readline from "readline/promises";
import { stdin, stdout } from "process";
import { TelegramClient } from "telegram"
import { loadStringSessionIfAvailable, saveSessionKey } from "./session-manager";
import { loadAndSaveChatsToFile } from "./chats/save-chats";
import { OUTPUT_DIR, prepareOutputDir } from "./output";



if(!process.env.API_ID) {
	throw new Error("API_ID environment variable not found.");
}

if(!process.env.API_HASH) {
	throw new Error("API_HASH environment variable not found.");
}

const API_ID = parseInt(process.env.API_ID);
const API_HASH = process.env.API_HASH;
const MINIFY_JSON = (process.env.MINIFY_JSON ?? "true") === "true" ? true : false;

const bootstrap = async () => {
	const session = await loadStringSessionIfAvailable();

	const client = new TelegramClient(session, API_ID, API_HASH, {
		connectionRetries: 5
	});

	const inputInterface = readline.createInterface({ input: stdin, output: stdout });

	await client.start({
		phoneNumber: async () => await inputInterface.question("Enter your phone number: "),
		password: async () => await inputInterface.question("Enter your password: "),
		phoneCode: async () => await inputInterface.question("Enter the code you received:"),
		onError: (err) => console.error(err),
	});

	console.log("You are connected now!");

	const sessionKey = (client.session.save() as unknown) as string;
	await saveSessionKey(sessionKey);

	console.log("Preparing output directory...");
	await prepareOutputDir();

	console.log("Loading chats...");
	const chatsOutputPath = path.resolve(OUTPUT_DIR, "chats.json");
	await loadAndSaveChatsToFile(client, chatsOutputPath, MINIFY_JSON);
	console.log("Chats have been successfully saved");
};

bootstrap();
