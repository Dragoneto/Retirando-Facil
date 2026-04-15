require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Erro ao conectar ao banco de dados', err.stack);
  }
  client.release();
  console.log('Conexão com o PostgreSQL estabelecida com sucesso!');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};