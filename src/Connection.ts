import net from "node:net";
import * as crypto from "node:crypto";
import Server from "./Server";
import Packet from "./Packet.js";

/**
 * A TCP socket connection to the server.
 */
export default class Connection {
    /**
     * A unique identifier for this connection.
     */
    public readonly id: string;
    /**
     * The TCP socket for this connection.
     */
    public readonly socket: net.Socket;
    /**
     * The server to which this connection belongs.
     */
    public readonly server: Server;

    /**
     * Packet fragment this connection is currently sending to the server.
     * @internal
     */
    private currentPacketFragment: Packet = new Packet();

    constructor(socket: net.Socket, server: Server) {
        this.id = crypto.randomBytes(16).toString("hex");
        this.socket = socket;
        this.server = server;
    }

    /** @internal */
    public incomingPacketFragment(data: number) {
        if (this.currentPacketFragment.push(data)) {
            const p = this.currentPacketFragment.getTypedClient();
            if (p) {
                this.server.emit("packet", p, this);
                p.execute(this.socket, this.server);
            }
            else this.server.emit("unknownPacket", this.currentPacketFragment, this);
            this.currentPacketFragment = new Packet();
        }
    }

    /**
     * Disconnect this connection.
     */
    public disconnect(): Promise<boolean> {
        return this.server.connections.disconnect(this.id);
    }

    /**
     * Whether this connection is connected (i.e. it can send and receive data).
     */
    public get connected(): boolean {
        return !this.socket.destroyed && this.server.connections.get(this.id) !== null;
    }
}
