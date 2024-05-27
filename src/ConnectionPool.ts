import Connection from "./Connection.js"
import DisconnectLoginPacket from "./packet/server/DisconnectLoginPacket.js"
import DisconnectPlayPacket from "./packet/server/DisconnectPlayPacket.js"

export default class ConnectionPool {
	private readonly connections: Connection[] = []

	/**
	 * Add a connection to the pool
	 * @param connection
	 */
	public add(connection: Connection): void {
		this.connections.push(connection)
		connection.socket.on("close", () => this.disconnect(connection.id))
	}

	/**
	 * Get connection by ID
	 * @param id The ID of the connection to get
	 */
	public get(id: string): Connection | null {
		return (
			this.connections.find((connection) => connection.id === id) ?? null
		)
	}

	/**
	 * Disconnect all connections
	 * @param [reason] The reason for the disconnect
	 * @returns Whether all connections disconnected successfully
	 */
	public async disconnectAll(
		reason?: string | ChatComponent
	): Promise<boolean> {
		const promises: Promise<boolean>[] = []
		for (const connection of this.connections)
			promises.push(this.disconnect(connection.id, reason))
		return (await Promise.all(promises)).every((result) => result)
	}

	/**
	 * Disconnect a connection
	 * @param id The ID of the connection to disconnect
	 * @param [reason] The reason for the disconnect
	 * @returns Whether the connection was found and disconnected
	 */
	public async disconnect(
		id: string,
		reason?: string | ChatComponent
	): Promise<boolean> {
		const connection = this.get(id)
		if (!connection) return false
		const index = this.connections.indexOf(connection)
		if (index === -1) return false
		const message = typeof reason === "string" ? { text: reason } : reason!
		if (reason)
			switch (connection.state) {
				case Connection.State.LOGIN: {
					await new DisconnectLoginPacket(message).send(connection)
					break
				}
				case Connection.State.PLAY: {
					await new DisconnectPlayPacket(message).send(connection)
					break
				}
				default: {
					connection.server.logger.warn(
						"Cannot set disconnect reason for state " +
							Connection.State[connection.state] +
							" on connection " +
							connection.id
					)
				}
			}
		this.connections.splice(index, 1)
		connection.server.emit("disconnect", connection)
		return new Promise((resolve) =>
			connection.socket.end(() => resolve(true))
		)
	}
}
