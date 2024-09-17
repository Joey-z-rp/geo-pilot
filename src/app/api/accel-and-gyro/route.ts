import { accelAndGyro, mainMagnetometer } from "@/server/sensors";

let timer: NodeJS.Timeout;

export async function GET() {
  if (timer) {
    clearInterval(timer);
  }

  timer = setInterval(() => {
    const readings = accelAndGyro.getReadings();
    const magReadings = mainMagnetometer.getHeading();
    console.log(readings, magReadings);
  }, 100);

  return Response.json({});
}
