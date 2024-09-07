"use client";

import Plot from "react-plotly.js";
import { WebSocketMessage } from "@/shared/web-socket/messages";
import { useEffect, useRef, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

const MAX_CHART_DATA_POINTS = 100;

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
    raw: {
      x: [0],
      y: [0],
      z: [0],
    },
    calibrated: {
      x: [0],
      y: [0],
      z: [0],
    },
    heading: 0,
  });
  const timeRef = useRef([0]);

  useEffect(() => {
    const data = (lastJsonMessage as WebSocketMessage)?.data;
    if (data?.raw.x) {
      setDataPoints((existing) => ({
        raw: {
          x: [...existing.raw.x, data.raw.x!],
          y: [...existing.raw.y, data.raw.y!],
          z: [...existing.raw.z, data.raw.z!],
        },
        calibrated: {
          x: [...existing.calibrated.x, data.calibrated.x!],
          y: [...existing.calibrated.y, data.calibrated.y!],
          z: [...existing.calibrated.z, data.calibrated.z!],
        },
        heading: data.heading!,
      }));
      timeRef.current.push(timeRef.current[timeRef.current.length - 1] + 1);
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
        x: {Math.round(dataPoints.raw.x[dataPoints.raw.x.length - 1])}
        y: {Math.round(dataPoints.raw.y[dataPoints.raw.y.length - 1])}
        z: {Math.round(dataPoints.raw.z[dataPoints.raw.z.length - 1])}
      </div>
      <div>Heading: {dataPoints.heading}</div>
      <div>{connectionStatus[readyState]}</div>
      <Plot
        data={[
          {
            ...dataPoints.raw,
            mode: "markers" as const,
            marker: {
              size: 5,
              line: {
                color: "rgba(217, 217, 217, 0.14)",
                width: 0.5,
              },
              opacity: 0.5,
            },
            type: "scatter3d" as const,
            name: "Raw",
          },
          {
            ...dataPoints.calibrated,
            mode: "markers" as const,
            marker: {
              size: 5,
              line: {
                color: "red",
                width: 0.5,
              },
              opacity: 0.8,
            },
            type: "scatter3d" as const,
            name: "Calibrated",
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
      <Plot
        data={[
          {
            x: timeRef.current.slice(-MAX_CHART_DATA_POINTS),
            y: dataPoints.calibrated.x.slice(-MAX_CHART_DATA_POINTS),
            mode: "lines",
            name: "X",
          },
          {
            x: timeRef.current.slice(-MAX_CHART_DATA_POINTS),
            y: dataPoints.calibrated.y.slice(-MAX_CHART_DATA_POINTS),
            mode: "lines",
            name: "Y",
          },
          {
            x: timeRef.current.slice(-MAX_CHART_DATA_POINTS),
            y: dataPoints.calibrated.z.slice(-MAX_CHART_DATA_POINTS),
            mode: "lines",
            name: "Z",
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
