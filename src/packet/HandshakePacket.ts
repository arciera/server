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

    /**
     * Get protocol version
     */
    public get protocolVersion(): number {
        return Packet.parseVarInt(this.packet.data.subarray(2, 4));
    }

    /**
     * Get server address
     */
    public get serverAddress(): string {
        return this.packet.data.subarray(5, 5 + this.packet.data[4]!).toString();
    }

    /**
     * Get server port
     */
    public get serverPort(): number {
        return this.packet.data.readUInt16BE(5 + this.packet.data[4]!);
    }

    /**
     * Get next state
     */
    public get nextState(): number {
        return this.packet.data[this.packet.data.length - 1]!;
    }

    execute(_socket: net.Socket, server: Server): void {
        server.logger.info("HandshakePacket", this.packet.data, this.protocolVersion, this.serverAddress, this.serverPort, this.nextState);
    }

    public static readonly id = 0x00;

    public static isThisPacket(data: Packet): boolean {
        const p = new this(data);
        return p.id === this.id && p.nextState === 2;
    }
}
