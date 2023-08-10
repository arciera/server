import * as net from "node:net";
import Server from "./Server";
import ParsedPacket from "./ParsedPacket";

export interface TypedClientPacket {
    readonly packet: ParsedPacket;
    readonly data: Record<string, any>;
    execute(socket: net.Socket, server: Server): void;
}

export interface TypedClientPacketStatic {
    new(packet: ParsedPacket): TypedClientPacket;

    readonly id: number;

    isThisPacket(data: ParsedPacket): TypedClientPacket | null;
}
