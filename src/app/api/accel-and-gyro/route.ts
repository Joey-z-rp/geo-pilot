import { accelAndGyro, magnetometer } from "@/server/sensors";

let timer: NodeJS.Timeout;

export async function GET() {
  if (timer) {
    clearInterval(timer);
  }

  timer = setInterval(() => {
    const readings = accelAndGyro.getReadings();
    const magReadings = magnetometer.getHeading();
    console.log(readings, magReadings);
  }, 100);

  return Response.json({});
}
