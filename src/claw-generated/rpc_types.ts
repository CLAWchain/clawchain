export interface GetSignaturesForAddressParams {
  address: string;
  limit?: number;
  before?: string;
  until?: string;
}

export interface GetSignaturesForAddressResult {
  signatures: string[];
  before: string | null;
  until: string | null;
}