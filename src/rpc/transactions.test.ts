import { getSignaturesForAddress, GetSignaturesForAddressParams, SignatureInfo } from "./transactions";
import { TransactionsDb } from "../state/transactions_db";
import { mockAddress, mockSignature } from "../test_utils";

jest.mock("../state/transactions_db");

describe("getSignaturesForAddress", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return signatures for an address", async () => {
    const mockSignatures: TransactionSignature[] = [
      { signature: mockSignature(1), slot: 100, blockTime: 1234 },
      { signature: mockSignature(2), slot: 101, blockTime: 1235 },
      { signature: mockSignature(3), slot: 102, blockTime: 1236 }
    ];

    (TransactionsDb.prototype.getSignaturesForAddress as jest.Mock).mockResolvedValue(mockSignatures);

    const params: GetSignaturesForAddressParams = {
      address: mockAddress()
    };
    const result = await getSignaturesForAddress(params);

    expect(TransactionsDb.prototype.getSignaturesForAddress).toHaveBeenCalledWith(
      params.address,
      { limit: 20, before: undefined, until: undefined }
    );
    expect(result).toEqual([
      { signature: mockSignature(1), slot: 100, blockTime: 1234 },
      { signature: mockSignature(2), slot: 101, blockTime: 1235 },
      { signature: mockSignature(3), slot: 102, blockTime: 1236 }
    ]);
  });

  it("should handle pagination parameters", async () => {
    const mockSignatures: TransactionSignature[] = [
      { signature: mockSignature(1), slot: 100, blockTime: 1234 },
      { signature: mockSignature(2), slot: 101, blockTime: 1235 },
      { signature: mockSignature(3), slot: 102, blockTime: 1236 }
    ];

    (TransactionsDb.prototype.getSignaturesForAddress as jest.Mock).mockResolvedValue(mockSignatures);

    const params: GetSignaturesForAddressParams = {
      address: mockAddress(),
      limit: 2,
      before: mockSignature(2),
      until: mockSignature(3)
    };
    const result = await getSignaturesForAddress(params);

    expect(TransactionsDb.prototype.getSignaturesForAddress).toHaveBeenCalledWith(
      params.address,
      { limit: 2, before: params.before, until: params.until }
    );
    expect(result).toEqual([
      { signature: mockSignature(1), slot: 100, blockTime: 1234 },
      { signature: mockSignature(2), slot: 101, blockTime: 1235 }
    ]);
  });
});