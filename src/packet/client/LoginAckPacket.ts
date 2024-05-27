import {
	TypedClientPacket,
	TypedClientPacketStatic,
} from "../../types/TypedPacket"
import StaticImplements from "../../decorator/StaticImplements.js"
import Server from "../../Server"
import ParsedPacket from "../../ParsedPacket"
import Connection from "../../Connection.js"
import { C2S } from "../Packets.js"

@StaticImplements<TypedClientPacketStatic>()
export default class LoginAckPacket {
	public readonly packet: ParsedPacket

	public readonly data

	/**
	 * Create a new HandshakePacket
	 * @param packet
	 */
	public constructor(packet: import("../../ParsedPacket").default) {
		this.packet = packet

		this.data = {} as const
	}

	execute(conn: Connection, _server: Server): void {
		conn._setState(Connection.State.CONFIGURATION)
	}

	public static readonly id = C2S.LoginAcknowledge

	public static isThisPacket(
		data: ParsedPacket,
		conn: Connection
	): TypedClientPacket | null {
		if (conn.state !== Connection.State.LOGIN) return null
		try {
			const p = new this(data)
			return p.packet.id === this.id ? p : null
		} catch {
			return null
		}
	}
}
