import * as net from "node:net";
import {TypedClientPacket, TypedClientPacketStatic} from "../../TypedPacket";
import StaticImplements from "../../decorator/StaticImplements.js";
import Server from "../../Server";
import ParsedPacket from "../../ParsedPacket";

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

    execute(_socket: net.Socket, _server: Server): void {}

    public static readonly id = 0x00;

    public static isThisPacket(data: ParsedPacket): TypedClientPacket | null {
        const p = new this(data);
        try {
            return (p.packet.id === this.id && p.data.nextState === 2) ? p : null;
        }
        catch {
            return null;
        }
    }
}
