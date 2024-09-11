export class OneDimentionalKalmanFilter {
  private processNoise: number;

  private processError: number;

  private measurementNoise: number;

  private estimate: number;

  constructor({
    initialEstimate,
    initialProcessError,
    processNoise,
    measurementNoise,
  }: {
    initialEstimate: number;
    initialProcessError: number;
    processNoise: number;
    measurementNoise: number;
  }) {
    this.processError = initialProcessError;
    this.processNoise = processNoise;
    this.measurementNoise = measurementNoise;
    this.estimate = initialEstimate;
  }

  private predict() {
    /**
     * The assumption is that the reading will not change dramatically so
     * this.estimate = this.estimate
     */
    this.processError = this.processError + this.processNoise;
  }

  private update(measurement: number) {
    const kalmanGain =
      this.processError / (this.processError + this.measurementNoise);

    this.estimate = this.estimate + kalmanGain * (measurement - this.estimate);

    this.processError = (1 - kalmanGain) * this.processError;
  }

  process(measurement: number) {
    this.predict();
    this.update(measurement);
    return this.estimate;
  }
}
