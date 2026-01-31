class ReadWriteLock {
  private readLocks: number = 0;
  private writeLocks: number = 0;
  private waitingWriters: number = 0;

  async readLock(): Promise<void> {
    while (this.waitingWriters > 0 || this.writeLocks > 0) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    this.readLocks++;
  }

  readUnlock(): void {
    this.readLocks--;
  }

  async writeLock(): Promise<void> {
    this.waitingWriters++;
    while (this.readLocks > 0 || this.writeLocks > 0) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    this.waitingWriters--;
    this.writeLocks++;
  }

  writeUnlock(): void {
    this.writeLocks--;
  }
}

export { ReadWriteLock };