import Server from "../Server"
import ParsedPacket from "../ParsedPacket"
import Connection from "../Connection"

export interface TypedClientPacket {
	readonly packet: ParsedPacket
	readonly data: Record<string, any>
	execute(connection: Connection, server: Server): void
}

export interface TypedClientPacketStatic {
	new (packet: ParsedPacket): TypedClientPacket

	readonly id: number

	isThisPacket(data: ParsedPacket, conn: Connection): TypedClientPacket | null
}
