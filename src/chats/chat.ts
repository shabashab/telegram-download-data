import {Api} from "telegram";


export interface Chat {
	id: string;
	type: "dialog" | "channel" | "chat";
	topMessage: number;
	source: Api.Chat | Api.User | Api.Channel;
}
