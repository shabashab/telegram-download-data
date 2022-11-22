import * as readline from "readline/promises";

import { loadStringSessionIfAvailable, saveSessionKey } from "./session-manager";
import { TelegramClient } from "telegram";

import { stdin, stdout } from "process";

if(!process.env.API_ID) {
	throw new Error("API_ID environment variable not found.");
}

if(!process.env.API_HASH) {
	throw new Error("API_HASH environment variable not found.");
}

const API_ID = parseInt(process.env.API_ID);
const API_HASH = process.env.API_HASH;

export const initializeClient = async (): Promise<TelegramClient> => {
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

	return client;
};
