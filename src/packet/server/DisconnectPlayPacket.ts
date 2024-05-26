import ServerPacket from "../../ServerPacket.js";
import { S2C } from "../Packets.js";

export default class DisconnectPlayPacket extends ServerPacket {
    public static readonly id = S2C.DisconnectPlay;

    public constructor(reason: ChatComponent) {
        super(Buffer.concat([
            ServerPacket.writeVarInt(DisconnectPlayPacket.id),
            ServerPacket.writeChat(reason)
        ]));
    }
}
