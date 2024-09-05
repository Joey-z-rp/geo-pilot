export const test = () => {
  const compass = require("./index.js");

  const offset = {
    x: 0,
    y: 0,
    z: 0,
  };

  const scale = {
    x: 1,
    y: 1,
    z: 1,
  };

  const precision = 2;

  compass.setOffsetMatrix(offset.x, offset.y, offset.z);
  compass.setScaleMatrix(scale.x, scale.y, scale.z);

  //apply the local declination angle correction
  //values for Tarnowskie Gory, Poland: 5 degrees, 1 minute
  //taken from: http://magnetic-declination.com/
  //formula: declinationAngle = (degrees + (minutes / 60.0)) / (180 / PI);
  const declinationAngle = (5.0 + 1.0 / 60.0) / (180 / Math.PI);
  compass.setDeclinationAngle(declinationAngle);

  console.log("Declination angle correction: " + declinationAngle);
  console.log("Scale matrix: " + JSON.stringify(scale));
  console.log("Offset matrix: " + JSON.stringify(offset));
  console.log("Precision (digits after comma): " + precision);

  if (compass.initialize()) {
    setInterval(function () {
      console.log("Azimuth: " + compass.readAzimuth().toFixed(precision));
    }, 500);
  }
};
