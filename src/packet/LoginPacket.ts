import * as net from "node:net";
import {TypedPacketStatic} from "../TypedPacket";
import StaticImplements from "../decorator/StaticImplements.js";
import Packet from "../Packet.js";

@StaticImplements<TypedPacketStatic>()
export default class LoginPacket {
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
     * Get player username
     */
    public get username(): string {
        return this.packet.data.subarray(3, 3 + this.packet.data[2]!).toString();
    }

    /**
     * Whether player has UUID
     */
    public get hasUUID(): boolean {
        return this.packet.data[3 + this.packet.data[2]!] === 0x01;
    }

    /**
     * Get player UUID
     *
     * Encoded as an unsigned 128-bit integer (or two unsigned 64-bit integers: the most significant 64 bits and then the least significant 64 bits)
     */
    public get uuid(): string | null {
        if (!this.hasUUID) return null;
        const uuid = this.packet.data.subarray(4 + this.packet.data[2]!, 4 + this.packet.data[2]! + 16);
        return uuid.toString("hex");
    }

    execute(_socket: net.Socket): void {
        console.log("LoginPacket", this.packet.data, this.username, this.hasUUID, this.uuid);
        // … socket.write();
    }

    public static readonly id = 0x00;

    public static isThisPacket(data: Packet): boolean {
        const p = new this(data);
        return p.id === this.id && p.username.length > 0;
    }
}
