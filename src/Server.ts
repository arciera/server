import * as net from "node:net";
import EventEmitter from "node:events";
import path from "node:path";
import Packet from "./Packet.js";
import Config from "./Config.js";
import Logger from "./Logger.js";
import {TypedPacket} from "./TypedPacket";
import TypedEventEmitter from "./TypedEventEmitter";

type ServerEvents = {
    /**
     * Server is ready to accept connections
     * @param port Port the server is listening on
     */
    listening: (port: Number) => void;

    /**
     * Unknown packet received
     * @param packet Packet that was received
     * @param socket Socket the packet was received from
     */
    unknownPacket: (packet: Packet, socket: net.Socket) => void;

    /**
     * Known packet received
     * @param packet Packet that was received
     * @param socket Socket the packet was received from
     */
    packet: (packet: TypedPacket, socket: net.Socket) => void;

    /**
     * New connection established
     * @param socket Socket the connection was established on
     */
    connection: (socket: net.Socket) => void;
};

export default class Server extends (EventEmitter as new () => TypedEventEmitter<ServerEvents>) {
    private readonly server = net.createServer();
    private currentPacketFragment: Packet = new Packet();
    public readonly logger: Logger;

    public static readonly path: string = path.dirname(path.join(new URL(import.meta.url).pathname, ".."));
    public readonly config: Config;

    public constructor(config: Config) {
        super();
        this.config = Object.freeze(config);
        this.logger = new Logger("Server", this.config);
    }

    public start() {
        this.server.listen(this.config.port, () => this.emit("listening", this.config.port));
        this.server.on("connection", this.onConnection.bind(this));
    }

    private incomingPacketFragment(socket: net.Socket, data: number) {
        if (this.currentPacketFragment.push(data)) {
            const p = this.currentPacketFragment.getTyped();
            if (p) {
                this.emit("packet", p, socket);
                p.execute(socket, this);
            }
            else this.emit("unknownPacket", this.currentPacketFragment, socket);
            this.currentPacketFragment = new Packet();
        }
    }

    private onConnection(socket: net.Socket) {
        this.emit("connection", socket);
        socket.on("data", (data) => {
            for (const byte of data)
                this.incomingPacketFragment(socket, byte);
        });
    }
}
