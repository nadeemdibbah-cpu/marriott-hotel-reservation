const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'marriott_user',
  password: process.env.DB_PASSWORD || 'marriott_password',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'marriott_reservation'
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  connect: () => {
    return new Promise((resolve, reject) => {
      pool.connect((err, client, release) => {
        if (err) {
          reject(err);
        } else {
          release();
          resolve();
        }
      });
    });
  },
  pool
};
