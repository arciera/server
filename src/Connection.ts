import net from "node:net";
import * as crypto from "node:crypto";
import Server from "./Server";
import Packet from "./Packet.js";
import Logger from "./Logger.js";

/**
 * A TCP socket connection to the server.
 */
class Connection {
	/**
	 * A unique identifier for this connection.
	 */
	public readonly id: string;
	/**
	 * The TCP socket for this connection.
	 */
	public readonly socket: net.Socket;
	/**
	 * The server to which this connection belongs.
	 */
	public readonly server: Server;
	/**
	 * The state of the connection.
	 */
	#state: Connection.State = Connection.State.NONE;

	/**
	 * The state of the connection.
	 */
	public get state(): Connection.State {
		return this.#state;
	}

	/** @internal */
	public _setState(state: Connection.State): void {
		new Logger("State", Logger.Level.DEBUG).debug(
			`Switching state from ${this.#state} to ${state}`
		);
		this.#state = state;
	}

	/**
	 * Packet fragment this connection is currently sending to the server.
	 * @internal
	 */
	private currentPacketFragment: Packet = new Packet();

	constructor(socket: net.Socket, server: Server) {
		this.id = crypto.randomBytes(16).toString("hex");
		this.socket = socket;
		this.server = server;
	}

	/** @internal */
	public incomingPacketFragment(data: number) {
		if (this.currentPacketFragment.push(data)) {
			const p = this.currentPacketFragment.getTypedClient(this);
			if (p) {
				p.execute(this, this.server);
				this.server.emit("packet", p, this);
				this.server.emit(
					`packet.${p.constructor.name}` as any,
					p,
					this
				);
			} else
				this.server.emit(
					"unknownPacket",
					this.currentPacketFragment,
					this
				);
			this.currentPacketFragment = new Packet();
		}
	}

	/**
	 * Disconnect this connection.
	 * @param [reason] The reason for the disconnect.
	 */
	public disconnect(reason?: string): Promise<boolean> {
		return this.server.connections.disconnect(this.id, reason);
	}

	/**
	 * Whether this connection is connected (i.e. it can send and receive data).
	 */
	public get connected(): boolean {
		return (
			!this.socket.destroyed &&
			this.server.connections.get(this.id) !== null
		);
	}
}

namespace Connection {
	/**
	 * Connection state
	 */
	export enum State {
		/**
		 * None / unknown
		 */
		NONE,

		/**
		 * Status state
		 *
		 * Sender is checking server status
		 */
		STATUS,

		/**
		 * Login state
		 *
		 * Player is connecting to the server
		 */
		LOGIN,

		/**
		 * Configuration state
		 *
		 * Player is connected and is awaiting configuration data
		 */
		CONFIGURATION,

		/**
		 * Play state
		 *
		 * Player is online and communicating game data
		 */
		PLAY,
	}
}

export default Connection;
