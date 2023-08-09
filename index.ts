import Config from "./src/Config.js";
import Server from "./src/Server.js";

const config: Config = await Config.fromFile("config.json");

const server = new Server(config);
server.start();
server.on("listening", (port) => server.logger.info(`Listening on port ${port}`));

server.on("unknownPacket", (packet, conn) => {
    server.logger.warn("Unknown packet, disconnecting", packet.data);
    conn.disconnect().then();
});
server.on("packet", (packet, _conn) => {
    server.logger.debug(packet.constructor.name, packet.data);
});

server.on("connection", (conn) => {
    server.logger.debug("Connection", {
        ip: conn.socket.remoteAddress,
        port: conn.socket.remotePort
    });
});
