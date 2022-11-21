import * as fsPromises from "fs/promises";
import * as fs from "fs";

import { StringSession } from "telegram/sessions";

const SESSION_FILE_NAME = "session.json";

export const loadStringSessionIfAvailable = async (): Promise<StringSession> => {
	if(!fs.existsSync(SESSION_FILE_NAME))
		return new StringSession("");

	try {
		const fileContents = await fsPromises.readFile(SESSION_FILE_NAME);
		const sessionData = JSON.parse(fileContents.toString());

		if(typeof sessionData.sessionKey === "string") {
			return new StringSession(sessionData.sessionKey);
		} else throw new Error("JSON format error. 'sessionKey' does not exist");
	} catch (e) {
		console.log("Failed to read session.json.");
		console.log(e);
		console.log("Loading empty session");

		return new StringSession("");
	}
};

export const saveSessionKey = async (sessionKey: string): Promise<void> => {
	const sessionData = {
		sessionKey
	};

	const sessionDataString = JSON.stringify(sessionData);

	try {
		await fsPromises.writeFile(SESSION_FILE_NAME, sessionDataString);
	} catch (e) {
		console.log("Error on writing session data to file");
		console.log(e);
	}
};
