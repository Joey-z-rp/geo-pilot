"use client";

import Plot from "react-plotly.js";
import { WebSocketMessage } from "@/shared/web-socket/messages";
import { useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

const connectionStatus = {
  [ReadyState.UNINSTANTIATED]: "uninstantiated",
  0: "Connecting",
  1: "OPEN",
  2: "CLOSING",
  3: "CLOSED",
};

export default function Calibration() {
  const { lastJsonMessage, readyState } = useWebSocket(
    `ws://${global?.location?.hostname}:8001`,
    { retryOnError: true }
  );
  const [dataPoints, setDataPoints] = useState({
    x: [0],
    y: [0],
    z: [0],
  });

  useEffect(() => {
    const data = (lastJsonMessage as WebSocketMessage)?.data;
    if (data?.x) {
      setDataPoints((existing) => ({
        x: [...existing.x, data.x!],
        y: [...existing.y, data.y!],
        z: [...existing.z, data.z!],
      }));
    }
  }, [lastJsonMessage]);

  return (
    <div>
      <h1>Calibration</h1>
      <button
        onClick={() => {
          fetch("/api/magnetometer/calibration", {
            method: "POST",
            body: JSON.stringify({ action: "start" }),
          });
        }}
      >
        Start
      </button>
      <button
        onClick={() => {
          fetch("/api/magnetometer/calibration", {
            method: "POST",
            body: JSON.stringify({ action: "stop" }),
          });
        }}
      >
        Stop
      </button>
      <div>
        x: {dataPoints.x[dataPoints.x.length - 1]}
        y: {dataPoints.y[dataPoints.y.length - 1]}
        z: {dataPoints.z[dataPoints.z.length - 1]}
      </div>
      <div>{connectionStatus[readyState]}</div>
      <Plot
        data={[
          {
            ...dataPoints,
            mode: "markers" as const,
            marker: {
              size: 5,
              line: {
                color: "rgba(217, 217, 217, 0.14)",
                width: 0.5,
              },
              opacity: 0.8,
            },
            type: "scatter3d" as const,
          },
        ]}
        layout={{
          margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 0,
          },
        }}
      />
    </div>
  );
}
