import { Config } from "./src/Config.js";
import Server from "./src/Server.js";

const config: Config = await Config.fromFile("config.json");

const server = new Server(config);
server.start();
server.on("listening", (port) => console.log(`Listening on port ${port}`));
server.on("unknownPacket", (packet, socket) => {
    console.log("Unknown packet, disconnecting", packet.data);
    socket.end();
});
