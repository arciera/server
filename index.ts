import Server from "./src/Server.js";

const server = new Server(25566);
server.start();
server.on("listening", (port) => console.log(`Listening on port ${port}`));
server.on("unknownPacket", (packet, socket) => {
    console.log("Unknown packet, disconnecting", packet.data);
    socket.end();
});
