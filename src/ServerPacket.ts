import Packet from "./Packet.js"
import Connection from "./Connection"

export default abstract class ServerPacket extends Packet {
	protected constructor(data: Buffer) {
		super([...Buffer.concat([Packet.writeVarInt(data.byteLength), data])])
	}

	/**
	 * Send packet to a connection
	 * @param connection
	 */
	public send(connection: Connection): Promise<void> {
		return new Promise((resolve, reject) => {
			connection.socket.write(this.dataBuffer, (err) => {
				if (err) reject(err)
				else resolve()
			})
		})
	}
}
