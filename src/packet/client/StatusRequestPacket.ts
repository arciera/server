import {
	TypedClientPacket,
	TypedClientPacketStatic,
} from "../../types/TypedPacket.js"
import StaticImplements from "../../decorator/StaticImplements.js"
import Server from "../../Server.js"
import ParsedPacket from "../../ParsedPacket.js"
import Connection from "../../Connection.js"
import { C2S } from "../Packets.js"

@StaticImplements<TypedClientPacketStatic>()
export default class StatusRequestPacket {
	public readonly packet: ParsedPacket

	public readonly data

	/**
	 * Create a new StatusRequest
	 * @param packet
	 */
	public constructor(packet: import("../../ParsedPacket.js").default) {
		this.packet = packet

		this.data = {} as const
	}

	execute(_conn: Connection, _server: Server): void {
		// pass
	}

	public static readonly id = C2S.StatusRequest

	public static isThisPacket(
		data: ParsedPacket,
		conn: Connection
	): TypedClientPacket | null {
		if (conn.state !== Connection.State.STATUS) return null
		try {
			const p = new this(data)
			return p.packet.id === this.id ? p : null
		} catch {
			return null
		}
	}
}
