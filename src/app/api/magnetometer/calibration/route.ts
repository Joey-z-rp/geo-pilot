import { magnetometer } from "@/server/magnetometer";
import { sendWebSocketMessage } from "@/server/web-socket";

let timer: NodeJS.Timeout;

export async function POST(req: Request) {
  const { action } = await req.json();

  if (timer) {
    clearInterval(timer);
  }

  if (action === "start") {
    timer = setInterval(() => {
      sendWebSocketMessage({
        type: "magnetometer-data",
        data: magnetometer.getRawValues(),
      });
    }, 1000);
  }

  return Response.json({});
}
