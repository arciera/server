import {
	TypedClientPacket,
	TypedClientPacketStatic,
} from "../../types/TypedPacket";
import StaticImplements from "../../decorator/StaticImplements.js";
import ParsedPacket from "../../ParsedPacket.js";
import Server from "../../Server";
import Connection from "../../Connection.js";
import { C2S } from "../Packets.js";

@StaticImplements<TypedClientPacketStatic>()
export default class LoginPacket {
	public readonly packet: ParsedPacket;

	public readonly data;

	/**
	 * Create a new HandshakePacket
	 * @param packet
	 */
	public constructor(packet: import("../../ParsedPacket").default) {
		this.packet = packet;

		this.data = {
			username: this.packet.getString()!,
			hasUUID: this.packet.getBoolean()!,
			uuid: this.packet.getUUID()!,
		};
	}

	execute(conn: Connection, _server: Server): void {
		conn._setState(Connection.State.LOGIN);
	}

	public static readonly id = C2S.Login;

	public static isThisPacket(
		data: ParsedPacket,
		conn: Connection
	): TypedClientPacket | null {
		if (conn.state !== Connection.State.LOGIN) return null;
		try {
			const p = new this(data);
			return p.packet.id === this.id &&
				p.data.username !== null &&
				p.data.username.match(/^[.*]?[A-Za-z0-9_]{3,16}$/) !== null
				? p
				: null;
		} catch {
			return null;
		}
	}
}
