export type WebSocketMessage = {
  type: "magnetometer-data";
  data: {
    raw: {
      x?: number;
      y?: number;
      z?: number;
    };
    calibrated: {
      x?: number;
      y?: number;
      z?: number;
    };
    heading?: number;
  };
};
