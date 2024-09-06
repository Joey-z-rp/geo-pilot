import { QMC5883L } from "./qmc5883l";

export const magnetometer = new QMC5883L({ i2cBusNumber: 1 });
