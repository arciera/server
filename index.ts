import Config from "./src/Config.js";
import Server from "./src/Server.js";
import LoginSuccessPacket from "./src/packet/server/LoginSuccessPacket.js";
import LoginPlayPacket from "./src/packet/server/LoginPlayPacket.js";
import fs from "node:fs/promises";

const config: Config = await Config.fromFile("config.json");

const server = new Server(config);
server.start();
server.on("listening", (port) => server.logger.info(`Listening on port ${port}`));

server.on("unknownPacket", (packet, _conn) => {
    server.logger.warn("Unknown packet, disconnecting", packet.dataBuffer);
    //conn.disconnect().then();
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

server.on("packet.LoginPacket", async (packet, conn) => {
    await new LoginSuccessPacket(packet.data.uuid, packet.data.username).send(conn);
    const registry = Buffer.from((await fs.readFile("registryCodecNBT", "utf-8")).replaceAll(" ", ""), "hex");
    await new LoginPlayPacket(0, false, 3, -1, ["minecraft:the_end"], registry, "minecraft:the_end", "end", BigInt(0), 0, 2, 2, false, false, true, true, 0, false).send(conn);
});
