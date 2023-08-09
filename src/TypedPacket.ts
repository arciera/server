import * as net from "node:net";
import Packet from "./Packet";
import Server from "./Server";

export interface TypedPacket {
    readonly packet: Packet;
    get data(): Record<string, any>;
    execute(socket: net.Socket, server: Server): void;
}

export interface TypedPacketStatic {
    new(packet: Packet): TypedPacket;

    readonly id: number;

    isThisPacket(data: Packet): boolean;
}
