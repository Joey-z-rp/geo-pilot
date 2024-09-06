import { magnetometer } from "@/server/magnetometer";
import { sendWebSocketMessage } from "@/server/web-socket";

let timer: NodeJS.Timeout;

export async function GET() {
  if (timer) {
    clearInterval(timer);
  }
  timer = setInterval(() => {
    sendWebSocketMessage({
      type: "magnetometer-data",
      data: magnetometer.getRawValues(),
    });
  }, 1000);

  return Response.json({ status: "sending data" });
}
