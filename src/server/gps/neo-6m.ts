import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import GPS from "gps";

export class Neo6m {
  private port: SerialPort;

  private parser: ReadlineParser;

  private gps: GPS;

  constructor() {
    this.port = new SerialPort({ path: "/dev/ttyS0", baudRate: 9600 });
    this.parser = this.port.pipe(new ReadlineParser({ delimiter: "\r\n" }));
    this.gps = new GPS();
    this.parser.on("data", (data) => this.gps.update(data));
  }

  getGpsState() {
    return this.gps.state;
  }
}
