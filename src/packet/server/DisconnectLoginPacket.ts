import ServerPacket from "../../ServerPacket.js";
import { S2C } from "../Packets.js";

export default class DisconnectLoginPacket extends ServerPacket {
	public static readonly id = S2C.DisconnectLogin;

	public constructor(reason: ChatComponent) {
		super(
			Buffer.concat([
				ServerPacket.writeVarInt(DisconnectLoginPacket.id),
				ServerPacket.writeChat(reason),
			])
		);
	}
}
