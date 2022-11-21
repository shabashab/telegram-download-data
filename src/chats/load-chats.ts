import { Api, TelegramClient } from "telegram";
import { Dialog } from "telegram/tl/custom/dialog";
import { BasicChat, ChannelChat, Chat, GroupChat, UserChat } from "./chat";

const createChatFromDialog = (dialog: Dialog): Chat | undefined => {
	try {
		const basicChat: BasicChat = {
			id: dialog.id?.toString() ?? "0",
			name: dialog.name,
			archived: dialog.archived
		};

		if(dialog.isUser) {
			const user = dialog.entity as Api.User;

			const type = user.bot ? "bot" : "user";
			const username = user.username;
			const name = dialog.name;

			const userChat: UserChat = {
				...basicChat,
				type,
				username,
				name
			};

			return userChat;
		}

		if(dialog.isGroup) {
			const group = dialog.entity as Api.Chat;

			const type = "group";
			const participantsCount = group.participantsCount;

			const groupChat: GroupChat = {
				...basicChat,
				type,
				participantsCount
			};

			return groupChat;
		}

		if(dialog.isChannel) {
			const channel = dialog.entity as Api.Channel;

			const type = "channel";
			const subsribersCount = channel.participantsCount ?? 0;

			const channelChat: ChannelChat = {
				...basicChat,
				type,
				subsribersCount
			};

			return channelChat;
		} 
	} catch(e) {
		return undefined;
	}
};

export const loadChats = async (client: TelegramClient) => {
	const chats: Chat[] = [];

	client.iterMessages

	for await (const dialog of client.iterDialogs()) {
		const chat = createChatFromDialog(dialog);

		if(!chat) continue;

		chats.push(chat);
	}

	return chats;
};
