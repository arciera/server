import ServerPacket from "../../ServerPacket.js";
import PingPacket from "../client/PingPacket.js";
import { S2C } from "../Packets.js";

export default class PongPacket extends ServerPacket {
    public static readonly id = S2C.Pong;

    public constructor(c2s: PingPacket) {
        super(Buffer.concat([
            ServerPacket.writeVarInt(PongPacket.id),
            ServerPacket.writeLong(c2s.data.payload),
        ]));
    }
}
