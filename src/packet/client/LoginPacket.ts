import {TypedClientPacket, TypedClientPacketStatic} from "../../TypedPacket";
import StaticImplements from "../../decorator/StaticImplements.js";
import ParsedPacket from "../../ParsedPacket.js";
import Server from "../../Server";
import Connection from "../../Connection";

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
            uuid: this.packet.getUUID()!
        }
    }

    execute(_conn: Connection, _server: Server): void {}

    public static readonly id = 0x00;

    public static isThisPacket(data: ParsedPacket): TypedClientPacket | null {
        const p = new this(data);
        try {
            return (p.packet.id === this.id && p.data.username !== null && p.data.username.match(/^[.*]?[A-Za-z0-9_]{3,16}$/) !== null) ? p : null;
        }
        catch {
            return null;
        }
    }
}
