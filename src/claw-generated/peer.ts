export class Peer {
  public id: string;
  public address: string;
  public port: number;

  constructor(id: string, address: string, port: number) {
    this.id = id;
    this.address = address;
    this.port = port;
  }

  toString() {
    return `${this.address}:${this.port}`;
  }
}