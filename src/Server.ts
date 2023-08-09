import * as net from "node:net";
import EventEmitter from "node:events";
import Packet from "./Packet.js";
import path from "path";
import { Config } from "./Config.js";
import { PathLike } from "node:fs";

export default class Server extends EventEmitter {

    private readonly server = net.createServer();
    private currentPacketFragment: Packet = new Packet();

    public static readonly path: PathLike = path.dirname(path.join(new URL(import.meta.url).pathname, ".."));
    public readonly config: Config;

    public constructor(config: Config) {
        super();
        this.config = Object.freeze(config);
    }

    public start() {
        this.server.listen(this.config.port, () => this.emit("listening", this.config.port));
        this.server.on("connection", this.onConnection.bind(this));
    }

    private incomingPacketFragment(socket: net.Socket, data: number) {
        if (this.currentPacketFragment.push(data)) {
            const p = this.currentPacketFragment.getTyped();
            if (p) p.execute(socket);
            else this.emit("unknownPacket", this.currentPacketFragment, socket);
            this.currentPacketFragment = new Packet();
        }
    }

    private onConnection(socket: net.Socket) {
        socket.on("data", (data) => {
            for (const byte of data) {
                this.incomingPacketFragment(socket, byte);
            }
        });
    }
}
