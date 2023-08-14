import Config from "./src/Config.js";
import Server from "./src/Server.js";
import LoginSuccessPacket from "./src/packet/server/LoginSuccessPacket.js";
import Connection from "./src/Connection.js";
import LoginPlayPacket from "./src/packet/server/LoginPlayPacket.js";
import fs from "node:fs/promises";
import Packet from "./src/Packet.js";
import SetDefaultSpawnPosition from "./src/packet/server/SetDefaultSpawnPosition.js";

const config: Config = await Config.fromFile("config.json");

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

server.on("packet.LoginPacket", async (packet, conn) => {
    await new LoginSuccessPacket(packet.data.uuid, packet.data.username).send(conn);
    const registry = Buffer.from((await fs.readFile("registryCodecNBT", "utf-8")).replaceAll(" ", ""), "hex");
    await new LoginPlayPacket(0, false, 3, -1, ["minecraft:the_end"], registry, "minecraft:the_end", "end", BigInt(0), 0, 2, 2, false, false, true, true, 0, false).send(conn);
    await new SetDefaultSpawnPosition(0, 0, 0, 0).send(conn);
    const chunk = Buffer.from("24 00 00 00 00 00 00 00 00 0A 00 00 0C 00 0F 4D 4F 54 49 4F 4E 5F 42 4C 4F 43 4B 49 4E 47 00 00 00 25 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 0C 00 0D 57 4F 52 4C 44 5F 53 55 52 46 41 43 45 00 00 00 25 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 D8 01 00 00 00 00 00 00 38 00 00 00 00 00 00 00 38 00 00 00 00 00 00 00 38 00 00 00 00 00 00 00 38 00 00 00 00 00 00 00 38 00 00 00 00 00 00 00 38 00 00 00 00 00 00 00 38 00 00 00 00 00 00 00 38 00 00 00 00 00 00 00 38 00 00 00 00 00 00 00 38 00 00 00 00 00 00 00 38 00 00 00 00 00 00 00 38 00 00 00 00 00 00 00 38 00 00 00 00 00 00 00 38 00 00 00 00 00 00 00 38 00 00 00 00 00 00 00 38 00 00 00 00 00 00 00 38 00 00 00 00 00 00 00 38 00 00 00 00 00 00 00 38 00 00 00 00 00 00 00 38 00 00 00 00 00 00 00 38 00 00 00 00 00 00 00 38 00 00 00 00 00 00 00 38 00 00 00 00 00 00 00 38 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00".replaceAll(" ", ""), "hex");
    conn.socket.write(Buffer.concat([Packet.writeVarInt(chunk.byteLength), chunk]));
    setInterval(() => conn.socket.write(Buffer.from([9, 0x23, 0, 0, 0, 0, 0, 0, 0, 0])), 2000);
});
