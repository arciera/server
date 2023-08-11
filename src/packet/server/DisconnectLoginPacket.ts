import ServerPacket from "../../ServerPacket.js";

export default class DisconnectLoginPacket extends ServerPacket {
    public static readonly id = 0x00;

    public constructor(reason: ChatComponent) {
        super(Buffer.concat([
            ServerPacket.writeVarInt(DisconnectLoginPacket.id),
            ServerPacket.writeChat(reason)
        ]));
    }
}
