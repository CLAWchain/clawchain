export class Node {
  id: string;
  address: string;
  port: number;

  constructor(id: string, address: string, port: number) {
    this.id = id;
    this.address = address;
    this.port = port;
  }
}