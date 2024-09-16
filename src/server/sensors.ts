import * as i2c from "i2c-bus";
import { getMagnetometer } from "./magnetometer";
import { Neo6m } from "./gps";
import { geAccelAndGyro } from "./accelerometer-gyroscope";

const i2cBusOne = i2c.openSync(1);

export const magnetometer = getMagnetometer(i2cBusOne);

export const accelAndGyro = geAccelAndGyro(i2cBusOne);

export const gps = new Neo6m();
