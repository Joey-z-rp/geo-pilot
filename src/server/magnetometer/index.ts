import { calibrationData } from "./calibration-data";

export const magnetometer =
  process.platform === "darwin"
    ? {
        getHeading: () => ({
          raw: {
            x: Math.random() * 10000,
            y: Math.random() * 10000,
            z: Math.random() * 10000,
          },
          calibrated: {
            x: Math.random() * 10000,
            y: Math.random() * 10000,
            z: Math.random() * 10000,
          },
          heading: 10,
        }),
      }
    : new (require("./qmc5883l").QMC5883L)({
        i2cBusNumber: 1,
        calibrationData,
      });
