import ServerPacket from "../../ServerPacket.js";

export default class SetDefaultSpawnPosition extends ServerPacket {
    public static readonly id = 0x50;

    public constructor(
        x: number,
        y: number,
        z: number,
        angle: number
    ) {
        const location = Buffer.alloc(8);
        location.writeInt32BE(x, 0);
        location.writeInt32BE(z, 2);
        location.writeInt16BE(y, 6);
        const angleBuffer = Buffer.alloc(4);
        angleBuffer.writeFloatBE(angle, 0);
        super(Buffer.concat([
            ServerPacket.writeVarInt(SetDefaultSpawnPosition.id),
            location,
            angleBuffer
        ]));
    }
}