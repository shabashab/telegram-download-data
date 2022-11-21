import { TelegramClient, Api } from "telegram";
import { getInputPeer } from "telegram/Utils";
import { Chat } from "./chat";

const CHUNK_SIZE = 100;

const createChatFromDialog = (dialog: Api.TypeDialog, users: Api.TypeUser[], chats: Api.TypeChat[]): Chat | undefined => {
	if(dialog.className !== "Dialog") {
		return;
	}

	if(dialog.peer.className === "PeerUser") {
		const userPeer = (dialog.peer as Api.PeerUser);
		const user = users.find(value => {
			if(value.className === "UserEmpty")
				return false;

			const existingUser = (value as Api.User);

			return existingUser.id.toString() === userPeer.userId.toString();
		});


		if(!user) return undefined;

		return {
			id: user.id.toString(),
			type: "dialog",
			topMessage: dialog.topMessage,
			source: user as Api.User
		};
	}

	if(dialog.peer.className == "PeerChat") {
		const chatPeer = (dialog.peer as Api.PeerChat);
		const chat = chats.find(value => { 
			if(value.className !== "Chat")
				return false;

			const existingChat = (value as Api.Chat);
			return existingChat.id.toString() === chatPeer.chatId.toString();
		});

		if(!chat) return undefined;

		return {
			id: chat.id.toString(),
			type: "chat",
			topMessage: dialog.topMessage,
			source: chat as Api.Chat
		};
	}

	if(dialog.peer.className == "PeerChannel") {
		const channelPeer = (dialog.peer as Api.PeerChannel);
		const channel = chats.find(value => {
			if(value.className !== "Channel")
				return false;

			const existingChannel = (value as Api.Channel);
			return existingChannel.id.toString() === channelPeer.channelId.toString();
		});

		if(!channel) return undefined;

		return {
			id: channel.id.toString(),
			type: "channel",
			topMessage: dialog.topMessage,
			source: channel as Api.Channel
		};
	}

	return undefined;
};

const loadChatsChunk = async (client: TelegramClient, offset: number, offsetPeer: Api.TypeInputPeer): Promise<Chat[]> => {
	const dialogsData: Api.messages.DialogsSlice = await client.invoke(
		new Api.messages.GetDialogs({
			offsetDate: 0,
			offsetId: offset,
			offsetPeer: offsetPeer,
			limit: CHUNK_SIZE,
			hash: BigInt("-4156887774564") as any,
			excludePinned: false,
			folderId: 0,
		})
	) as any;

	if(dialogsData.count === 0)
		return [];

	const dialogs = dialogsData.dialogs;
	const users = dialogsData.users;
	const chats = dialogsData.chats;

	const resultChats: Chat[] = [];

	for(const dialog of dialogs) {
		const chat = createChatFromDialog(dialog, users, chats);

		if(!chat)
			continue;

		//console.log("Added new chat", {chat});
		resultChats.push(chat);
	}

	return resultChats;
};

export const loadChats = async (client: TelegramClient) => {
	const chats: Chat[] = [];

	let newChats;
	let offset = 0;
	let offsetPeer: Api.TypeInputPeer = new Api.InputPeerEmpty();

	while((newChats = await loadChatsChunk(
					client, 
					offset,
					offsetPeer
				)).length > 0) {
		console.log(`Loaded ${newChats.length} new chats.`);

		chats.push(...newChats);

		const lastChat = chats[chats.length - 1];

		offset = lastChat.topMessage;
		offsetPeer = getInputPeer(lastChat.source);
	}

	return chats;
};
