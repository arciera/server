import * as net from "node:net";
import EventEmitter from "node:events";
import path from "node:path";
import Packet from "./Packet.js";
import Config from "./Config.js";
import Logger from "./Logger.js";
import {TypedPacket} from "./TypedPacket";
import TypedEventEmitter from "./TypedEventEmitter";
import ConnectionPool from "./ConnectionPool.js";
import Connection from "./Connection.js";

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
    unknownPacket: (packet: Packet, socket: Connection) => void;

    /**
     * Known packet received
     * @param packet Packet that was received
     * @param socket Socket the packet was received from
     */
    packet: (packet: TypedPacket, socket: Connection) => void;

    /**
     * New connection established
     * @param socket Socket the connection was established on
     */
    connection: (socket: Connection) => void;
};

export default class Server extends (EventEmitter as new () => TypedEventEmitter<ServerEvents>) {
    private readonly server = net.createServer();
    public readonly logger = new Logger("Server");
    public readonly connections: ConnectionPool = new ConnectionPool();

    public static readonly path: string = path.dirname(path.join(new URL(import.meta.url).pathname, ".."));
    public readonly config: Config;

    public constructor(config: Config) {
        super();
        this.config = Object.freeze(config);
    }

    public start() {
        this.server.listen(this.config.port, () => this.emit("listening", this.config.port));
        this.server.on("connection", this.onConnection.bind(this));
    }

    private onConnection(socket: net.Socket) {
        const conn = new Connection(socket, this);
        this.connections.add(conn);
        this.emit("connection", conn);
        socket.on("data", (data) => {
            for (const byte of data)
                conn.incomingPacketFragment(byte);
        });
    }
}
