import Server from "./src/Server.js";

const server = new Server(25566);
server.start();
server.on("listening", (port) => server.logger.info(`Listening on port ${port}`));
server.on("unknownPacket", (packet, socket) => {
    server.logger.warn("Unknown packet, disconnecting", packet.data);
    socket.end();
});
