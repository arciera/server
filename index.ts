import { Config, ConfigLoader } from "./src/Config.js";
import Server from "./src/Server.js";
import LoginSuccessPacket from "./src/packet/server/LoginSuccessPacket.js";
import Connection from "./src/Connection.js";
import StatusResponsePacket from "./src/packet/server/StatusResponsePacket.js";
import PongPacket from "./src/packet/server/PongPacket.js";

const config: Config = await ConfigLoader.fromFile("config.json");
const server = new Server(config);

server.start();
server.on("listening", (port) => server.logger.info(`Listening on port ${port}`));

server.on("unknownPacket", (packet, conn) => {
    server.logger.debug("Unknown packet", `{state=${Connection.State[conn.state]}}`, packet.dataBuffer);
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
    new LoginSuccessPacket(packet.data.uuid ?? Buffer.from("OfflinePlayer:" + packet.data.username, "utf-8").toString("hex").slice(0, 32), packet.data.username).send(conn).then();
});

server.on("packet.PingPacket", (packet, conn) => {
    new PongPacket(packet).send(conn);
});

server.on("packet.StatusRequestPacket", (_, conn) => {
    new StatusResponsePacket(server).send(conn);
})