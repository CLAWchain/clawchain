import OracleManager from './OracleManager';

class OracleSystem {
  private oracleManager: OracleManager;

  constructor() {
    this.oracleManager = new OracleManager();
  }

  public async handleOracleRequest(requestId: string, data: string, revealTimestamp: number): Promise<void> {
    await this.oracleManager.commitData(requestId, data, revealTimestamp);
  }

  public async handleOracleReveal(requestId: string, data: string): Promise<boolean> {
    return await this.oracleManager.revealData(requestId, data);
  }
}

export default OracleSystem;