import { gps } from "@/server/sensors";

let timer: NodeJS.Timeout;

export async function GET() {
  if (timer) {
    clearInterval(timer);
  }

  timer = setInterval(() => {
    const state = gps.getGpsState();
    console.log(state);
  }, 500);

  return Response.json({});
}
