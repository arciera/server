import Server from "../../Server.js";
import ServerPacket from "../../ServerPacket.js";

export default class StatusResponsePacket extends ServerPacket {
    public static readonly id = 0x00;

    public constructor(server: Server) {
        super(Buffer.concat([
            ServerPacket.writeVarInt(0x00),
            ServerPacket.writeString(JSON.stringify({
                "version": server.config.server.version,
                "players": {
                    "max": server.config.server.maxPlayers,
                    "online": 2, //todo: set to NaN and see if it dies in misery
                    "sample": [
                        {
                            "name": "lp721mk",
                            "uuid": "372a65f92685477d84eb0d55e78668cc"
                        },
                        {
                            "name": "km127pl",
                            "uuid": "d8fac45d0c7d46b7ba406a6921186bda"
                        }
                    ]
                },
                "description": {
                    "text": server.config.server.motd
                },
                "favicon": server.favicon,
                "enforcesSecureChat": server.config.server.enforcesSecureChat
            }))
        ]));
    }
}
