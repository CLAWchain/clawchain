export class Event {
  constructor(
    public contractAddress: string,
    public name: string,
    public indexedParams: any[],
    public unindexedParams: any[]
  ) {}
}