import * as fsp from "fs/promises";
import { TelegramClient } from "telegram";

import { Chat } from "./chat";
import { loadChats } from "./load-chats";

export const saveChatsToFile = async (
	chats: Chat[],
	outputPath: string,
	minify: boolean
): Promise<void> => {
	const chatsJsonString = minify ? JSON.stringify(chats) : JSON.stringify(chats, null, "\t");
	await fsp.writeFile(outputPath, chatsJsonString);
};

export const loadAndSaveChatsToFile = async (
	client: TelegramClient, 
	path: string,
	minify: boolean
): Promise<void> => {
	const chats = await loadChats(client);
	await saveChatsToFile(chats, path, minify);
};
