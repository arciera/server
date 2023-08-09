import * as net from "node:net";
import {TypedPacketStatic} from "../TypedPacket";
import StaticImplements from "../decorator/StaticImplements.js";
import Packet from "../Packet.js";
import Server from "../Server";

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

    private get hasUUID() {
        return this.packet.data[3 + this.packet.data[2]!] === 0x01;
    }

    public get data() {
        return {
            /**
             * Player username
             */
            username: this.packet.data.subarray(3, 3 + this.packet.data[2]!).toString(),

            /**
             * Whether player has UUID
             */
            hasUUID: this.hasUUID,

            /**
             * Player UUID
             */
            uuid: this.hasUUID ? this.packet.data.subarray(4 + this.packet.data[2]!, 4 + this.packet.data[2]! + 16).toString("hex") : null
        } as const;
    }

    execute(_socket: net.Socket, _server: Server): void {}

    public static readonly id = 0x00;

    public static isThisPacket(data: Packet): boolean {
        const p = new this(data);
        try {
            return p.id === this.id && p.data.username.match(/^[.*]?[A-Za-z0-9_]{3,16}$/) !== null;
        }
        catch {
            return false;
        }
    }
}
