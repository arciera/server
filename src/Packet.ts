import {TypedPacket, TypedPacketStatic} from "./TypedPacket";
import HandshakePacket from "./packet/HandshakePacket.js";
import LoginPacket from "./packet/LoginPacket.js";

export default class Packet {
    readonly #data: number[];

    /**
     * Create a new packet
     * @param [data] Packet data
     */
    public constructor(data: number[] = []) {
        this.#data = data;
    }

    /**
     * Check if the packet is complete
     *
     * The first byte in the packet is the length of the complete packet.
     */
    public get isComplete(): boolean {
        const length = this.#data[0];
        if (!length) return false;
        return this.data.byteLength - 1 === length;
    }

    /**
     * Get packet data
     */
    public get data(): Buffer {
        return Buffer.from(this.#data);
    }

    /**
     * Push data to packet
     * @param data
     * @returns whether the packet is complete
     */
    public push(data: number): boolean {
        this.#data.push(data);
        return this.isComplete;
    }

    /**
     * Get typed packet
     */
    public getTyped(): TypedPacket | null {
        for (const type of Packet.types)
            if (type.isThisPacket(this))
                return new type(this);
        return null;
    }

    /**
     * Parse VarInt
     * @param buffer
     */
    public static parseVarInt(buffer: Buffer): number {
        let result = 0;
        let shift = 0;
        let index = 0;

        while (true) {
            const byte = buffer[index++]!;
            result |= (byte & 0x7F) << shift;
            shift += 7;

            if ((byte & 0x80) === 0) {
                break;
            }
        }

        return result;
    }


    /**
     * Split buffer
     * @param buffer
     * @param splitByte
     */
    public static split(buffer: Buffer, splitByte: number): Buffer[] {
        const buffers: Buffer[] = [];
        let lastPosition = 0;
        for (let i = 0; i < buffer.length; i++) {
            if (buffer[i] === splitByte) {
                buffers.push(buffer.subarray(lastPosition, i));
                lastPosition = i + 1;
            }
        }
        buffers.push(buffer.subarray(lastPosition));
        return buffers;
    }

    /**
     * Packet types
     */
    public static readonly types: TypedPacketStatic[] = [HandshakePacket, LoginPacket];
}
