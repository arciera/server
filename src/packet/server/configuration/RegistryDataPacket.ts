import ServerPacket from "../../../ServerPacket.js";
import { S2C } from "../../Packets.js";
import { NbtReader, NbtWriter, tagTypes } from "../../../nbt.js";

export default class RegistryDataPacket extends ServerPacket {
	public static readonly id = S2C.RegistryData;

	public constructor() {
		const writer = new NbtWriter();
		writer.compound({
			"minecraft:worldgen/biome": {
				type: tagTypes.compound,
				value: {
					type: {
						type: tagTypes.string,
						value: "minecraft:worldgen/biome",
					},
					value: {
						type: tagTypes.compound,
						value: {
							name: {
								type: tagTypes.string,
								value: "minecraft:plains",
							},
							id: {
								type: tagTypes.int,
								value: 0,
							},
						},
					},
				},
			},
		});
		super(
			Buffer.concat([
				ServerPacket.writeVarInt(RegistryDataPacket.id),
				Buffer.from(writer.buffer.slice(0, writer.offset)),
			])
		);
	}
}
