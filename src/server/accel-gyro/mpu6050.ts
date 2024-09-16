// Based on https://github.com/emersion/node-i2c-mpu6050

import { I2CBus } from "i2c-bus";

const I2C_address = 0x68;

// Register addresses
const POWER_MANAGEMENT = 0x6b;
const ACCEL_X_OUTPUT = 0x3b;
const ACCEL_Y_OUTPUT = 0x3d;
const ACCEL_Z_OUTPUT = 0x3f;
const TEMPERATURE_OUTPUT = 0x41;
const GYRO_X_OUTPUT = 0x43;
const GYRO_Y_OUTPUT = 0x45;
const GYRO_Z_OUTPUT = 0x47;

const ACCEL_LSB_SENSITIVITY = 16384;
const GYRO_LSB_SENSITIVITY = 131;

export class MPU6050 {
  private i2cBus: I2CBus;

  constructor({ i2cBus }: { i2cBus: I2CBus }) {
    this.i2cBus = i2cBus;
    // Wake the MPU6050 up as it starts in sleep mode
    this.i2cBus.writeByteSync(I2C_address, POWER_MANAGEMENT, 0);
  }

  private read(command: number) {
    const high = this.i2cBus.readByteSync(I2C_address, command);
    const low = this.i2cBus.readByteSync(I2C_address, command + 1);
    const value = (high << 8) + low;

    if (value >= 0x8000) {
      return -(65535 - value + 1);
    } else {
      return value;
    }
  }

  private scale(data: { x: number; y: number; z: number }, factor: number) {
    return Object.entries(data).reduce(
      (aggr, [axis, value]) => ({ ...aggr, [axis]: value / factor }),
      {}
    );
  }

  private readGyroscope() {
    const data = {
      x: this.read(GYRO_X_OUTPUT),
      y: this.read(GYRO_Y_OUTPUT),
      z: this.read(GYRO_Z_OUTPUT),
    };
    return this.scale(data, GYRO_LSB_SENSITIVITY);
  }

  private readAccelerometer() {
    const data = {
      x: this.read(ACCEL_X_OUTPUT),
      y: this.read(ACCEL_Y_OUTPUT),
      z: this.read(ACCEL_Z_OUTPUT),
    };
    return this.scale(data, ACCEL_LSB_SENSITIVITY);
  }

  private readTemperature() {
    return this.read(TEMPERATURE_OUTPUT) / 340 + 36.53;
  }

  getReadings() {
    return {
      gyroscope: this.readGyroscope(),
      accelerometer: this.readAccelerometer(),
      temperature: this.readTemperature(),
    };
  }
}
