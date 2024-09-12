// Based on https://github.com/mrstas/compass-QMC5883L

import * as i2c from "i2c-bus";
import * as math from "mathjs";
import { OneDimentionalKalmanFilter } from "../utils/kalman-filters/1-d-kalman-filter";

const QMC5883L_ADDR = 0x0d;

/* Register numbers */
const QMC5883L_X_LSB = 0;
const QMC5883L_X_MSB = 1;
const QMC5883L_Y_LSB = 2;
const QMC5883L_Y_MSB = 3;
const QMC5883L_Z_LSB = 4;
const QMC5883L_Z_MSB = 5;
const QMC5883L_STATUS = 6;
const QMC5883L_TEMP_LSB = 7;
const QMC5883L_TEMP_MSB = 8;
const QMC5883L_CONFIG = 9;
const QMC5883L_CONFIG2 = 10;
const QMC5883L_RESET = 11;
const QMC5883L_RESERVED = 12;
const QMC5883L_CHIP_ID = 13;

/* Bit values for the STATUS register */
const QMC5883L_STATUS_DRDY = 1;
const QMC5883L_STATUS_OVL = 2;
const QMC5883L_STATUS_DOR = 4;

/* Mode values for the CONFIG register */
const QMC5883L_CONFIG_STANDBY = 0b00000000;
const QMC5883L_CONFIG_CONT = 0b00000001;

const DEFAULT_OVERSAMPLING = 128;
const oversamplingMap = {
  512: 0b00000000,
  256: 0b01000000,
  128: 0b10000000,
  64: 0b11000000,
};

const DEFAULT_SAMPLE_RATE = "10HZ";
const sampleRateMap = {
  "10HZ": 0b00000000,
  "50HZ": 0b00000100,
  "100HZ": 0b00001000,
  "200HZ": 0b00001100,
};

const DEFAULT_SCALE = "2G";
const scaleMap = {
  "2G": 0b00000000,
  "8G": 0b00010000,
};

const twosComplement = (value: number, bits: number) => {
  if ((value & (1 << (bits - 1))) !== 0) {
    return value - (1 << bits);
  }
  return value;
};

type CalibrationData = {
  transformationMatrix: [number[], number[], number[]];
  bias: number[];
  variances: {
    x: number;
    y: number;
    z: number;
  };
};
export class QMC5883L {
  private i2cBus: i2c.I2CBus;

  private calibrationData: CalibrationData;

  private declination: number;

  private initialVectorLength: number | undefined;

  private xFilter: OneDimentionalKalmanFilter;

  private yFilter: OneDimentionalKalmanFilter;

  private zFilter: OneDimentionalKalmanFilter;

  constructor({
    i2cBusNumber,
    calibrationData,
    declination,
  }: {
    i2cBusNumber: number;
    calibrationData: CalibrationData;
    declination: number;
  }) {
    this.i2cBus = i2c.openSync(i2cBusNumber);
    this.calibrationData = calibrationData;
    this.declination = declination;
    this.initialVectorLength = undefined;
    this.xFilter = new OneDimentionalKalmanFilter({
      initialEstimate: 0,
      initialProcessError: 1,
      processNoise: 1000000,
      measurementNoise: Math.pow(calibrationData.variances.x, 2),
    });
    this.yFilter = new OneDimentionalKalmanFilter({
      initialEstimate: 0,
      initialProcessError: 1,
      processNoise: 1000000,
      measurementNoise: Math.pow(calibrationData.variances.y, 2),
    });
    this.zFilter = new OneDimentionalKalmanFilter({
      initialEstimate: 0,
      initialProcessError: 1,
      processNoise: 1000000,
      measurementNoise: Math.pow(calibrationData.variances.z, 2),
    });

    try {
      this.i2cBus.receiveByteSync(QMC5883L_ADDR);
    } catch (e) {
      throw new Error("Compass: no device found ");
    }

    //reset compass
    this.i2cBus.writeByteSync(QMC5883L_ADDR, QMC5883L_RESET, 0x01);
    // set working parameters
    this.i2cBus.writeByteSync(
      QMC5883L_ADDR,
      QMC5883L_CONFIG,
      oversamplingMap[DEFAULT_OVERSAMPLING] |
        scaleMap[DEFAULT_SCALE] |
        sampleRateMap[DEFAULT_SAMPLE_RATE] |
        QMC5883L_CONFIG_CONT
    );
  }

  getRawValues() {
    if (!this.isReady()) return {};

    const BUFFER_LEN = 6;
    const buffer = Buffer.alloc(BUFFER_LEN);
    this.i2cBus.readI2cBlockSync(
      QMC5883L_ADDR,
      QMC5883L_X_LSB,
      BUFFER_LEN,
      buffer
    );
    const read = (offset: number) =>
      twosComplement((buffer[offset + 1] << 8) | buffer[offset], 16);

    return {
      x: read(0),
      y: read(2),
      z: read(4),
    };
  }

  stablise([x, y, z]: [number, number, number]) {
    if (this.initialVectorLength === undefined) {
      this.initialVectorLength = Math.sqrt(x * x + y * y + z * z);
    }
    const currentVectorLength = Math.sqrt(x * x + y * y + z * z);
    const factor = this.initialVectorLength / currentVectorLength;

    return { x: x * factor, y: y * factor, z: z * factor };
  }

  getProcessedValues() {
    const rawValues = this.getRawValues();
    const rawValueArray = Object.values(rawValues) as number[];
    const subtractedBias = math.subtract(
      rawValueArray,
      this.calibrationData.bias
    );
    const calibrated = this.stablise(
      math.multiply(
        this.calibrationData.transformationMatrix,
        subtractedBias
      ) as [number, number, number]
    );

    return {
      raw: rawValues,
      calibrated,
      processed: {
        x: this.xFilter.process(calibrated.x),
        y: this.yFilter.process(calibrated.y),
        z: this.zFilter.process(calibrated.z),
      },
    };
  }

  getHeading() {
    const data = this.getProcessedValues();
    const azimuth =
      (Math.atan2(data.processed.y, data.processed.x) * 180) / Math.PI;
    const heading = (azimuth + this.declination + 360) % 360;

    return {
      ...data,
      heading,
    };
  }

  isReady() {
    const status = this.i2cBus.readByteSync(QMC5883L_ADDR, QMC5883L_STATUS);
    return !!(status & QMC5883L_STATUS_DRDY);
  }
}
