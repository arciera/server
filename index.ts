import Config from "./src/Config.js";
import Server from "./src/Server.js";

const config: Config = await Config.fromFile("config.json");

const server = new Server(config);
server.start();
server.on("listening", (port) => server.logger.info(`Listening on port ${port}`));
server.on("unknownPacket", (packet, socket) => {
    server.logger.warn("Unknown packet, disconnecting", packet.data);
    socket.end();
});
