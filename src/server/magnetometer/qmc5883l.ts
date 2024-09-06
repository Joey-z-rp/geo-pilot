import * as i2c from "i2c-bus";

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

const DEFAULT_OVERSAMPLING = 64;
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

export class QMC5883L {
  private i2cBus: i2c.I2CBus;

  constructor({ i2cBusNumber }: { i2cBusNumber: number }) {
    this.i2cBus = i2c.openSync(i2cBusNumber);

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

  isReady() {
    const status = this.i2cBus.readByteSync(QMC5883L_ADDR, QMC5883L_STATUS);
    return !!(status & QMC5883L_STATUS_DRDY);
  }
}
