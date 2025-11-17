import pg from 'pg';

const { Pool } = pg;

// Singleton pool instance
let pool: pg.Pool | null = null;

export const getPool = () => {
  if (!pool) {
    console.log('Initializing database connection pool...');

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
        password: String(process.env.DB_PASSWORD || ''),
      };

    console.log('Database config:', {
      hasConnectionString: !!process.env.DATABASE_URL,
      host: poolConfig.connectionString ? 'Using connection string' : poolConfig.host,
      database: poolConfig.connectionString ? 'Using connection string' : poolConfig.database,
    });

    pool = new Pool({
      ...poolConfig,
      max: 5, // Reduced for serverless (Neon has connection limits)
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000, // Increased timeout for cold starts
    });

    // Add error handler for pool
    pool.on('error', (err) => {
      console.error('Unexpected database pool error:', err);
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
