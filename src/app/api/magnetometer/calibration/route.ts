import { magnetometer } from "@/server/magnetometer";
import { sendWebSocketMessage } from "@/server/web-socket";

export async function GET() {
  magnetometer.onData((data) =>
    sendWebSocketMessage({
      type: "magnetometer-data",
      data,
    })
  );

  return Response.json({ status: "sending data" });
}
