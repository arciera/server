import Connection from "../../../Connection.js";
import ServerPacket from "../../../ServerPacket.js";
import { S2C } from "../../Packets.js";

export default class FinishConfigurationPacket extends ServerPacket {
    public static readonly id = S2C.FinishConfiguration;

    public constructor() {
        super(Buffer.concat([
            ServerPacket.writeVarInt(FinishConfigurationPacket.id),
        ]));
    }

    public override send(connection: Connection) {
        console.log('a')
        connection._setState(Connection.State.PLAY);
        return super.send(connection);
    }
}
