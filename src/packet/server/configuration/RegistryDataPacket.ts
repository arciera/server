import ServerPacket from "../../../ServerPacket.js";
import { S2C } from "../../Packets.js";

export default class RegistryDataPacket extends ServerPacket {
    public static readonly id = S2C.RegistryData;

    public constructor() {
        super(Buffer.concat([
            ServerPacket.writeVarInt(RegistryDataPacket.id),
            //FIXME: send registry
        ]));
    }
}
