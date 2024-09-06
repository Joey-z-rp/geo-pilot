export type WebSocketMessage = {
  type: "magnetometer-data";
  data: {
    x: number;
    y: number;
    z: number;
  };
};
