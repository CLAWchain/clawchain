import { databasePool } from './DatabaseConnectionPool';

export const db = {
  exec: async (sql: string): Promise<void> => {
    await databasePool.exec(sql);
  },

  query: async (text: string, params: any[] = []): Promise<{ rows: any[]; rowCount?: number }> => {
    return await databasePool.query(text, params);
  },

  connect: async (): Promise<boolean> => {
    return await databasePool.connect();
  },

  end: async (): Promise<void> => {
    await databasePool.end();
  }
};

export const cache = {
  // Redis cache helper methods
};

export const chainState = {
  // Chain state persistence helper methods
};