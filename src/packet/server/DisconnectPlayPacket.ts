import ServerPacket from "../../ServerPacket.js";

export default class DisconnectPlayPacket extends ServerPacket {
    public static readonly id = 0x1a;

    public constructor(reason: ChatComponent) {
        super(Buffer.concat([
            ServerPacket.writeVarInt(DisconnectPlayPacket.id),
            ServerPacket.writeChat(reason)
        ]));
    }
}
