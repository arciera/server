import Config from "./src/Config.js";
import Server from "./src/Server.js";
import LoginSuccessPacket from "./src/packet/server/LoginSuccessPacket.js";

const config: Config = await Config.fromFile("config.json");

const server = new Server(config);
server.start();
server.on("listening", (port) => server.logger.info(`Listening on port ${port}`));

server.on("unknownPacket", (packet, conn) => {
    server.logger.warn("Unknown packet, disconnecting", packet.dataBuffer);
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

server.on("disconnect", (conn) => {
    server.logger.debug("Disconnect", {
        ip: conn.socket.remoteAddress,
        port: conn.socket.remotePort
    });
});

server.on("closed", () => {
    server.logger.info("Server closed");
    process.exit(0);
});

process.on("SIGINT", () => {
    process.stdout.write("\x1b[2D"); // Move cursor 2 characters left (clears ^C)
    if (server.isRunning) server.stop().then();
    else process.exit(0);
});

server.on("packet.LoginPacket", (packet, conn) => {
    new LoginSuccessPacket(packet.data.uuid, packet.data.username).send(conn).then();
});
