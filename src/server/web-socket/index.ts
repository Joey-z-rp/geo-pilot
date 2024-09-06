import { WebSocketServer, WebSocket } from "ws";
import { networkInterfaces } from "os";
import { createServer } from "http";
import { WebSocketMessage } from "@/shared/web-socket/messages";

const server = createServer();
const wsServer = new WebSocketServer({ server });
const port = 8001;
server.listen(port, () => {
  console.info(`WebSocket server is running on port ${port}`);
  console.info(`IP: ${networkInterfaces()["wlan0"]?.[0].address}`);
});

let browserConnection: WebSocket | undefined;

wsServer.on("connection", (connection) => {
  if (browserConnection) browserConnection.close();
  browserConnection = connection;
});

export const sendWebSocketMessage = (message: WebSocketMessage) => {
  if (browserConnection) browserConnection.send(JSON.stringify(message));
};
