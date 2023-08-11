import ServerPacket from "../../ServerPacket.js";
import {Gamemode} from "../../Gamemode";

/**
 * A Minecraft protocol client-bound LoginSuccess packet.
 */
export default class LoginPlayPacket extends ServerPacket {
    public static readonly id = 0x28;

    /**
     * @param entityId The player's entity ID (EID)
     * @param hardcore
     * @param gamemode
     * @param previousGamemode -1: Undefined (null), 0: Survival, 1: Creative, 2: Adventure, 3: Spectator. The previous game mode. Vanilla client uses this for the debug (F3 + N & F3 + F4) game mode switch. (More information needed)
     * @param dimensions Identifiers for all dimensions on the server.
     * @param registryCodec Represents certain registries that are sent from the server and are applied on the client.
     * @param dimensionType Name of the dimension type being spawned into.
     * @param dimensionName Name of the dimension being spawned into.
     * @param hashedSeed Hashed seed of the world being spawned into.
     * @param maxPlayers Was once used by the client to draw the player list, but now is ignored.
     * @param viewDistance Render distance (2-32).
     * @param simulationDistance The distance that the client will process specific things, such as entities.
     * @param reducedDebugInfo If true, a Notchian client shows reduced information on the debug screen. For servers in development, this should almost always be false.
     * @param enableRespawnScreen Set to false when the doImmediateRespawn gamerule is true.
     * @param isDebug True if the world is a debug mode world; debug mode worlds cannot be modified and have predefined blocks.
     * @param isFlat True if the world is a superflat world; flat worlds have different void fog and a horizon at y=0 instead of y=63.
     * @param portalCooldown The number of ticks until the player can use the portal again. Although the number of portal cooldown ticks is included in this packet, the whole portal usage process is still dictated entirely by the server. What kind of effect does this value have on the client, if any?
     * @param hasDeathLocation If true, then the next two fields are present.
     * @param [deathDimensionName] Name of the dimension the player died in.
     * @param [deathLocation] Location the player died at.
     */
    public constructor(
        entityId: number,
        hardcore: boolean,
        gamemode: Gamemode,
        previousGamemode: Gamemode | -1,
        dimensions: string[],
        registryCodec: Buffer,
        dimensionType: string,
        dimensionName: string,
        hashedSeed: bigint,
        maxPlayers: number,
        viewDistance: number,
        simulationDistance: number,
        reducedDebugInfo: boolean,
        enableRespawnScreen: boolean,
        isDebug: boolean,
        isFlat: boolean,
        portalCooldown: number,
        hasDeathLocation: boolean,
        deathDimensionName?: string,
        deathLocation?: [number, number, number]
    ) {
        const gamemodeBuffer = Buffer.alloc(1);
        gamemodeBuffer.writeUInt8(gamemode, 0);
        const previousGamemodeBuffer = Buffer.alloc(1);
        previousGamemodeBuffer.writeInt8(previousGamemode, 0);
        const seedBuffer = Buffer.alloc(8);
        seedBuffer.writeBigInt64BE(hashedSeed, 0);
        const deathPositionBuffer = Buffer.alloc(8);
        if (deathLocation) {
            deathPositionBuffer.writeInt32BE(deathLocation[0], 0)
            deathPositionBuffer.writeInt16BE(deathLocation[1], 4);
            deathPositionBuffer.writeInt32BE(deathLocation[2], 6);
        }
        super(Buffer.concat([
            ServerPacket.writeVarInt(LoginPlayPacket.id),
            ServerPacket.writeInt(entityId),
            ServerPacket.writeBoolean(hardcore),
            gamemodeBuffer,
            previousGamemodeBuffer,
            ServerPacket.writeVarInt(dimensions.length),
            ...dimensions.map(dimension => ServerPacket.writeString(dimension)),
            registryCodec,
            ServerPacket.writeString(dimensionType),
            ServerPacket.writeString(dimensionName),
            seedBuffer,
            ServerPacket.writeVarInt(maxPlayers),
            ServerPacket.writeVarInt(viewDistance),
            ServerPacket.writeVarInt(simulationDistance),
            ServerPacket.writeBoolean(reducedDebugInfo),
            ServerPacket.writeBoolean(enableRespawnScreen),
            ServerPacket.writeBoolean(isDebug),
            ServerPacket.writeBoolean(isFlat),
            ServerPacket.writeBoolean(hasDeathLocation),
            hasDeathLocation ? Buffer.concat([
                ServerPacket.writeString(deathDimensionName!),
                deathPositionBuffer
            ]) : Buffer.alloc(0),
            ServerPacket.writeVarInt(portalCooldown)
        ]));
    }
}
