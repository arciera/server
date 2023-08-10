import ServerPacket from "../../ServerPacket.js";

/**
 * A Minecraft protocol client-bound LoginSuccess packet.
 */
export default class LoginSuccessPacket extends ServerPacket {
    public static readonly id = 0x02;

    public constructor(uuid: string, username: string) {
        super(Buffer.concat([
            ServerPacket.writeVarInt(LoginSuccessPacket.id),
            ServerPacket.writeUUID(uuid),
            ServerPacket.writeString(username),
            ServerPacket.writeVarInt(0)
        ]));
    }
}
