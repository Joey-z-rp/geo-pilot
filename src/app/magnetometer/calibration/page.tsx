"use client";

import { useEffect } from "react";
import useWebSocket from "react-use-websocket";

export default function Calibration() {
  const { lastJsonMessage } = useWebSocket("ws://localhost:8001");

  useEffect(() => {
    fetch("/api/magnetometer/calibration");
  }, []);

  return (
    <div>
      <h1>Calibration</h1>
      <code>{JSON.stringify(lastJsonMessage)}</code>
    </div>
  );
}
