import ServerPacket from "../../ServerPacket.js"
import Connection from "../../Connection.js"
import { S2C } from "../Packets.js"

/**
 * A Minecraft protocol client-bound LoginSuccess packet.
 */
export default class LoginSuccessPacket extends ServerPacket {
	public static readonly id = S2C.LoginSuccess

	public constructor(uuid: string, username: string) {
		super(
			Buffer.concat([
				ServerPacket.writeVarInt(LoginSuccessPacket.id),
				ServerPacket.writeUUID(uuid),
				ServerPacket.writeString(username),
				ServerPacket.writeVarInt(0),
			])
		)
	}

	public override send(connection: Connection) {
		connection._setState(Connection.State.PLAY)
		return super.send(connection)
	}
}
