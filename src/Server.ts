import * as net from "node:net";
import EventEmitter from "node:events";
import Packet from "./Packet.js";

export default class Server extends EventEmitter {
    public readonly port: Number;

    private readonly server = net.createServer();
    private currentPacketFragment: Packet = new Packet();

    public constructor(port: Number) {
        super();
        this.port = port;
    }

    public start() {
        this.server.listen(this.port, () => this.emit("listening", this.port));
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
