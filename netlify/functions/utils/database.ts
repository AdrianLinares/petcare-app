import pg from 'pg';

const { Pool } = pg;

// Singleton pool instance
let pool: pg.Pool | null = null;

export const getPool = () => {
  if (!pool) {
    // Support both DATABASE_URL (production) and individual vars (development)
    const poolConfig = process.env.DATABASE_URL
      ? {
          connectionString: process.env.DATABASE_URL,
          ssl: {
            rejectUnauthorized: false,
          },
        }
      : {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432'),
          database: process.env.DB_NAME || 'petcare_db',
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD,
        };

    pool = new Pool({
      ...poolConfig,
      max: 10, // Lower for serverless
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }

  return pool;
};

export const query = async (text: string, params?: any[]) => {
  const pool = getPool();
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};
