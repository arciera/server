import Server from "./src/Server.js";

const server = new Server(25566);
server.start();
server.on("listening", (port) => server.logger.info(`Listening on port ${port}`));

server.on("unknownPacket", (packet, socket) => {
    server.logger.warn("Unknown packet, disconnecting", packet.data);
    socket.end();
});
server.on("packet", (packet, _socket) => {
    server.logger.debug(packet.constructor.name, packet.data);
});

server.on("connection", (socket) => {
    server.logger.debug("Connection", {
        ip: socket.remoteAddress,
        port: socket.remotePort
    });
});
