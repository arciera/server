import {TypedClientPacket, TypedClientPacketStatic} from "../../types/TypedPacket";
import StaticImplements from "../../decorator/StaticImplements.js";
import Server from "../../Server";
import ParsedPacket from "../../ParsedPacket";
import Connection from "../../Connection.js";

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
            nextState: this.packet.getVarInt()!
        } as const;
    }

    execute(conn: Connection, _server: Server): void {
        conn._setState(Connection.State.LOGIN);
    }

    public static readonly id = 0x00;

    public static isThisPacket(data: ParsedPacket, conn: Connection): TypedClientPacket | null {
        if (conn.state !== Connection.State.NONE) return null;
        try {
            const p = new this(data);
            return (p.packet.id === this.id && p.data.nextState === 2) ? p : null;
        }
        catch {
            return null;
        }
    }
}
