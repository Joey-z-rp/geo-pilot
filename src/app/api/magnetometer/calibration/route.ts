import { mainMagnetometer, motorMagnetometer } from "@/server/sensors";
import { sendWebSocketMessage } from "@/server/web-socket";

let timer: NodeJS.Timeout;

export async function POST(req: Request) {
  const { action } = await req.json();

  if (timer) {
    clearInterval(timer);
  }

  if (action === "start") {
    timer = setInterval(() => {
      const readings = mainMagnetometer.getHeading();
      const motorReadings = motorMagnetometer.getHeading();
      console.log({ readings, motorReadings });
      const data = {
        raw: readings.raw,
        calibrated: readings.calibrated,
        processed: readings.processed,
        heading: readings.heading,
      };

      sendWebSocketMessage({
        type: "magnetometer-data",
        data,
      });
    }, 100);
  }

  return Response.json({});
}
