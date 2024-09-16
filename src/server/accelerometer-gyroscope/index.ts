import { I2CBus } from "i2c-bus";

export const geAccelAndGyro = (i2cBus: I2CBus) =>
  process.platform === "darwin"
    ? {
        getReadings: () => ({
          gyroscope: {
            x: Math.random() * 10,
            y: Math.random() * 10,
            z: Math.random() * 10,
          },
          accelerometer: {
            x: Math.random() * 10,
            y: Math.random() * 10,
            z: Math.random() * 10,
          },
          temperature: Math.random() * 10,
        }),
      }
    : new (require("./mpu6050").MPU6050)({
        i2cBus,
      });
