import * as net from "node:net"
import EventEmitter from "node:events"
import path from "node:path"
import Packet from "./Packet.js"
import Logger from "./Logger.js"
import { TypedClientPacket } from "./types/TypedPacket"
import TypedEventEmitter from "./types/TypedEventEmitter"
import ConnectionPool from "./ConnectionPool.js"
import Connection from "./Connection.js"
import HandshakePacket from "./packet/client/HandshakePacket"
import LoginPacket from "./packet/client/LoginPacket"
import { Config } from "./Config.js"
import Scheduler from "./Scheduler.js"
import { readFile } from "node:fs/promises"
import PingPacket from "./packet/client/PingPacket.js"
import StatusRequestPacket from "./packet/client/StatusRequestPacket.js"
import LoginAckPacket from "./packet/client/LoginAckPacket.js"

type ServerEvents = {
	/**
	 * Server is ready to accept connections
	 * @param port Port the server is listening on
	 */
	listening: (port: Number) => void

	/**
	 * Unknown packet received
	 * @param packet Packet that was received
	 * @param connection Connection the packet was received from
	 */
	unknownPacket: (packet: Packet, connection: Connection) => void

	/**
	 * Known packet received
	 * @param packet Packet that was received
	 * @param connection Connection the packet was received from
	 */
	packet: (packet: TypedClientPacket, connection: Connection) => void

	/**
	 * New connection established
	 * @param connection Connection that was established
	 */
	connection: (connection: Connection) => void

	/**
	 * Server closed
	 */
	closed: () => void

	/**
	 * Connection closed
	 * @param connection Connection that was closed
	 */
	disconnect: (connection: Connection) => void

	/**
	 * Handshake packet received
	 * @param packet Packet that was received
	 * @param connection Connection the packet was received from
	 */
	"packet.HandshakePacket": (
		packet: HandshakePacket,
		connection: Connection
	) => void

	/**
	 * Login packet received
	 * @param packet Packet that was received
	 * @param connection Connection the packet was received from
	 */
	"packet.LoginPacket": (packet: LoginPacket, connection: Connection) => void

	/**
	 * Status request packet received
	 * @param packet Packet that was received
	 * @param connection Connection the packet was received from
	 */
	"packet.StatusRequestPacket": (
		packet: StatusRequestPacket,
		connection: Connection
	) => void

	/**
	 * Ping packet received
	 * @param packet Packet that was received
	 * @param connection Connection the packet was received from
	 */
	"packet.PingPacket": (packet: PingPacket, connection: Connection) => void

	/**
	 * Login acknowledge packet
	 * @param packet Packet that was received
	 * @param connection Connection the packet was received from
	 */
	"packet.LoginAck": (packet: LoginAckPacket, connection: Connection) => void
}

export default class Server extends (EventEmitter as new () => TypedEventEmitter<ServerEvents>) {
	private readonly server = net.createServer()
	public readonly logger: Logger
	public readonly scheduler: Scheduler = new Scheduler(20)
	public readonly connections: ConnectionPool = new ConnectionPool()

	public static readonly path: string = path.dirname(
		path.join(new URL(import.meta.url).pathname, "..")
	)
	public readonly config: Config

	public favicon: string = "data:image/png;base64,"

	public constructor(config: Config) {
		super()
		this.config = Object.freeze(config)
		this.logger = new Logger("Server", this.config.logLevel)
	}

	public async start() {
		// add a favicon if such is specified
		if (this.config.server.favicon) {
			const data = await readFile(this.config.server.favicon)
			this.favicon += Buffer.from(data).toString("base64")
		}

		this.scheduler.on("started", () =>
			this.logger.debug(
				"Scheduler started, freq=" + this.scheduler.frequency + "Hz"
			)
		)
		this.scheduler.on("paused", () =>
			this.logger.debug("Scheduler paused, age=" + this.scheduler.age)
		)
		this.scheduler.on("terminating", () =>
			this.logger.debug("Scheduler terminated, age=" + this.scheduler.age)
		)
		this.scheduler.start()
		this.server.listen(this.config.port, () =>
			this.emit("listening", this.config.port)
		)
		this.server.on("connection", this.onConnection.bind(this))
	}

	public async stop(): Promise<void> {
		this.logger.debug("Closing server...")
		await Promise.all([
			new Promise((resolve, reject) => {
				this.server.close((err) => {
					if (err) reject(err)
					else resolve(void 0)
				})
			}),
			this.connections.disconnectAll(this.config.shutdownKickReason),
		])
		await this.scheduler.stop()
		this.emit("closed")
	}

	public get isRunning(): boolean {
		return this.server.listening
	}

	private onConnection(socket: net.Socket) {
		const conn = new Connection(socket, this)
		this.connections.add(conn)
		this.emit("connection", conn)
		socket.on("data", (data) => {
			for (const byte of data) conn.incomingPacketFragment(byte)
		})
	}
}
