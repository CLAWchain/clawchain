export class Transaction {
  private inputs: any[];
  private outputs: any[];
  private size: number;

  constructor(inputs: any[], outputs: any[], size: number) {
    this.inputs = inputs;
    this.outputs = outputs;
    this.size = size;
  }

  calculateFee(): number {
    const BASE_FEE = 0.01;
    const INPUT_FEE = 0.001;
    const OUTPUT_FEE = 0.001;
    const SIZE_FEE = 0.00001;

    let fee = BASE_FEE;
    fee += this.inputs.length * INPUT_FEE;
    fee += this.outputs.length * OUTPUT_FEE;
    fee += this.size * SIZE_FEE;

    return fee;
  }
}