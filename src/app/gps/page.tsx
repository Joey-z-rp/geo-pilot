"use client";

export default function Gps() {
  return (
    <div>
      <h1>GPS</h1>
      <button
        onClick={() => {
          fetch("/api/gps");
        }}
      >
        Start
      </button>
    </div>
  );
}
