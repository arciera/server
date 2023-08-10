import Packet from "./Packet.js";
import Connection from "./Connection";

export default abstract class ServerPacket extends Packet {

    protected constructor(data: Buffer) {
        super([...Buffer.concat([Packet.writeVarInt(data.byteLength), data])]);
    }

    /**
     * Send packet to a connection
     * @param connection
     */
    public send(connection: Connection): void {
        connection.socket.write(this.dataBuffer);
    }
}
