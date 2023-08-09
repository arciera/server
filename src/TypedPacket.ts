import * as net from "node:net";
import Packet from "./Packet";

export interface TypedPacket {
    readonly packet: Packet;

    execute(socket: net.Socket): void;
}

export interface TypedPacketStatic {
    new(packet: Packet): TypedPacket;

    readonly id: number;

    isThisPacket(data: Packet): boolean;
}
