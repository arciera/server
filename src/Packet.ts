import ParsedPacket from "./ParsedPacket.js";
import {TypedClientPacket, TypedClientPacketStatic} from "./types/TypedPacket";
import HandshakePacket from "./packet/client/HandshakePacket.js";
import LoginPacket from "./packet/client/LoginPacket.js";
import Connection from "./Connection";

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
        const length = this.expectedLength;
        if (!length) return false;
        return this.dataBuffer.byteLength - 1 === length;
    }

    public get expectedLength(): number {
        return Packet.parseVarInt(Buffer.from(this.#data));
    }

    /**
     * Get packet data
     */
    public get data(): number[] {
        return this.#data;
    }

    /**
     * Get packet data
     */
    public get dataBuffer(): Buffer {
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
     * Parse packet
     */
    public parse(): ParsedPacket {
        return new ParsedPacket(this);
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
     * Write VarInt
     * @param value
     */
    public static writeVarInt(value: number): Buffer {
        const buffer = Buffer.alloc(5);
        let index = 0;

        while (true) {
            let byte = value & 0x7F;
            value >>>= 7;

            if (value !== 0) {
                byte |= 0x80;
            }

            buffer[index++] = byte;

            if (value === 0) {
                break;
            }
        }

        return buffer.subarray(0, index);
    }

    /**
     * Parse String (n)
     * @param buffer
     */
    public static parseString(buffer: Buffer): string {
        const length = Packet.parseVarInt(buffer);
        buffer = buffer.subarray(Packet.writeVarInt(length).length, Packet.writeVarInt(length).length + length);
        return buffer.toString();
    }


    /**
     * Write String (n)
     * @param value
     */
    public static writeString(value: string): Buffer {
        const length = Buffer.byteLength(value);
        return Buffer.concat([Packet.writeVarInt(length), Buffer.from(value)]);
    }

    /**
     * Parse boolean
     * @param buffer
     */
    public static parseBoolean(buffer: Buffer): boolean {
        return !!buffer.readUInt8(0);
    }

    /**
     * Write boolean
     * @param value
     */
    public static writeBoolean(value: boolean): Buffer {
        return Buffer.from([value ? 1 : 0]);
    }

    /**
     * Parse UUID
     * @param buffer
     */
    public static parseUUID(buffer: Buffer): string {
        return buffer.toString("hex", 0, 16);
    }

    /**
     * Write UUID
     * @param value
     */
    public static writeUUID(value: string): Buffer {
        return Buffer.from(value, "hex");
    }

    /**
     * Parse Unsigned Short
     * @param buffer
     */
    public static parseUShort(buffer: Buffer): number {
        return buffer.readUInt16BE(0);
    }

    /**
     * Write Unsigned Short
     * @param value
     */
    public static writeUShort(value: number): Buffer {
        const buffer = Buffer.alloc(2);
        buffer.writeUInt16BE(value);
        return buffer;
    }

    /**
     * Parse ULong
     * @param buffer
     */
     public static parseULong(buffer: Buffer): bigint {
        return buffer.readBigUint64BE(0);
    }

    /**
     * Write ULong
     * @param value
     */
    public static writeULong(value: bigint): Buffer {
        const buffer = Buffer.alloc(8);
        buffer.writeBigUint64BE(value);
        return buffer;
    }

    /**
     * Parse Long
     * @param buffer
     */
    public static parseLong(buffer: Buffer): bigint {
        return buffer.readBigInt64BE(0);
    }

    /**
     * Write Long
     * @param value
     */
    public static writeLong(value: bigint): Buffer {
        const buffer = Buffer.alloc(8);
        buffer.writeBigInt64BE(value);
        return buffer;
    }

    /**
     * Parse chat
     * @param buffer
     */
    public static parseChat(buffer: Buffer): ChatComponent {
        return JSON.parse(Packet.parseString(buffer)) as ChatComponent;
    }

    /**
     * Write chat
     * @param value
     */
    public static writeChat(value: ChatComponent): Buffer {
        return Packet.writeString(JSON.stringify(value));
    }

    /**
     * Get typed client packet
     */
    public getTypedClient(conn: Connection): TypedClientPacket | null {
        for (const type of Packet.clientTypes) {
            const p = type.isThisPacket(this.parse(), conn);
            if (p !== null) return p;
        }
        return null;
    }

    /**
     * Packet types
     */
    public static readonly clientTypes: TypedClientPacketStatic[] = [HandshakePacket, LoginPacket];


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
}
