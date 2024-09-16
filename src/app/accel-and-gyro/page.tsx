"use client";

export default function AccelAndGyro() {
  return (
    <div>
      <h1>Accelerometer and gyroscope</h1>
      <button
        onClick={() => {
          fetch("/api/accel-and-gyro");
        }}
      >
        Start
      </button>
    </div>
  );
}
