import * as readline from "readline/promises";
import { stdin, stdout } from "process";
import { Api, TelegramClient } from "telegram"
import { loadStringSessionIfAvailable, saveSessionKey } from "./session-manager";
import * as fsp from "fs/promises";
import {loadChats} from "./chats/load-chats";

import * as dotenv from "dotenv";

dotenv.config();

if(!process.env.API_ID) {
	throw new Error("API_ID environment variable not found.");
}

if(!process.env.API_HASH) {
	throw new Error("API_HASH environment variable not found.");
}

const API_ID = parseInt(process.env.API_ID);
const API_HASH = process.env.API_HASH;

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

	const chats = await loadChats(client);

	console.log("Loaded all chats. Writing to file");
	await fsp.writeFile("chats.json", JSON.stringify(chats, null, "\t"));
	console.log("Chats were successfully saved to file");
};

bootstrap();
