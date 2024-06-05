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
export default class HandshakePacket {
	public readonly packet: ParsedPacket;

	public readonly data;

	/**
	 * Create a new HandshakePacket
	 * @param packet
	 */
	public constructor(packet: import("../../ParsedPacket").default) {
		this.packet = packet;

		this.data = {
			protocolVersion: this.packet.getVarInt()!,
			serverAddress: this.packet.getString()!,
			serverPort: this.packet.getUShort()!,
			nextState: this.packet.getVarInt()!,
		} as const;
	}

	execute(conn: Connection, _server: Server): void {
		switch (this.data.nextState) {
			case 1:
				conn._setState(Connection.State.STATUS);
				break;
			case 2:
				conn._setState(Connection.State.LOGIN);
				break;
		}
	}

	public static readonly id = C2S.Handshake;

	public static isThisPacket(
		data: ParsedPacket,
		conn: Connection
	): TypedClientPacket | null {
		if (conn.state !== Connection.State.NONE) return null;
		try {
			const p = new this(data);
			return p.packet.id === this.id ? p : null;
		} catch {
			return null;
		}
	}
}
