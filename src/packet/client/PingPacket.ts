import {
	TypedClientPacket,
	TypedClientPacketStatic,
} from "../../types/TypedPacket";
import StaticImplements from "../../decorator/StaticImplements.js";
import Server from "../../Server";
import ParsedPacket from "../../ParsedPacket";
import Connection from "../../Connection.js";
import { C2S } from "../Packets.js";

@StaticImplements<TypedClientPacketStatic>()
export default class PingPacket {
	public readonly packet: ParsedPacket;

	public readonly data;

	/**
	 * Create a new PingPacket
	 * @param packet
	 */
	public constructor(packet: import("../../ParsedPacket").default) {
		this.packet = packet;

		this.data = {
			payload: this.packet.getLong()!,
		} as const;
	}

	execute(_conn: Connection, _server: Server): void {
		// pass
	}

	public static readonly id = C2S.Ping;

	public static isThisPacket(
		data: ParsedPacket,
		_conn: Connection
	): TypedClientPacket | null {
		try {
			const p = new this(data);
			return p.packet.id === this.id ? p : null;
		} catch {
			return null;
		}
	}
}
