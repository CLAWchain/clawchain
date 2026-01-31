export class Contract {
  address: string;
  bytecode: string;

  constructor(address: string, bytecode: string) {
    this.address = address;
    this.bytecode = bytecode;
  }
}