export interface BasicChat {
	id: string;
	archived: boolean;
	name?: string;
}

export interface UserChat extends BasicChat {
	type: "user" | "bot";

	username?: string;
}

export interface ChannelChat extends BasicChat {
	type: "channel";

	subsribersCount: number;
}

export interface GroupChat extends BasicChat {
	type: "group";

	participantsCount: number;
}

export type Chat = UserChat | ChannelChat | GroupChat;
