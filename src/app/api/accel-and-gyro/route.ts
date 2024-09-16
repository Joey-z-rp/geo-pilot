import { accelAndGyro } from "@/server/sensors";

let timer: NodeJS.Timeout;

export async function GET() {
  if (timer) {
    clearInterval(timer);
  }

  timer = setInterval(() => {
    const readings = accelAndGyro.getReadings();
    console.log(readings);
  }, 100);

  return Response.json({});
}
