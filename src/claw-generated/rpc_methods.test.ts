import { MemoryStore } from "./memory-store";
import { VM } from "./vm";
import { simulate_transaction } from "./rpc_methods";

describe("RPC Methods", () => {
  it("should simulate a transaction", async () => {
    const store = new MemoryStore();
    const vm = new VM();

    // Create a sample transaction
    const tx = "..."; // Encoded transaction string

    // Simulate the transaction
    const [receipt, computeUnits] = await simulate_transaction(store, vm, tx);

    // Verify the results
    expect(receipt.logs).toEqual(expect.arrayContaining(["Log 1", "Log 2"]));
    expect(computeUnits).toBeGreaterThan(0);
  });
});