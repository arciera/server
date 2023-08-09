import * as net from "node:net";
import {TypedPacketStatic} from "../TypedPacket";
import StaticImplements from "../decorator/StaticImplements.js";
import Packet from "../Packet.js";
import Server from "../Server.js";

@StaticImplements<TypedPacketStatic>()
export default class HandshakePacket {
    public readonly packet: Packet;

    public get id(): number {
        return this.packet.data[1]!;
    }

    /**
     * Create a new HandshakePacket
     * @param packet
     */
    public constructor(packet: import("../Packet").default) {
        this.packet = packet;
    }

    public get data() {
        return {
            /**
             * Protocol version
             */
            protocolVersion: Packet.parseVarInt(this.packet.data.subarray(2, 4)),
            /**
             * Server address
             */
            serverAddress: this.packet.data.subarray(5, 5 + this.packet.data[4]!).toString(),
            /**
             * Server port
             */
            serverPort: this.packet.data.readUInt16BE(5 + this.packet.data[4]!),
            /**
             * Next state
             */
            nextState: this.packet.data[this.packet.data.length - 1]!
        } as const;
    }

    execute(_socket: net.Socket, _server: Server): void {}

    public static readonly id = 0x00;

    public static isThisPacket(data: Packet): boolean {
        const p = new this(data);
        try {
            return p.id === this.id && p.data.nextState === 2;
        }
        catch {
            return false;
        }
    }
}
