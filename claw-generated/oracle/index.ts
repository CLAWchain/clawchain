// Oracle module
import { keccak256 } from 'js-sha3';

export class Oracle {
  private requests: Map<string, OracleRequest> = new Map();

  requestData(dataSource: string, params: any): string {
    const requestId = this.generateRequestId();
    this.requests.set(requestId, {
      dataSource,
      params,
      commitHash: '',
      revealData: '',
      fulfilled: false
    });
    return requestId;
  }

  commitData(requestId: string, commitHash: string): void {
    const request = this.requests.get(requestId);
    if (request) {
      request.commitHash = commitHash;
    }
  }

  revealData(requestId: string, data: any): boolean {
    const request = this.requests.get(requestId);
    if (request) {
      const expectedHash = keccak256(JSON.stringify(data));
      if (expectedHash === request.commitHash) {
        request.revealData = data;
        request.fulfilled = true;
        return true;
      }
    }
    return false;
  }

  private generateRequestId(): string {
    return 'request-' + Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}

interface OracleRequest {
  dataSource: string;
  params: any;
  commitHash: string;
  revealData: any;
  fulfilled: boolean;
}