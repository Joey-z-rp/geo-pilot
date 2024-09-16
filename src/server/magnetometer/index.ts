import { I2CBus } from "i2c-bus";
import { calibrationData } from "./calibration-data";

export const getMagnetometer = (i2cBus: I2CBus) =>
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
          processed: {
            x: Math.random() * 10000,
            y: Math.random() * 10000,
            z: Math.random() * 10000,
          },
          heading: 10,
        }),
      }
    : new (require("./qmc5883l").QMC5883L)({
        i2cBus,
        calibrationData,
        declination: 11.13,
      });
