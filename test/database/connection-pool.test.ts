import { ConnectionPool } from '../../src/database/connection-pool';

describe('ConnectionPool', () => {
  let pool: ConnectionPool;

  beforeEach(() => {
    pool = new ConnectionPool({
      user: 'myuser',
      password: 'mypassword',
      host: 'localhost',
      port: 5432,
      database: 'clawchain'
    });
  });

  afterEach(async () => {
    await pool.end();
  });

  it('should get a connection from the pool', async () => {
    const conn = await pool.getConnection();
    expect(conn).toBeDefined();
    conn.release();
  });

  it('should execute a query using the pool', async () => {
    const result = await pool.query('SELECT 1 AS one');
    expect(result.rows[0].one).toBe(1);
  });
});