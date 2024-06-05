import ServerPacket from "../../../ServerPacket.js";
import { S2C } from "../../Packets.js";

export default class ConfgirationKeepAlive extends ServerPacket {
	public static readonly id = S2C.ConfigurationKeepAlive;

	public constructor() {
		super(
			Buffer.concat([
				ServerPacket.writeVarInt(ConfgirationKeepAlive.id),
				ServerPacket.writeLong(BigInt(Date.now())),
			])
		);
	}
}
