import Packet from "./Packet.js";

export default class ParsedPacket {
	public readonly packet: Packet;
	private readonly packetData: number[];
	private get packetBuffer(): Buffer {
		return Buffer.from(this.packetData);
	}

	public readonly length;
	public readonly id;

	constructor(packet: Packet) {
		this.packet = packet;
		this.packetData = [...packet.data];
		this.length = this.getVarInt();
		this.id = this.getVarInt();
	}

	/**
	 * Check if buffer index is out of range
	 * @param index
	 */
	private isOutOfRange(index: number): boolean {
		return index >= this.packetBuffer.byteLength;
	}

	/**
	 * Parse VarInt
	 * After parsing, the buffer will be sliced
	 *
	 * @param [index=0] Index in the packet
	 */
	public getVarInt(index = 0): number | null {
		if (this.isOutOfRange(index)) return null;
		const result = Packet.parseVarInt(this.packetBuffer.subarray(index));
		this.packetData.splice(index, Packet.writeVarInt(result).byteLength);
		return result;
	}

	/**
	 * Parse String (n)
	 * After parsing, the buffer will be sliced
	 *
	 * @param [index=0] Index in the packet
	 */
	public getString(index = 0): string | null {
		if (this.isOutOfRange(index)) return null;
		const length = this.getVarInt(index);
		if (length === null) return null;
		const offset = index + Packet.writeVarInt(length).byteLength - 1;
		if (this.isOutOfRange(offset) || this.isOutOfRange(offset + length))
			return null;
		const result = this.packetBuffer
			.subarray(offset, offset + length)
			.toString();
		this.packetData.splice(index, offset + length - index);
		return result;
	}

	/**
	 * Parse Boolean
	 * After parsing, the buffer will be sliced
	 *
	 * @param [index=0] Index in the packet
	 */
	public getBoolean(index = 0): boolean | null {
		if (this.isOutOfRange(index)) return null;
		const result = Packet.parseBoolean(this.packetBuffer.subarray(index));
		this.packetData.splice(index, 1);
		return result;
	}

	/**
	 * Parse UUID
	 * After parsing, the buffer will be sliced
	 *
	 * @param [index=0] Index in the packet
	 */
	public getUUID(index = 0): string | null {
		if (this.isOutOfRange(index)) return null;
		const result = Packet.parseUUID(this.packetBuffer.subarray(index));
		this.packetData.splice(index, 16);
		return result;
	}

	/**
	 * Parse Unsigned Short
	 * After parsing, the buffer will be sliced
	 *
	 * @param [index=0] Index in the packet
	 */
	public getUShort(index = 0): number | null {
		if (this.isOutOfRange(index)) return null;
		const result = Packet.parseUShort(this.packetBuffer.subarray(index));
		this.packetData.splice(index, 2);
		return result;
	}

	/**
	 * Parse Long
	 * After parsing, the buffer will be sliced
	 *
	 * @param [index=0] Index in the packet
	 */
	public getLong(index = 0): bigint | null {
		if (this.isOutOfRange(index)) return null;
		const result = Packet.parseLong(this.packetBuffer.subarray(index));
		this.packetData.splice(index, 8);
		return result;
	}
}
