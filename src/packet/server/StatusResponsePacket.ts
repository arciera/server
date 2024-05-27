import Server from "../../Server.js"
import ServerPacket from "../../ServerPacket.js"
import { S2C } from "../Packets.js"

export default class StatusResponsePacket extends ServerPacket {
	public static readonly id = S2C.StatusResponse

	public constructor(server: Server) {
		super(
			Buffer.concat([
				ServerPacket.writeVarInt(StatusResponsePacket.id),
				ServerPacket.writeString(
					JSON.stringify({
						version: server.config.server.version,
						players: {
							max: server.config.server.maxPlayers,
							online: 2,
							sample: [
								{
									name: "lp721mk",
									id: "c73d1477-a7c9-40c0-a86c-387a95917332",
								},
								{
									name: "km127pl",
									id: "4ab89680-76a0-4e82-b90a-56cff4b38290",
								},
							],
						},
						description: {
							text: server.config.server.motd,
						},
						favicon: server.favicon,
						enforcesSecureChat:
							server.config.server.enforcesSecureChat,
					})
				),
			])
		)
	}
}
