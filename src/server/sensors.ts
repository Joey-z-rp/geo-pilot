import * as i2c from "i2c-bus";
import { getMagnetometer } from "./magnetometer";
import { Neo6m } from "./gps";
import { geAccelAndGyro } from "./accel-gyro";

const i2cBusOne = i2c.openSync(1);
const i2cBusZero = i2c.openSync(0);

export const mainMagnetometer = getMagnetometer(i2cBusOne);

export const motorMagnetometer = getMagnetometer(i2cBusZero);

export const accelAndGyro = geAccelAndGyro(i2cBusOne);

export const gps = new Neo6m();
