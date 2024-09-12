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

const initialState = {
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
  processed: {
    x: [0],
    y: [0],
    z: [0],
  },
  heading: 0,
};

const calculateVariance = (values: number[]) => {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const squaredDifferences = values.map((value) => Math.pow(value - mean, 2));

  return (
    squaredDifferences.reduce((sum, value) => sum + value, 0) / values.length
  );
};

export default function Calibration() {
  const { lastJsonMessage, readyState } = useWebSocket(
    `ws://${global?.location?.hostname}:8001`,
    { retryOnError: true }
  );
  const [dataPoints, setDataPoints] = useState(initialState);
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
        processed: {
          x: [...existing.processed.x, data.processed.x!],
          y: [...existing.processed.y, data.processed.y!],
          z: [...existing.processed.z, data.processed.z!],
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
      <button onClick={() => setDataPoints(initialState)}>Clear</button>
      <div>
        x: {Math.round(dataPoints.raw.x[dataPoints.raw.x.length - 1])} y:{" "}
        {Math.round(dataPoints.raw.y[dataPoints.raw.y.length - 1])} z:{" "}
        {Math.round(dataPoints.raw.z[dataPoints.raw.z.length - 1])}
      </div>
      <div>
        x calibrated: {Math.round(dataPoints.calibrated.x[dataPoints.calibrated.x.length - 1])} y calibrated:{" "}
        {Math.round(dataPoints.calibrated.y[dataPoints.calibrated.y.length - 1])} z calibrated:{" "}
        {Math.round(dataPoints.calibrated.z[dataPoints.calibrated.z.length - 1])}
      </div>
      <div>
        X variance: {calculateVariance(dataPoints.calibrated.x.slice(1))} Y variance:{" "}
        {calculateVariance(dataPoints.calibrated.y.slice(1))} Z variance:{" "}
        {calculateVariance(dataPoints.calibrated.z.slice(1))}
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
          {
            x: timeRef.current.slice(-MAX_CHART_DATA_POINTS),
            y: dataPoints.processed.x.slice(-MAX_CHART_DATA_POINTS),
            mode: "lines",
            name: "Processed X",
          },
          {
            x: timeRef.current.slice(-MAX_CHART_DATA_POINTS),
            y: dataPoints.processed.y.slice(-MAX_CHART_DATA_POINTS),
            mode: "lines",
            name: "Processed Y",
          },
          {
            x: timeRef.current.slice(-MAX_CHART_DATA_POINTS),
            y: dataPoints.processed.z.slice(-MAX_CHART_DATA_POINTS),
            mode: "lines",
            name: "Processed Z",
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
