export class Peer {
  public id: string;
  public address: string;
  public reputation: number;

  constructor(id: string, address: string) {
    this.id = id;
    this.address = address;
    this.reputation = 100; // Start with a neutral reputation
  }

  // Methods to track peer behavior and update reputation
  reportMisbehavior() {
    this.reputation -= 10;
  }

  reportGoodBehavior() {
    this.reputation += 5;
  }

  isBanned(): boolean {
    return this.reputation < 0;
  }
}